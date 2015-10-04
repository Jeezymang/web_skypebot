String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join( this );
};

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

function coloredSpan( color, text ) {
	return ( "<span style='color: " + color + ";'>" + text + "</span>" );
};

function htmlStyle( styleArray ) {
	var styleString = "style='";
	for ( var key in styleArray ) {
		styleString += key + ": " + styleArray[key] + ";";
	}
	styleString += "'";
	return styleString;
};

function mashapeRequest(url, responseType, callback) {
	$.ajax({url: url, headers: { "X-Mashape-Key": MASHAPE_API_KEY, "Accept": responseType }, success: function(response) {
		callback(response);
	}});
};

function kevinToFahrenheit(temp) {
	return Math.round(( temp - 273.15 ) * 1.8000 + 32);
};

//This function is nasty, will make it better later..maybe.. needs fixing as well
function getRatingStars(likes, dislikes) {
	var likeRatio = 0;
	var starCount = 0;
	if ( likes >= dislikes ) {
		likeRatio = Math.max(dislikes,1)/Math.max(likes, 1);
		starCount = 5 - (Math.round(5 * likeRatio));
	}
	else {
		likeRatio = Math.max(likes, 1)/Math.max(dislikes, 1);
		if ( likes == 0 )
			likeRatio = 0;
		starCount = (Math.round(5 * likeRatio));
	}
	if ( likes == 0 && dislikes == 0 )
		starCount = 0;
	var starString = "";
	if ( starCount > 0 ) {
		starString += "★".repeat(starCount);
		starString += "☆".repeat(5 - starCount);
	}
	else {
		starString = "☆☆☆☆☆";
	}
	return starString;
};

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

function getBotRuntime() {
	var currentTime = new Date().getTime();
	var diffTime = currentTime - startTime;
	var seconds = Math.round( diffTime / 1000 % 60 );
	var minutes = Math.round( diffTime / (60 * 1000) % 60 );
	var hours = Math.round( diffTime / (60 * 60 * 1000) % 24 );
	var days = Math.round( diffTime / (24 * 60 * 60 * 1000) );
	return ( [seconds, minutes, hours, days] );
};

function getPageContents(url, callback) {
	$.post( WEB_SERVER_URL + "/skypebot.php", {request_type: "getpagecontents", pass: "ak9Wg5YLvWVwbY", url: url}, function(result){
		callback(result);
	});
};

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

function getConfigValue(key) {
	if(configValues.hasOwnProperty(key)) {
		return configValues[key].val;
	}
	else {
		return null;
	}
};