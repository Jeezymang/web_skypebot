var commandHandles = {};

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
}

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
	"help-text": "Sets the specified config value."
};

commandHandles["random-word"] = {
	"function": function( args ) {
		$.get("https://randomword.setgetgo.com/get.php", function(data, status){
        	sendChat( data );
    	});
	},
	"help-text": "Prints out a random word."
};

commandHandles["yoda-speak"] = {
	"function": function( args ) {
		var newString = args.replace(/ /mg, "+");
		mashapeRequest("https://yoda.p.mashape.com/yoda?sentence=" + newString, "text/plain", function( response ){
			sendChat( response );
		});
	},
	"help-text": "Translates the specified text to yoda speak."
};

commandHandles["define"] = {
	"function": function( args ) {
		var newString = args.replace(/ /mg, "+");
		mashapeRequest("https://montanaflynn-dictionary.p.mashape.com/define?word=" + newString, "application/json", function( response ) {
			if ( response.definitions.length > 0){
				sendChat( response.definitions[0].text );
			}
			else {
				sendChat("No definition found for " + args + "." );
			}
		});
	},
	"help-text": "Looks up the definition of the specified word."
};

commandHandles["inquire"] = {
	"function": function( args ) {
		if ( !cleverbotInstance ) return;
		if ( !getConfigValue("cleverbot-enabled") ) {
			sendChat("Cleverbot is currently disabled.");
			return;
		}
		$.ajax({type: 'POST', url: "https://cleverbot.io/1.0/ask", data: { "user": CLEVERBOT_API_USER, "key": CLEVERBOT_API_PASS, "nick": "botSession", "text": args }, success: function( response ){ 
			if ( response && response.hasOwnProperty("status") && response.status == "success" ) {
				sendChat(response.response);
			}
		}});
	},
	"help-text": "Asks Cleverbot the specified text."
};

commandHandles["urban-define"] = {
	"function": function( args ) {
		var newString = args.replace(/ /mg, "+");
		mashapeRequest("https://mashape-community-urban-dictionary.p.mashape.com/define?term=" + newString, "text/plain", function( response ){
			if ( response.hasOwnProperty("result_type") && response.result_type == "no_results" ) {
				sendChat("No results were found.");
			}
			else {
				var results = response.list[0];
				var author = results.author;
				var definition = results.definition;
				sendChat( definition + " - " + author );
			}
		});
	},
	"help-text": "Looks up the Urban Dictionary definition of the specified word."
};

commandHandles["weather"] = {
	"function": function( args ) {
		var newString = args.replace(/ /mg, "+");
		newString = newString.replace(",", "%2C");
		mashapeRequest("https://community-open-weather-map.p.mashape.com/forecast?q=" + newString, "application/json", function( response ){
			if ( response.hasOwnProperty("message") && response.message == "Error: Not found city" ) {
				sendChat( "City not found." );
			}
			else {
				var cityCountry = response.city.country;
				var cityName = response.city.name;
				var mainData = response.list[0].main;
				var lowTemp = kevinToFahrenheit(mainData.temp_min);
				var highTemp = kevinToFahrenheit(mainData.temp_max);
				var currentTemp = kevinToFahrenheit(mainData.temp);
				var weatherType = response.list[0].weather[0].description;
				var builtReply = "It's currently " + currentTemp + " degrees in " + cityName + ", " + cityCountry + " with a low of " + lowTemp + " degrees and a high of " + highTemp + " degrees.\r\n( " + weatherType + " )";
				sendChat( builtReply );
			}
		});
	},
	"help-text": "Prints out the weather for the specified city."
};

commandHandles["gender-guess"] = {
	"function": function( args ) {
		var newString = args.replace(/ /mg, "+");
		mashapeRequest("https://montanaflynn-gender-guesser.p.mashape.com/?name=" + newString, "application/json", function( response ){
			if ( response.hasOwnProperty("error") ) {
				sendChat( "That name could not be found." );
			}
			else {
				var name = response.name;
				var gender = response.gender;
				sendChat( "The name " + name + " is probably " + gender + "." );
			}
		});
	},
	"help-text": "Prints out the guessed gender for the specified name"
};

commandHandles["random-quote"] = {
	"function": function( args ) {
		mashapeRequest("https://andruxnet-random-famous-quotes.p.mashape.com/cat=" + args, "application/json", function( response ){
			var responseObj = JSON.parse(response);
			if ( responseObj.hasOwnProperty("error") ) {
				sendChat( "A quote could not be found" );
			}
			else {
				var author = responseObj.author;
				var quote = responseObj.quote;
				sendChat( quote + " - " + author );
			}
		});
	},
	"help-text": "Prints out a random quote from the specified category."
};

commandHandles["random-cat"] = {
	"function": function( args ) {
		mashapeRequest("https://nijikokun-random-cats.p.mashape.com/random", "text/plain", function( response ){
			var responseObj = JSON.parse( response );
			sendChat( responseObj.source );
		});
	},
	"help-text": "Prints a URL to a random cat image."
};

