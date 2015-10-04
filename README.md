# web_skypebot
A Chrome extension that acts as a bot for Skype, a work in progress.</br></br>
<b>Disclaimer</b></br>
This is a work in progress, it's still buggy and inefficient.
</br>
The bot should still work without the configuration below, just less features.</br>
You may need to visit your https server/local url in your web browser to create a certificate.
</br>
</br>
<b>Setting up the SkypeBot</b></br>
</br>
<b>Basic Setup</b></br></br>
Go to the extensions management page.</br>
Enable developer mode.</br>
Load an unpackaged extension, choose the skypebot_extension folder.</br>
Enable incognito mode for the extension.</br>
Open a new Chrome incognito tab and login into web.skype.com.</br>
Once everything is loaded, press the user icon to the right of your url input.</br>
You should see the console, set the main conversation with set-config-value main-conversation [name-here].</br>
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
