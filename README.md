# web_skypebot
A Chrome extension that acts as a bot for Skype, a work in progress.</br></br>
<b>Disclaimer</b></br>
This is a work in progress, it's still buggy and inefficient.
</br>
You can basically ignore everything in this disclaimer if you use basic_skypebot_extension.
</br>
The bot should still work without the configuration below, just less features.</br>
You may need to visit your https server/local url in your web browser to create a certificate.
</br>
You don't need to have two seperate nodejs servers, it's just what I did to cut down on my web server usage.
</br>
</br>
<b>Setting up the SkypeBot</b></br>
</br>
<b>Basic Setup</b></br></br>
Step 1: Go to the extensions management page.</br>
Step 2:Enable developer mode.</br>
Step 3:Load an unpackaged extension, choose the skypebot_extension folder.</br>
Step 3 (Optional):Instead load the basic_skypebot_extension folder.</br>
You can use the extension without any configuration or external scripts then.</br>
Step 4: Enable incognito mode for the extension.</br>
Step 5: Open a new Chrome incognito tab and login into web.skype.com.</br>
Once everything is loaded, press the user icon to the right of your url input.</br>
You should see the console, set the main conversation with set-config-value main-conversation [name-here].</br>
Step 6 (Optional):Run the php/queries.sql on your database if using the external scripts.</br>
</br>
<b>Basic Usage</b></br></br>
Your commands should follow the command-prefix configuration text, by default it's !skypebot.</br>
Some commands that may be useful are <i>commands</i>, <i>command-help</i>, and <i>config-value-help</i>.</br>
For example, if the command-prefix was !skypebot, you'd do !skypebot commands in chat.</br>
When using commands directly in the console, you don't need the prefix.</br>
</br>
<b>Node Modules</b></br>
<ul>
    <li>Steam ( npm install steam )</li>
    <li>irc ( npm install irc )</li>
    <li>socket.io ( npm install socket.io )</li>
    <li>lua.vm.js ( https://github.com/kripken/lua.vm.js )</br>You will need to compile Lua or get binaries.</li>
</ul>
</br>
<b>Configuration</b></br>
</br>
<b>skypebot_extension/config.js</b></br>
<ul>
    <li>Server Key ( the key inside of the .php files )</li>
    <li>Server Address ( the socket ip )</li>
    <li>Local Address ( the socket ip )</li>
    <li>Web Server URL ( the url with the php scripts )</li>
    <li>Cleverbot API User ( cleverbot.io )</li>
    <li>Cleverbot API Password</li>
    <li>Mashape API Key ( market.mashape.com )</li>
</ul>
<b>php/youtube_api.php</b></br>
<ul>
    <li>Youtube API Key</li>
    <li>Server Key</li>
</ul>
<b>php/skypebot.php</b></br>
<ul>
    <li>Server Key</li>
    <li>Database Host</li>
    <li>Database User</li>
    <li>Database Password</li>
    <li>Database Schema</li>
</ul>
<b>node/local_server.js</b></br>
<ul>
    <li>Steam API Key</li>
    <li>Steam Username</li>
    <li>Steam Password</li>
    <li>Twitch Username</li>
    <li>Twitch OAuth Password</li>
    <li>Server Key</li>
    <li>Server URL ( with the php scripts on it )</li>
</ul>
