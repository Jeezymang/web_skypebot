var chatMessages = {};

var firstRead = true;

var isReplying = false;

var cleverbotInstance;

var startTime = 0;

var bannedUsers = {};

var omegleActive = false;

var steamComActive = false;

var twitchActive = false;

var socket;

var localSocket;

var currentConversation = "";

var ignoreInput = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      setupSockets();
      (function(){
        checkConversations();
        console.log("Bot is running.");
          setTimeout(arguments.callee, 1000);
      })();
      startTime = new Date().getTime();
      startCleverbot();
      setupConsole();
    }
  }
);

function setupConsole() {
  var consoleDiv = document.createElement('div');
  consoleDiv.style.backgroundColor = "black";
  consoleDiv.style.color = "white";
  consoleDiv.style.minHeight = "150px";
  consoleDiv.style.maxHeight = "150px";
  consoleDiv.style.width = "100%";
  consoleDiv.style.height = "150px";
  var inputHTML = "<input type='text' " + htmlStyle({"background-color": "white", "color": "black", 
    "width": "95%", "height": "35px"}) + " id='commandInput'></input>";
  var buttonHTML = "<button type='button' id='submitCommand' " + htmlStyle({"background-color" : "white", "color" : "black", 
    "width": "5%", "text-align": "center", "height": "35px"}) + ">Send</button>";
  var textAreaStyle = htmlStyle( { "color": "white", "background-color": "black", "overflow-y": "scroll", 
    "min-height": "100px", "max-height": "100px", "height": "100px", "width": "100%" } );
  consoleDiv.innerHTML = "<div id='consoleTextArea' " + textAreaStyle + "><ul id='consoleText'></div></ul></br>" + inputHTML + buttonHTML;
  document.getElementsByTagName('body')[0].appendChild(consoleDiv);
  $("#commandInput").keypress(function (e) {
    if ( e.keyCode == 13 )
      sendConsoleCommand();
  });
  $("#submitCommand").click(function() {
    sendConsoleCommand();
  });
}

function setupSockets() {
  getActiveConversation();
  socket = io.connect(SERVER_ADDRESS);
  localSocket = io.connect(LOCAL_ADDRESS);
  socket.on("message", function(msg) {
      if ( msg.indexOf("Stranger connected") != -1 ) {
        setTimeout(function(){
          sendChat(msg);
          addConsoleText(coloredSpan("#BCF5A9", msg));
        }, 500);
      }
      else {
        if ( msg.indexOf("Connecting to Omegle.") == -1 ) // Ignore connecting message.
        sendChat(msg);
        if ( msg.indexOf("Stranger:") == -1 )
          addConsoleText(coloredSpan("#BCF5A9", msg));
      }
      
  });
  socket.on("omegle_status", function(msg) {
    if ( msg == "on" )
      omegleActive = true;
    else
      omegleActive = false;
  });
  localSocket.on("twitch_message", function(msg){
      sendChat("[TWITCH] " + msg);
  });
  localSocket.on("twitch_status", function(msg) {
    if ( msg == "on" ) {
      addConsoleText(coloredSpan("#BCF5A9", "Twitch has connected."));
      sendChat("Twitch has connected.");
      twitchActive = true;
    }
      
    else {
      addConsoleText(coloredSpan("#F5A9A9", "Twitch has disconnected."));
      twitchActive = false;
    }
  });
  localSocket.on("steam_message", function(msg) {
    if ( steamComActive )
      sendChat("[STEAM] " + msg );
  });
  localSocket.on("return_lua", function(msg) {
    var safeResult = msg;
    if ( safeResult.length > getConfigValue("lua-character-limit") )
      safeResult = "The return value was too large > " + getConfigValue("lua-character-limit") + " characters";
    if ( safeResult.toLowerCase().indexOf("/leave") != -1 )
      safeResult = "Go fuck yourself.";
    sendChat(safeResult);
  });
}

function startCleverbot() {
  cleverbotInstance = new cleverbot(CLEVERBOT_API_USER, CLEVERBOT_API_PASS);
  cleverbotInstance.setNick("botSession");
  cleverbotInstance.create(function(err, session){
  });
}