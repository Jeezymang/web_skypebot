function getMessageAuthor(element) {
	var messageAuthor = "Bot";
	var authorElement = findTagInChildren(element, "SWX-NAME");
	if ( !authorElement ) {
		authorElement = findTagInChildren(element, "A");
		if ( authorElement )
			authorElement = findTagInChildren(authorElement, "SWX-NAME");
	}
	if ( authorElement ) {
		var theSpan = findTagInChildren(authorElement, "SPAN");
		theSpan = findTagInChildren(theSpan, "SPAN");
		var headerElement = findTagInChildren(theSpan, "H4");
		if ( headerElement )
			messageAuthor = headerElement.innerHTML;
	}
	return messageAuthor;
};

function getMessageTime(element) {
	var messageTime = "0";
	var stampElement = findClassInChildren(element, "timestamp offScreen");
	if (!stampElement) {
		stampElement = findClassInChildren(element, "timestamp");
	}
	if ( stampElement ) {
		var pTimeElement = findTagInChildren(stampElement, "P");
		var innerHTML = pTimeElement.innerHTML;
		var timeRegex = /[0-9]{1,2}:[0-9]{1,2} (am|pm)/g;
		var dateRegex = /[0-9]{1,2}\/[0-9]{1,2}/g;
		if ( timeRegex.test(innerHTML) ) {
			var splitTime = innerHTML.split(":");
			splitTime[1] = splitTime[1].replace(" am", "");
			splitTime[1] = splitTime[1].replace(" pm", "");
			var dateObj = new Date();
			if(innerHTML.indexOf("am") != -1) {
				var hours = parseInt(splitTime[0]) - 1;
				var minutes = parseInt(splitTime[1]);
				dateObj.setHours(hours);
				dateObj.setMinutes(minutes);
			}
			else {
				var hours = 12 + parseInt(splitTime[0]);
				var minutes = parseInt(splitTime[1]);
				dateObj.setHours(hours);
				dateObj.setMinutes(minutes);
			}
			messageTime = dateObj.getTime();
		}
		else if ( dateRegex.test(innerHTML) ) {
			messageTime = Date.parse(innerHTML + "/15");
		}
		else {
			var dateObj = new Date();
			var newDate = parseInt(dateObj.getDate()) - 1;
			if ( newDate == 0 )
				newDate = 31;
			dateObj.setDate(newDate);
			messageTime = dateObj.getTime();
		}
		/*messageTime = pTimeElement.id;
		messageTime = messageTime.replace("time_", "");*/
	}
	return messageTime.toString();
};

function getMessageText(element) {
	var messageText = "";
	var contentElement = findClassInChildren(element, "content");
	if ( contentElement ) {
		var pMessageElement = findTagInChildren( contentElement, "P" );
		if ( pMessageElement )
			var messageText = pMessageElement.innerHTML;
	}
	return messageText;
};

function getMessageID(element) {
	var messageID = "";
	var contentElement = findClassInChildren(element, "content");
	if ( contentElement )
		messageID = contentElement.id;
	messageID = messageID.replace("msg_", "");
	return messageID;
};

function chatMessageSaved(element) {
	return ( chatMessages.hasOwnProperty(getMessageID(element)) );
};

function chatMessageUnread(element) {
	return ( sessionStorage.getItem(getMessageID(element)) == null );
};

function addChatMessage(bubbleElement) {
	var contentElement = findClassInChildren(bubbleElement, "content");
	if (contentElement) {
		var theMessage = {
			id: getMessageID(bubbleElement),
			text: getMessageText(bubbleElement),
			time: getMessageTime(bubbleElement),
			author: getMessageAuthor(bubbleElement),
			convoName: currentConversation
		}
		chatMessages[theMessage.id] = theMessage;
		return theMessage;
	}
};

function onNewMessage(theMessage) {
	if ( theMessage.text.indexOf(getConfigValue("command-prefix") ) == 0 ) {
		if ( theMessage.text == getConfigValue("command-prefix") ) 
			return;
		if ( bannedUsers.hasOwnProperty(theMessage.author) ) {
			return;
		}
		var theCommand = theMessage.text.replace(getConfigValue("command-prefix") + " ", "");
		var cmdName = /^\S*/.exec(theCommand);
		var cmdArgs = theCommand.replace(cmdName + " ", "");
		if ( commandHandles.hasOwnProperty(cmdName) ) {
			commandHandles[cmdName]["function"](cmdArgs);
		}
	}
};

