//Attempts to get the current conversation name via the title at the top of the chat.
//////////////////////////////////////////////////////////
function getActiveConversation() {
	var titleElement = $(".fragmentsContainer.hideContent").find(".fragment:not(.hide)").find(".hoverWrap").find("a");
	if ( titleElement )
		return titleElement.html();
};

//Gets the conversation from the specified a.recent.message element.
//////////////////////////////////////////////////////////
function getConversationName(convoElement) {
	return(convoElement.find(".topic").html());
};

//Gets all of the a-recent-message elements and adds them to an array.
//////////////////////////////////////////////////////////
function getConversations() {
	var convoArray = [];
	$("swx-recent-item").each( function( ) {
		var theElement = $(this).find("a.recent.message");
		convoArray.push(theElement);
	});
	return convoArray;
};

//Check if the conversation exists by looping through all the
//a-recent-message elements and comparing the name.
//////////////////////////////////////////////////////////
function conversationExists(convoName) {
	var theArray = getConversations();
	for (var i=0; i < theArray.length; i++){
		if ( getConversationName(theArray[i]) == convoName )
			return true;
	}
	return false;
};

//Goes to a conversation by looping through all the a-recent-message
//elements and comparing the name, if it's equal it clicks.
//////////////////////////////////////////////////////////
function gotoConversation(convoName) {
	var theArray = getConversations();
	for (var i=0; i < theArray.length; i++){
		if( getConversationName(theArray[i]) == convoName && currentConversation != convoName ) {
			theArray[i][0].click();
			currentConversation = convoName;
		}
	}
};


//The actual looping through the converations, this is buggy and a work in progress.
//Basically Skype Web won't set a message as read without focusing on Chrome, so
//I had to make a workaround.
//////////////////////////////////////////////////////////
var unreadConvoMessages = {};
function checkConversations() {
	var theArray = getConversations();
	for (var i=0; i < theArray.length; i++){
		if( theArray[i].attr('class').indexOf("unread") != -1 && theArray[i].attr('class').indexOf("active") == -1 ) {
			var shouldClick = true;
			if(unreadConvoMessages.hasOwnProperty(getConversationName(theArray[i]))){
				if ( unreadConvoMessages[getConversationName(theArray[i])] == parseInt(theArray[i].find("p.fontSize-h4").html()) )
					shouldClick = false;
			}
			unreadConvoMessages[getConversationName(theArray[i])] = parseInt(theArray[i].find("p.fontSize-h4").html());
			if( shouldClick ) {
				theArray[i][0].click();
				currentConversation = getConversationName(theArray[i]);
				checkMessages();
			}
		}
		else if ( theArray[i].attr('class').indexOf("active") != -1 ) {
			currentConversation = getConversationName(theArray[i]);
			checkMessages();
		}
	}
	if ( getConfigValue("main-conversation") != "" ) {
		setTimeout( function() {gotoConversation(getConfigValue("main-conversation")); }, 100);
	}
};