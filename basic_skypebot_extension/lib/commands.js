var commandHandles = {};

commandHandles["focus-current-conversation"] = {
	"function": function( args ) {
		setConfigValue("main-conversation", getActiveConversation());
		sendChat("Set the main conversation to the current conversation.");
	},
	"help-text": "Sets the main conversation config value to the current conversation.",
	"operator-only": true
};

//Attempts to set the conversation name and set the main conversation to the new name.
//////////////////////////////////////////////////////////
commandHandles["set-conversation-name"] = {
	"function": function( args ) {
		var fragmentElement = $("div.fragment:not(.hide)");
		var convoHeader = fragmentElement.find("swx-header.conversationHeader");
		convoHeader.find("swx-avatar.avatar").click();
		convoHeader.find("button.iconfont.edit").click();
		setTimeout(function(){
			convoHeader.find("input.edit").val(args);
			convoHeader.find("input.edit").sendkeys("{enter}");
			setConfigValue("main-conversation", args);
			setTimeout(function(){
				convoHeader.find("a.iconfont.ok")[0].click();
			}, 100);
		}, 100);
	},
	"help-text": "Sets the conversation name to the specified value."
};

commandHandles["command-help"] = {
	"function": function( args ) {
		if (commandHandles.hasOwnProperty(args)) {
			sendChat(commandHandles[args]["help-text"]);
		}
		else {
			sendChat("Command [ " + args + " ] doesn't exist.");
		}
	},
	"help-text": "Prints out the help text for the command."
};

commandHandles["get-config-value"] = {
	"function": function( args ) {
		if (configValues.hasOwnProperty(args)) {
			sendChat("Config Value [ " + args + " ] is set to [ " + configValues[args].val + " ].");
		}
		else {
			sendChat("Config Value [ " + args + " ] doesn't exist.");
		}
	},
	"help-text": "Prints out the value of the specified config value."
};

commandHandles["config-value-help"] = {
	"function": function( args ) {
		if (configValues.hasOwnProperty(args)) {
			sendChat(args + " <" + configValues[args].type + "> [ " + configValues[args].help + " ].");
		}
		else {
			sendChat("Config Value [ " + args + " ] doesn't exist.");
		}
	},
	"help-text": "Prints out the help text for the config value."
};

commandHandles["toggle-config-value"] = {
	"function": function( args ) {
		if (configValues.hasOwnProperty(args)) {
			var configObj = configValues[args];
			if ( configObj.type == "bool" ) {
				if ( configObj.val ) {
					sendChat("Config Value [ " + args + " ] was disabled.");
					configValues[args].val = false;
				}
				else {
					sendChat("Config Value [ " + args + " ] was enabled.");
					configValues[args].val = true;
				}
			}
			else {
				sendChat("Config Value [ " + args + " ] is a " + configObj.type + " not a bool.");
			}
		}
		else {
			sendChat("Config Value [ " + args + " ] doesn't exist.");
		}
	},
	"help-text": "Toggles the specified boolean config value on and off."
};

commandHandles["set-config-value"] = {
	"function": function( args, theMessage ) {
		var splitArgs = args.split(" ");
		var keyName = splitArgs[0];
		var keyValue = args.replace(keyName + " ", "");
		if (configValues.hasOwnProperty(keyName)) {
			var canSet = true;
			var errMessage = "";
			if(configValues[keyName].canSet){
				var returnArray = configValues[keyName].canSet(keyValue);
				canSet = returnArray[0];
				errMessage = returnArray[1];
			}
			if ( canSet ) {
				setConfigValue(keyName, keyValue);
				sendChat("Config Value [ " + keyName + " ] was set to [ " + keyValue + " ].");
			}
			else {
				sendChat(errMessage);
			}
		}
		else {
			sendChat("Config Value [ " + keyName +  " ] doesn't exist.");
		}
	},
	"help-text": "Sets the specified config value.",
	"operator-only": true
};

commandHandles["commands"] = {
	"function": function( args ) {
		var cmdString = "Commands: ";
		for ( cmdName in commandHandles ) {
			cmdString = cmdString + cmdName + "\r\n";
		}
		sendChat( cmdString );
	},
	"help-text": "Prints out all of the commands."
};

commandHandles["runtime"] = {
	"function": function( args ) {
		var timeArray = getBotRuntime();
		sendChat( "Has been running for " + timeArray[2] + " hours, " + timeArray[1] + " minutes, and " + timeArray[0] + " seconds." );
	},
	"help-text": "Prints out how long the bot as been running."
};

commandHandles["ban-user"] = {
	"function": function( args, theMessage ) {
		if ( args == getConfigValue("bot-name") ) {
			sendChat("You cannot ban the Bot.");
			return;
		}
		if ( !skypeUsernameExists( args ) ) {
			sendChat("That username does not exist.");
			return;
		}
		if ( bannedUsers.hasOwnProperty(args) ) {
			sendChat( args + " is already banned.");
		}
		else {
			sendChat( "Banned user " + args + "." );
			bannedUsers[args] = true;
		}
	},
	"help-text": "Bans the specified user from using any commands.",
	"operator-only": true
};

commandHandles["unban-user"] = {
	"function": function( args, theMessage ) {
		if ( args == getConfigValue("bot-name") )
			return;

		if ( bannedUsers.hasOwnProperty(args) ) {
			sendChat( "User " + args + " has been unbanned." );
			delete bannedUsers[args];
		}
		else {
			sendChat( args + " is not currently banned.");
		}
	},
	"help-text": "Unbans the specified user.",
	"operator-only": true
};

commandHandles["users"] = {
	"function": function() {
		var users = getAllSkypeUsers();
		var printString = "Cached Users: \n";
		users.forEach(function(value){
			printString += value + " ( " + usernameCache[value] + " )\n";
		});
		sendChat(printString);
	},
	"help-text": "Lists all cached skype users."
};

commandHandles["banned-users"] = {
	"function": function() {
		var printString = "Banned Users: \n";
		for( var key in bannedUsers ) {
			printString += key + "\n";
		}
		sendChat(printString);
	},
	"help-text": "Lists all currently banned users."
};