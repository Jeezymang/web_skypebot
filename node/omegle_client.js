var express = require("express");
var qs = require("querystring");
var util = require("util");
var events = require("events");
var http = require("http");
var omegle = new( require("./lib/omegle").Client );
var domain = require("domain").create();

domainWrapper = function(func) {
    return function(req, res) {
        try {
            return func(req, res);
        } catch (err) {
            domain.emit('error', err);
        }
    }
}

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

function RelayMessage(msg) {
	io.emit("message", msg);
}

var omegleConnected = false;
var attemptingOmegleConnect = false;
var isStrangerConnected = false;

function OmegleConnect(tags) {

	console.log("Connecting to Omegle.");
	RelayMessage("Connecting to Omegle.");
	attemptingOmegleConnect = true;
	domainWrapper(omegle.start(tags, function( e ) {

		if ( e )
			return;
		
		omegleConnected = true;

	}, function(err, isChat) {
		//if ( omegleConnected ) {
			var errMsg = err;
			if ( isChat )
				errMsg = "[Chat-Attempt] " + err;
			console.log(errMsg);
			RelayMessage(errMsg);
			if ( !isChat ) {
				isStrangerConnected = false;
				omegleConnected = false;
				attemptingOmegleConnect = false;
			}
		//}
	}));
}

function OmegleDisconnect() {
	io.emit("omegle_status", "off" );
	console.log("Disconnected from Omegle.");
	RelayMessage("Disconnected from Omegle.");
	domainWrapper(omegle.disconnect());
	isStrangerConnected = false;
	attemptingOmegleConnect = false;
	omegleConnected = false;
}

function OmegleSend(msg) {
	if ( omegleConnected )
		domainWrapper(omegle.send( msg ));
}

omegle.on("waiting", domainWrapper(function() {
	RelayMessage("Connected, waiting for a stranger..." ); 
}));

omegle.on( "connected", domainWrapper(function() {
	isStrangerConnected = true;
	console.log("Stranger connected.");
	RelayMessage("Stranger connected.");
	io.emit("omegle_status", "on" );
}));

omegle.on( "gotMessage", domainWrapper(function(msg) {
	console.log("Stranger: " + msg);
	RelayMessage("Stranger: " + msg);
}));

omegle.on( "strangerDisconnected", domainWrapper(function() {
	isStrangerConnected = false;
	console.log("Stranger disconnected.");
	RelayMessage("Stranger disconnected.");
	OmegleDisconnect();
}));


httpapp.get('*',function(req,res){  
})

server.listen(8080, function(){
	console.log("listening on *8080");
});

io.on('connection', function(socket){
  socket.on("omegle_start", domainWrapper(function(args) {
  	if ( !omegleConnected )
  		OmegleConnect(args);
  	else if ( attemptingOmegleConnect )
  		RelayMessage("Omegle is already trying to connect.");
  	else
  		RelayMessage("Omegle is alreay connected.");
  }));

  socket.on("omegle_end", domainWrapper(function() {
  	if ( omegleConnected )
  		OmegleDisconnect();
  	else
  		RelayMessage("Omegle is not connected.");
  }));
  
  socket.on("omegle_message", domainWrapper(function(msg){
  	if ( omegleConnected && isStrangerConnected ) {
  		console.log("[Omegle] " + msg );
  		OmegleSend(msg);
  	}
  }));
});

domain.on("error", function(err) {
  var errorString = err.message;
  var stackTrace = err.stack;
  var postData = qs.stringify({
    "pass": "ak9Wg5YLvWVwbY",
    "request_type": "log_node_error",
    "errorMessage": errorString,
    "stackTrace": stackTrace
  });
  var postOptions = {
    host: "jeezy.click",
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