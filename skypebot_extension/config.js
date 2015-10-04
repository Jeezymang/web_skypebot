
///////////////////////////////////////////////////////////////////////////
// API Keys - SET THESE

var MASHAPE_API_KEY = "";

var CLEVERBOT_API_USER = "";

var CLEVERBOT_API_PASS = "";

///////////////////////////////////////////////////////////////////////////
// Server Misc

var SERVER_KEY = "AWmga7KhSnzs4qke";

var SERVER_ADDRESS = "https://server-ip:8080/";

var LOCAL_ADDRESS = "localhost:8080/";

var WEB_SERVER_URL = "https://example.com";

///////////////////////////////////////////////////////////////////////////
// Bot Values

var configValues = {};
configValues["command-prefix"] = { type: "string", val: "!skypebot", help: "The prefix for the bot's commands." };
configValues["main-conversation"] = { type: "string", val: "", help: "The name of the conversation the bot should focus on.", canSet: function( convoName ) {
	if(conversationExists(convoName))
		return [true, ""];
	else
		return [false, "Conversation [ " + convoName + " ] does not exist."];
} };
configValues["ignore-input"] = { type: "bool", val: false, help: "Whether or not the bot should ignore all user input." };
configValues["twitch-send-names"] = { type: "bool", val: false, help: "Whether or not to send Skype names to Twitch." };
configValues["omegle-send-names"] = { type: "bool", val: false, help: "Whether or not to send Skype names to Omegle." };
configValues["cleverbot-response"] = { type: "bool", val: true, help: "Whether or not Cleverbot will randomly reply to people." };
configValues["cleverbot-enabled"] = { type: "bool", val: true, help: "Whether or not Cleverbot is enabled." };
configValues["message-logging"] = { type: "bool", val: false, help: "Whether or not to log messages to the database." };
configValues["steam-communication"] = { type: "bool", val: false, help: "Whether or not to allow Skype-><-Steam communication."};
configValues["lua-character-limit"] = { type: "number", val: 1000, help: "The amount of characters that Lua can print in a single execution." };
configValues["cleverbot-response-chance"] = { type: "number", val: 30, help: "The chance that Cleverbot will reply to messages." };