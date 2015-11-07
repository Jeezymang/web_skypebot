String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join( this );
};

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

//Clears the config values from the local storage.
//////////////////////////////////////////////////////////
function clearConfigValues() {
	localStorage.removeItem("skypebot_config");
	for (var key in configValues) {
		localStorage.removeItem(key);
	}
};

//Saves the config values to the local storage.
//////////////////////////////////////////////////////////
function saveConfigValues() {
	localStorage.setItem("skypebot_config", true);
	for (var key in configValues) {
		localStorage.setItem(key, getConfigValue(key));
	}
};

//Loads the config values from the local storage.
//////////////////////////////////////////////////////////
function loadConfigValues() {
	if (localStorage.getItem("skypebot_config") == null) {
		return false;
	}
	for (var key in configValues) {
		setConfigValue(key, localStorage.getItem(key));
	}
	return true;
};

//Attempts to login.
//////////////////////////////////////////////////////////
function attemptLogin() {
	$("input#username").val(SKYPEBOT_USERNAME);
    $("input#password").val(SKYPEBOT_PASSWORD);
    $(".btn.primaryCta").click();
}

//Checks if Skype has completed loaded.
//////////////////////////////////////////////////////////
function checkIfPageReady() {
	var splashElement = $("div.shellSplashContent");
	if ( splashElement ) {
		if( splashElement.is(":visible") ) {
			setTimeout(checkIfPageReady, 1000);
		}
		else {
			setTimeout(setupBot, 3000);
		}
	}
};

//Attempts to fetch the Skype username from the cache.
//////////////////////////////////////////////////////////
function getSkypeUsername( nickName ) {
	var name = "NULL";
	for ( var key in usernameCache ) {
		if ( usernameCache[key] == nickName ) {
			name = key;
			break;
		}
	}
	return name;
};

//Checks the username cache to see if the Skype username exists.
//////////////////////////////////////////////////////////
function skypeUsernameExists( skypeName ) {
	var doesExist = false;
	for ( var key in usernameCache ) {
		if ( key == skypeName ) {
			doesExist = true;
			break;
		}
	}
	return doesExist;
};

//Returns an array of all the cached Skype usernames.
//////////////////////////////////////////////////////////
function getAllSkypeUsers() {
	var userArray = new Array();
	for ( var key in usernameCache ) {
		userArray.push(key);
	}
	return userArray;
};

//Checks if the Skype nickname is an operator.
//////////////////////////////////////////////////////////
function isOperator( nickName ) {
	var skypeUsername = getSkypeUsername(nickName);
	if ( getConfigValue("operator") != skypeUsername ) {
		return false;
	}
	else {
		return true;
	}
}

//Returns text wrapped in a span with the specified color.
//////////////////////////////////////////////////////////
function coloredSpan( color, text ) {
	return ( "<span style='color: " + color + ";'>" + text + "</span>" );
};

//Returns a style string for html elements via an array with the style
//properties as keys.
//////////////////////////////////////////////////////////
function htmlStyle( styleArray ) {
	var styleString = "style='";
	for ( var key in styleArray ) {
		styleString += key + ": " + styleArray[key] + ";";
	}
	styleString += "'";
	return styleString;
};

//Finds the first child within the parent with the specified class.
//Most likely will be replaced later on.
//////////////////////////////////////////////////////////
function findClassInChildren(parent, name) {
	if ( !parent ) return null;
	if ( !parent.childNodes ) return null;
	for (var i = 0, childNode; i <= parent.childNodes.length; i ++) {
    	childNode = parent.childNodes[i];
   		if (childNode && name == childNode.className) {
        	return childNode;
    	}
    }
};

//Finds the first child within the parent with the specified tag.
//Most likely will be replaced later on.
//////////////////////////////////////////////////////////
function findTagInChildren(parent, name) {
	if ( !parent ) return null;
	if ( !parent.childNodes ) return null;
	for (var i = 0, childNode; i <= parent.childNodes.length; i ++) {
    	childNode = parent.children[i];
   		if (childNode && name == childNode.tagName) {
        	return childNode;
    	}
    }
};

//Returns a timestamp for the specified time.
//////////////////////////////////////////////////////////
function getTimeStamp(time) {
	var timeDate = new Date(time*1000);
	var dayTime = "AM";
	var theHours = timeDate.getHours() + 1;
	var theMinutes = timeDate.getMinutes();
	if ( theMinutes.toString().length == 1 )
		theMinutes = "0" + theMinutes;
	if ( theHours >= 12 ) {
		dayTime = "PM";
		if ( theHours > 12 )
			theHours = theHours - 12;
	}
	var dateString = ( timeDate.getMonth() + 1 ) + "/" + timeDate.getDate() + "/" + timeDate.getFullYear() + " " + theHours + ":" + theMinutes + dayTime;
	return dateString;
};

//Returns a string with the stats on how long the bot has been running.
//////////////////////////////////////////////////////////
function getBotRuntime() {
	var currentTime = new Date().getTime();
	var diffTime = currentTime - startTime;
	var seconds = Math.round( diffTime / 1000 % 60 );
	var minutes = Math.round( diffTime / (60 * 1000) % 60 );
	var hours = Math.round( diffTime / (60 * 60 * 1000) % 24 );
	var days = Math.round( diffTime / (24 * 60 * 60 * 1000) );
	return ( [seconds, minutes, hours, days] );
};

//For setting the config values within config.js
//////////////////////////////////////////////////////////
function setConfigValue(key, val) {
	if ( configValues.hasOwnProperty(key) ) {
		var dataType = configValues[key].type;
		switch( dataType ) {
			case "bool":
				var boolVal = val;
				if(typeof(boolVal) == "string") {
					if(boolVal.toLowerCase() == "true")
						boolVal = true;
					else
						boolVal = false;
				}
				configValues[key].val = boolVal;
			break;
			case "string":
				configValues[key].val = val;
			break;
			case "number":
				var numVal = val;
				if (typeof(numVal) == "string")
					numVal = parseInt(numVal);
				configValues[key].val = numVal;
			break;
		}
	}
};

//For getting the config values within config.js
//////////////////////////////////////////////////////////
function getConfigValue(key) {
	if(configValues.hasOwnProperty(key)) {
		return configValues[key].val;
	}
	else {
		return null;
	}
};