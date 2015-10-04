var chatMessages = {};

var firstRead = true;

var isReplying = false;

var startTime = 0;

var bannedUsers = {};

var currentConversation = "";

var ignoreInput = false;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      (function(){
        //The endless loop for the bot, default every one second.
        //////////////////////////////////////////////////////////
        checkConversations();
        console.log("Bot is running.");
          setTimeout(arguments.callee, 1000);
      })();
      startTime = new Date().getTime();
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
  //Console input fired.
  //////////////////////////////////////////////////////////
  $("#commandInput").keypress(function (e) {
    if ( e.keyCode == 13 )
      sendConsoleCommand();
  });
  $("#submitCommand").click(function() {
    sendConsoleCommand();
  });
};