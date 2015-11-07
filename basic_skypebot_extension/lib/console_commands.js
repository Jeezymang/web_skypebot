var conCommandHandles = {};

var successColor = "#BCF5A9";
var errorColor = "#F5A9A9";
var miscColor = "#CEF6F5";

conCommandHandles["focus-current-conversation"] = {
	"function": function( args ) {
		setConfigValue("main-conversation", getActiveConversation());
		addConsoleText(coloredSpan(successColor, "Set the main conversation to the current conversation."));
	},
	"help-text": commandHandles["focus-current-conversation"]["help-text"]
};

conCommandHandles["set-conversation-name"] = {
	"function": function( args ) {
		commandHandles["set-conversation-name"]["function"](args);
		addConsoleText(coloredSpan(successColor, "Setting conversation name to [ " + coloredSpan(miscColor, args) + " ]." ));
	},
	"help-text": commandHandles["set-conversation-name"]["help-text"]
};

conCommandHandles["commands"] = {
	"function": function( args ) {
		addConsoleText(coloredSpan(successColor, "Console Commands: "));
		for ( cmdName in conCommandHandles ) {
			addConsoleText(coloredSpan(successColor, cmdName + " [ " + coloredSpan(miscColor, conCommandHandles[cmdName]["help-text"]) + " ]."));
		}
	},
	"help-text": "Prints out all of the commands."
};

conCommandHandles["command-help"] = {
	"function": function( args ) {
		if (conCommandHandles.hasOwnProperty(args)) {
			addConsoleText(coloredSpan(miscColor, conCommandHandles[args]["help-text"]));
		}
		else {
			addConsoleText(coloredSpan(errorColor, "Command [ " + coloredSpan(miscColor, args) + " ] doesn't exist."));
		}
	},
	"help-text": commandHandles["command-help"]["help-text"]
};

conCommandHandles["get-config-value"] = {
	"function": function( args ) {
		if (configValues.hasOwnProperty(args))
			addConsoleText(coloredSpan(successColor, "Config Value [ " + coloredSpan(miscColor, args) + " ] is set to [ " + coloredSpan(errorColor, configValues[args].val) + " ]."));
		else
			addConsoleText(coloredSpan(errorColor, "Config Value [ " + coloredSpan(miscColor, args) + " ] doesn't exist."));
	},
	"help-text": commandHandles["get-config-value"]["help-text"]
};

conCommandHandles["config-value-help"] = {
	"function": function( args ) {
		if (configValues.hasOwnProperty(args)) {
			var helpText = coloredSpan(miscColor, configValues[args].help);
			var argumentType = coloredSpan(errorColor, configValues[args].type);
			addConsoleText(coloredSpan(successColor, args + " <" + argumentType + "> [ " + helpText + " ]."));
		}
		else {
			addConsoleText(coloredSpan(errorColor, "Config Value [ " + coloredSpan(miscColor, args) + " ] doesn't exist."));
		}
	},
	"help-text": commandHandles["config-value-help"]["help-text"]
};

conCommandHandles["toggle-config-value"] = {
	"function": function( args ) {
		if (configValues.hasOwnProperty(args)) {
			var configObj = configValues[args];
			if ( configObj.type == "bool" ) {
				if ( configObj.val ) {
					addConsoleText(coloredSpan(errorColor, "Config Value [ " + coloredSpan(miscColor, args) + " ] was disabled."));
					configValues[args].val = false;
				}
				else {
					addConsoleText(coloredSpan(successColor, "Config Value [ " + coloredSpan(miscColor, args) + " ] was enabled."));
					configValues[args].val = true;
				}
			}
			else {
				addConsoleText(coloredSpan(errorColor, "Config Value [ " + coloredSpan(miscColor, args) + " ] is not a bool."));
			}
		}
		else {
			addConsoleText(coloredSpan(errorColor, "Config Value [ " + coloredSpan(miscColor, args) + " ] doesn't exist."));
		}
	},
	"help-text": commandHandles["toggle-config-value"]["help-text"]
};

conCommandHandles["set-config-value"] = {
	"function": function( args ) {
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
				addConsoleText(coloredSpan(successColor, "Config Value [ " + coloredSpan(miscColor, keyName) + " ] was set to [ " + coloredSpan(miscColor, keyValue) + " ]."));
			}
			else {
				addConsoleText(coloredSpan(errorColor, errMessage ));
			}
		}
		else {
			addConsoleText(coloredSpan(errorColor, "Config Value [ " + coloredSpan(miscColor, keyName) + " ] doesn't exist."));
		}
	},
	"help-text": commandHandles["set-config-value"]["help-text"]
};

conCommandHandles["say"] = {
	"function": function( args ) {
		addConsoleText( coloredSpan( successColor, "Saying: " + coloredSpan( miscColor, args ) ) );
		sendChat( args );
	},
	"help-text": "Says the specified text."
};

conCommandHandles["runtime"] = {
	"function": function( args ) {
		var timeArray = getBotRuntime();
		var seconds = coloredSpan( "#A9A9F5", timeArray[0] + " seconds");
		var minutes = coloredSpan( "#A9A9F5", timeArray[1] + " minutes");
		var hours = coloredSpan( "#A9A9F5", timeArray[2] + " hours");
		addConsoleText( "Runtime: " + hours + ", " + minutes + ", and " + seconds + "." );
	},
	"help-text": commandHandles["runtime"]["help-text"]
};

conCommandHandles["ban-user"] = {
	"function": function( args ) {
		var userString = coloredSpan( miscColor, args );
		if ( args == getConfigValue("bot-name") ) {
			addConsoleText(coloredSpan( errorColor, "You cannot ban the Bot."));
			return;
		}
		if ( !skypeUsernameExists( args ) ) {
			addConsoleText(coloredSpan( errorColor, "That username does not exist."));
			return;
		}
		if ( bannedUsers.hasOwnProperty(args) ) {
			addConsoleText(coloredSpan( errorColor, "You cannot ban the Bot."));
		}
		else {
			addConsoleText(coloredSpan( successColor, "User " + userString + " has been banned."));
			bannedUsers[args] = true;
		}
	},
	"help-text": commandHandles["ban-user"]["help-text"]
};

conCommandHandles["unban-user"] = {
	"function": function( args ) {
		var userString = coloredSpan( miscColor, args );
		if ( args == getConfigValue("bot-name") )
			return;
		
		if ( bannedUsers.hasOwnProperty(args) ) {
			addConsoleText(coloredSpan( successColor, "User " + userString + " has been unbanned."));
			delete bannedUsers[args];
		}
		else {
			addConsoleText(coloredSpan( errorColor, "User " + userString + " is not currently banned."));
			sendChat( args + " is not currently banned.");
		}
	},
	"help-text": commandHandles["unban-user"]["help-text"]
};

conCommandHandles["users"] = {
	"function": function() {
		var users = getAllSkypeUsers();
		addConsoleText(coloredSpan(successColor, "Cached Users: "));
		users.forEach(function(value){
			addConsoleText(coloredSpan(miscColor, value) + coloredSpan(errorColor, " ( " + usernameCache[value] + " )" ));
		});
	},
	"help-text": commandHandles["users"]["help-text"]
};

conCommandHandles["banned-users"] = {
	"function": function() {
		addConsoleText(coloredSpan(successColor, "Banned Users: "));
		for( var key in bannedUsers ) {
			addConsoleText(coloredSpan(miscColor, key));
		}
	},
	"help-text": commandHandles["banned-users"]["help-text"]
};