function checkMessages() {
	var theBubbles = document.getElementsByClassName("bubble");
	for (var i=0; i < theBubbles.length; i++){
		if ( !chatMessageSaved(theBubbles[i]) ) {
			var theMessage = addChatMessage(theBubbles[i]);
			var currentSeconds = new Date().getTime() / 1000;
			if ( !firstRead && theMessage && theMessage.author != "Bot" ) {
				var messageSeconds = ( parseInt( theMessage.time ) ) / 1000;
				var secondsSince = currentSeconds - messageSeconds;
				if ( secondsSince < 60 ) {
					var shouldSkip = false;
					if ( ( getConfigValue("main-conversation") != "" ) && theMessage.convoName != getConfigValue("main-conversation") )
						shouldSkip = true;

					if ( !shouldSkip && !getConfigValue("ignore-input") ) {
						var cleanedMessage = theMessage.text.replace(/<a.*?>|<\/a>/g, "");
						cleanedMessage = cleanedMessage.replace(/amp;/g, "");
						var youtubeRegex = /^(http(?:s?):\/\/|)?(?:www\.|)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g;
						var facepunchRegex = /^(http(?:s?):\/\/|)?(?:www\.|)?facepunch.com\/(showthread.php|forumdisplay.php)\?(f=[0-9]*|t=[0-9]*)(&p=[0-9]*|&p=[0-9]*|)(&viewfull=1|)(#post[0-9]*|)$/g;
						var twitterRegex = /^(http(?:s?):\/\/|)?(?:www\.|)?twitter.com\/(.*?)\/status\/[0-9]*$/g;
						var matchedYoutube = youtubeRegex.test(cleanedMessage);
						var matchedFacepunch = facepunchRegex.test(cleanedMessage);
						var matchedTwitter = twitterRegex.test(cleanedMessage);
						if ( matchedYoutube ) {
							var youtubeID = cleanedMessage;
							youtubeID = youtubeID.replace(/(http(?:s?):\/\/|)?(?:www\.|)?youtu(?:be\.com\/watch\?v=|\.be\/)/g, "");
							youtubeID = youtubeID.replace(/&.*/g, "");
							if ( youtubeID.length > 12 )
								continue;
							$.post( WEB_SERVER_URL + "/youtube_api.php", {request_type: "video_rating", pass: SERVER_KEY, videoID: youtubeID }, function(result){
								var parsedJSON = JSON.parse(result);
								var title = parsedJSON["title"];
								var likes = parseInt(parsedJSON["likeCount"]);
								var dislikes = parseInt(parsedJSON["dislikeCount"]);
								var views = parsedJSON["viewCount"];
								var starString = getRatingStars(likes, dislikes);
								sendChat(title + "\r\n( Views: " + views + " | Rating: " + starString + " )" );
							});
						}
						else if ( matchedFacepunch ) {
							$.post( WEB_SERVER_URL + "/skypebot.php", {request_type: "getpagetitle", pass: SERVER_KEY, url: cleanedMessage }, function(result){
								sendChat("Facepunch: " + result);
								if ( cleanedMessage.indexOf( "#post" ) != -1 ) {
									$.post( WEB_SERVER_URL + "/skypebot.php", {request_type: "getfacepunchpostcontents", pass: SERVER_KEY, url: cleanedMessage }, function(postContents){
										sendChat(postContents);
									});
								}
							});
						}
						else if ( matchedTwitter ) {
							$.post( WEB_SERVER_URL + "/skypebot.php", {request_type: "gettweetcontents", pass: SERVER_KEY, url: cleanedMessage }, function(result){
								sendChat("Tweet Contents\n" + result );
							});
						}
						if ( getConfigValue("cleverbot-enabled") && getConfigValue("cleverbot-response") && theMessage.text.indexOf(getConfigValue("command-prefix") ) != 0 && !omegleActive && !twitchActive && (!matchedYoutube && !matchedFacepunch && !matchedTwitter) ) {
							var randChance = Math.round(Math.random()*100);
							if ( randChance <= getConfigValue("cleverbot-response-chance").clamp(0, 100) ) {
								commandHandles["inquire"]["function"](theMessage.text);
							}
						}
						if ( theMessage.text.indexOf(getConfigValue("command-prefix") ) == -1 && theMessage.text.indexOf("!nosend") == -1 ) {
							var aMessage = theMessage.author + ": " + theMessage.text
							if ( omegleActive ) {
								var rdyMessage = aMessage;
								if ( !getConfigValue("omegle-send-names") )
									rdyMessage = theMessage.text
								socket.emit("omegle_message", rdyMessage );
							}
							if ( getConfigValue("steam-communication") )
								localSocket.emit("steam_message", aMessage );
							if ( twitchActive ) {
								var rdyMessage = aMessage;
								if ( !getConfigValue("twitch-send-names") )
									rdyMessage = theMessage.text
								localSocket.emit("twitch_message", rdyMessage );
							}
						}
						onNewMessage(theMessage);
					}
					if ( getConfigValue("message-logging") ) {
						$.post( WEB_SERVER_URL + "/skypebot.php", {request_type: "addmessage", pass: SERVER_KEY, author: theMessage.author, text: theMessage.text, time: parseInt(theMessage.time)/1000, convoName: theMessage.convoName }, function(result){
						});
					}
				}
			}
		}
    }
    firstRead = false;
};