///////////////////////////////////////////////////////////////////////////
// Bot Values

var configValues = {};
//The prefix for commands, for example !skypebot a-command
//////////////////////////////////////////////////////////
configValues["command-prefix"] = { type: "string", val: "!skypebot", help: "The prefix for the bot's commands." };
//The conversation the bot sh0udld always go back to,  the name of it.
//////////////////////////////////////////////////////////
configValues["main-conversation"] = { type: "string", val: "", help: "The name of the conversation the bot should focus on.", canSet: function( convoName ) {
	if(conversationExists(convoName))
		return [true, ""];
	else
		return [false, "Conversation [ " + convoName + " ] does ont exist."];
} };
configValues["ignore-input"] = { type: "bool", val: false, help: "Whether or not the bot should ignore all user input." };