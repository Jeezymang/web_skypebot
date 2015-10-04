//Config Variables
var steamAPIKey = "";
var STEAM_USERNAME = "";
var STEAM_PASSWORD = "";
var TWITCH_USERNAME = "";
var TWITCH_OAUTH = "";
var SERVER_KEY = "AWmga7KhSnzs4qke";
var SERVER_URL = "example.com";
//////////////////////////////

var express = require("express");
var Steam = require('steam');
var qs = require("querystring");
var util = require("util");
var events = require("events");
var http = require("http");
var LuaVM = require("lua.vm.js");
var irc = require('irc');

var domain = require("domain").create();
var luaState = new LuaVM.Lua.State();
var initialLua = " \
_GReturnString = '' \
function print(...) \
  _GReturnString = _GReturnString .. (...) \
end \
local st = os.clock() \
function runtime_check() \
  if(os.clock() - st > 5) then \
    debug.sethook() \
    error('Lua Runtime Exceeded > 5s') \
  end \
end \
debug.sethook(runtime_check, '', 100000)";
var printReturnLua =  " \
local returnString = _GReturnString \
_GReturnString = '' \
return returnString"
luaState.execute(initialLua);

domainWrapper = function(func) {
    return function(req, res) {
        try {
            return func(req, res);
        } catch (err) {
            domain.emit('error', err);
        }
    }
}

var steamPlayers = {};
var communicatePlayers = {};

var app = express()
  , httpapp = express()
  , fs = require('fs')  
  , options = {
    key: fs.readFileSync('./keys/server.key'),
    cert: fs.readFileSync('./keys/server.crt'),
    requestCert: true
}
  , server = require('https').createServer(options, app)  
  , io = require('socket.io').listen(server);


function CommunicateToPlayers(msg) {
  for ( var steam64 in communicatePlayers ) {
    steamFriends.sendMessage(steam64, msg, Steam.EChatEntryType.ChatMsg);
  }
}

function RunLuaCode(code) {
  var codeString = code;
  codeString += " " + printReturnLua;
  var returnValue = "";
  try {
    var returnArray = luaState.execute(codeString);
    if ( returnArray && returnArray.length > 0 )
      returnValue = returnArray[0];
  }
  catch(e) {
    returnValue = e.message;
  }
  io.emit("return_lua", returnValue);
}

function GetPersonaName(steam64, nameCallback) {
  if (!steamPlayers.hasOwnProperty(steam64)) {
    var playerName = "";
    var options = {
        host: "api.steampowered.com",
        path: "/ISteamUser/GetPlayerSummaries/v0002/?key=" + steamAPIKey + "&steamids=" + steam64
    }
    callback = domainWrapper(function(response) {
      var jsonResponse = "";
      response.on("data", function(chunk) {
        jsonResponse += chunk;
      });
      response.on("end", function() {
        jsonResponse = JSON.parse(jsonResponse);
        playerName = jsonResponse.response.players[0].personaname;
        steamPlayers[steam64] = playerName;
        fs.writeFile('players', JSON.stringify(steamPlayers));
        nameCallback(playerName);
      });
      response.on("error", function(err) {
        console.log("SteamAPI Request Failed: " + err.code);
      });
    });
    http.request(options, callback).end();
  }
  else {
    nameCallback(steamPlayers[steam64]);
  }
}

httpapp.get('*',function(req,res){  
});

server.listen(8080, function(){
  console.log("listening on *8080");
});

var connectedToTwitch = false;
var twitchClient = null;
var channelName = "";

io.on('connection', function(socket){
  socket.on("run_lua", function(msg) {
    domainWrapper(RunLuaCode(msg));
  });
  socket.on("steam_message", function(msg) {
    domainWrapper(CommunicateToPlayers(msg));
  });
  socket.on("connect_twitch", function(channel){
    if ( connectedToTwitch )
      return;
    console.log("Attempting to connect to Twitch.");
    connectedToTwitch = true;
    channelName = "#" + channel;
    var client = new irc.Client('irc.twitch.tv', TWITCH_USERNAME, {
        channels: [channelName],
        password: TWITCH_OAUTH
    });
    twitchClient = client;
     client.addListener('registered', function() {
      io.emit("twitch_status", "on");
      console.log("Connected to Twitch.");
    });
    client.addListener('message', function (from, to, message) {
      io.emit("twitch_message", "[" + from + "] " + message );
    });
    client.addListener('error', function(message) {
      io.emit("twitch_status", "off");
      console.log('error: ', message);
    });
  });
  socket.on("disconnect_twitch", function() {
    twitchClient.disconnect(function() {
      console.log("Disconnected from Twitch");
      io.emit("twitch_status", "off");
      connectedToTwitch = false;
    });
  });
  socket.on("twitch_message", function(message) {
    if ( connectedToTwitch ) {
      twitchClient.say(channelName, message);
    }
  });
});

if (fs.existsSync('servers')) {
  Steam.servers = JSON.parse(fs.readFileSync('servers'));
}

if(fs.existsSync('players')) {
  steamPlayers = JSON.parse(fs.readFileSync('players'));
}

var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
var steamFriends = new Steam.SteamFriends(steamClient);

steamClient.on('servers', function(servers) {
  fs.writeFile('servers', JSON.stringify(servers));
});

steamClient.connect();
steamClient.on('connected', function() {
  steamUser.logOn({
    account_name: STEAM_USERNAME,
    password: STEAM_PASSWORD
  });
});

steamClient.on('logOnResponse', function(logonResp) {
  if (logonResp.eresult == Steam.EResult.OK) {
    console.log('Logged in!');
    steamFriends.setPersonaState(Steam.EPersonaState.Online);
    steamFriends.setPersonaName('SkypeBot');
  }
});

steamFriends.on('friend', function(steam64, requestEnum) {
  if ( requestEnum == Steam.EFriendRelationship.RequestRecipient) {
    domainWrapper(GetPersonaName(steam64, domainWrapper(function(playerName) {
      steamFriends.addFriend(steam64);
      console.log(playerName + " has added the Skype Bot.");
    })));
  }
  else if ( requestEnum == Steam.EFriendRelationship.None ) {
    console.log(steamPlayers[steam64] + " has removed the Skype Bot.");
  }
});

steamFriends.on('message', function(source, message, type, chatter) {
  domainWrapper(GetPersonaName(source, domainWrapper(function(playerName) {
    if ( message != "" ) {
      if ( message == "!communicate" ) {
        if ( communicatePlayers.hasOwnProperty(source) ) {
          steamFriends.sendMessage(source, 'Disabling Steam-><-Skype communication.', Steam.EChatEntryType.ChatMsg);
          delete communicatePlayers[source];
        }
        else {
          steamFriends.sendMessage(source, 'Enabling Steam-><-Skype communication.', Steam.EChatEntryType.ChatMsg);
          communicatePlayers[source] = true;
        }
      }
      else if (communicatePlayers.hasOwnProperty(source))
        io.emit('steam_message', "[ " + playerName + " ]: " + message );
    }
  })));
});

domain.on("error", function(err) {
  var errorString = err.message;
  var stackTrace = err.stack;
  var postData = qs.stringify({
    "pass": SERVER_KEY,
    "request_type": "log_node_error",
    "errorMessage": errorString,
    "stackTrace": stackTrace
  });
  var postOptions = {
    host: SERVER_URL,
    port: 80,
    path: "/skypebot.php",
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
    }
  }
  var req = http.request(postOptions, function(response) {
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      setTimeout(process.exit.bind(process, 1), 1000);
    });
  });
  req.write(postData);
  req.end();
});