commandHandles["leet-speak"] = {
	"function": function( args ) {
		var newString = args.replace(/ /mg, "+");
		mashapeRequest("https://montanaflynn-l33t-sp34k.p.mashape.com/encode?text=" + newString, "text/plain", function( response ){
			sendChat( response );
		});
	},
	"help-text": "Translates the specified text to leet speak."
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

commandHandles["currency-convert"] = {
	"function": function( args ) {
		var argArray = args.split(" ");
		if ( argArray.length < 3 )
			return;
		var amount = parseInt(argArray[0]);
		var from = argArray[1];
		var to = argArray[2];
		mashapeRequest("https://currencyconverter.p.mashape.com/?from=" + from + "&from_amount=" + amount + "&to=" + to, "application/json", function( response ){
			if ( response.hasOwnProperty("error") && response.error == "CURRENCY_NOT_SUPPORTED" ) {
				sendChat( "Invalid currency type specified." );
			}
			else {
				var toAmount = response.to_amount;
				sendChat( amount + from + " = " + toAmount + to );
			}
		});
	},
	"help-text": "Converts the specified amount from one currency to another."
};

commandHandles["random-video"] = {
	"function": function( args ) {
		$.post( WEB_SERVER_URL + "/youtube_api.php", {request_type: "random_video", pass: SERVER_KEY, query: args }, function(result){
			var parsedJSON = JSON.parse(result);
			var title = parsedJSON["title"];
			var id = parsedJSON["id"];
			var likes = parseInt(parsedJSON["likeCount"]);
			var dislikes = parseInt(parsedJSON["dislikeCount"]);
			var views = parsedJSON["viewCount"];
			var url = "https://youtu.be/" + id;
			var starString = getRatingStars(likes, dislikes);
			sendChat(title + "\r\n" + url + "\r\n( Views: " + views + " | Rating: " + starString + " )" );
		});
	},
	"help-text": "Prints a URL to a random youtube video found with the specified search query."
};

commandHandles["random-message"] = {
	"function": function( args ) {
		$.post( WEB_SERVER_URL + "/skypebot.php", {request_type: "getrandommessage", pass: SERVER_KEY, author: args, convoName: currentConversation }, function(result){
			sendChat(result);
		});
	},
	"help-text": "Prints a random message from the database with the specified author's name."
};

commandHandles["lua"] = {
	"function": function( args ) {
		localSocket.emit("run_lua", args);
	},
	"help-text": "Executes specified Lua code."
};

commandHandles["luafile"] = {
	"function": function( args ) {
		var cleanedURL = args.replace(/<a.*?>|<\/a>/g, "");
		var pastebinRegex = /^(http(?:s?):\/\/|)?(?:www\.|)?pastebin\.com\/raw\.php\?/g;
		var hastebinRegex = /^(http(?:s?):\/\/|)?(?:www\.|)?hastebin\.com\/raw\//g;
		var matchedPastebin = pastebinRegex.test(cleanedURL);
		var matchedHastebin = hastebinRegex.test(cleanedURL);
		if ( !matchedPastebin && !matchedHastebin ) {
			sendChat("You can only load pastebin or hastebin URLs.");
		}
		else {
			var pageContents = getPageContents(cleanedURL, function(pageContents){
				localSocket.emit("run_lua", pageContents);
			});		
		}
	},
	"help-text": "Executes specified Lua file, either on pastebin or hastebin."
};

commandHandles["omegle-connect"] = {
	"function": function( args ) {
		socket.emit("omegle_start", args );
	},
	"help-text": "Connects to Omegle with the specified tag."
};

commandHandles["omegle-disconnect"] = {
	"function": function( args ) {
		socket.emit("omegle_end", "");
	},
	"help-text": "Disconnects from Omegle."
};

commandHandles["ban-user"] = {
	"function": function( args ) {
		if ( args == "Bot" ) {
			sendChat("You cannot ban the Bot.");
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
	"help-text": "Bans the specified user from using any commands."
};

commandHandles["unban-user"] = {
	"function": function( args ) {
		if ( args == "Bot" )
			return;
		
		if ( bannedUsers.hasOwnProperty(args) ) {
			sendChat( "User " + args + " has been unbanned." );
			delete bannedUsers[args];
		}
		else {
			sendChat( args + " is not currently banned.");
		}
	},
	"help-text": "Unbans the specified user."
};

commandHandles["twitch-connect"] = {
	"function": function( args ) {
		if(!twitchActive) {
			sendChat("Attempting to connect to Twitch Channel " + args + "." );
			localSocket.emit("connect_twitch", args );
		}
		else
			sendChat("Already connected to Twitch.");
	},
	"help-text": "Connects to the specified Twitch channel name."
};

commandHandles["twitch-disconnect"] = {
	"function": function( args ) {
		if (!twitchActive) {
			sendChat("Currently not connected to Twitch.");
		}
		else {
			sendChat("Disconnecting from Twitch.");
			localSocket.emit("disconnect_twitch", "");
		}
	},
	"help-text": "Disconnects from Twitch."
};