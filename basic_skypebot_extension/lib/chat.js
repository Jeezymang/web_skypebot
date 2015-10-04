//Submits the input to chat, needs a brief amount of time for the button to activate I believe.
//////////////////////////////////////////////////////////
function sendChat(text) {
    if ( isReplying ) 
        return;

    var fragmentElement = $(".chatContainer").find('.fragment:not(".hide")');
    var textAreaElement = fragmentElement.find("textarea");
    var buttonElement = fragmentElement.find(".circle.send-button");
    textAreaElement.sendkeys("{tab}");
    textAreaElement.val(text);
    textAreaElement.sendkeys("{enter}");
    textAreaElement.sendkeys("{backspace}");
    isReplying = true;
    setTimeout( function() { 
        buttonElement.click();
        isReplying = false;
    }, 100);
};

//Actually add the input to the console.
//////////////////////////////////////////////////////////
function addConsoleText(text) {
	var text = text;
	text = "[" + coloredSpan( "#F5F6CE", (new Date()).toLocaleTimeString() ) +  "] " + text;
	var consoleArea = $("#consoleText");
	var consoleDiv = $("#consoleTextArea");
   	consoleArea.append($('<li>').html(text));
    consoleDiv.scrollTop(consoleDiv[0].scrollHeight - consoleDiv.height());
};

//The firing of the console command, when the input is submitted.
//////////////////////////////////////////////////////////
function sendConsoleCommand() {
	var inputField = $("#commandInput");
    var command = inputField.val();
    inputField.val("");
    var commandName = (command.split(" "))[0];
    if ( conCommandHandles.hasOwnProperty(commandName) ) {
    	var argText = command.replace(commandName + " ", "");
    	argText = argText.replace(commandName, "");
    	conCommandHandles[commandName]["function"](argText);
    }
    else {
    	addConsoleText("That command doesn't exist.");
    }
};