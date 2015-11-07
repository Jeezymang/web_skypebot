function getActiveConversation() {
	var titleElement = $(".fragmentsContainer.hideContent").find(".fragment:not(.hide)").find(".hoverWrap").find("a");
	if ( titleElement )
		return titleElement.html();
};

function getConversationName(convoElement) {
	return(convoElement.find(".topic").html());
};

function getConversations() {
	var convoArray = [];
	$("swx-recent-item").each( function( ) {
		var theElement = $(this).find("a.recent.message");
		convoArray.push(theElement);
	});
	return convoArray;
};

function conversationExists(convoName) {
	var theArray = getConversations();
	for (var i=0; i < theArray.length; i++){
		if ( getConversationName(theArray[i]) == convoName )
			return true;
	}
	return false;
};

function gotoConversation(convoName) {
	var theArray = getConversations();
	for (var i=0; i < theArray.length; i++){
		if( getConversationName(theArray[i]) == convoName && currentConversation != convoName ) {
			theArray[i][0].click();
			currentConversation = convoName;
		}
	}
};

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