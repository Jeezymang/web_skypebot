//Credits:
//GLua Coders Group
//https://github.com/ash47/OmegleMiddleMan/blob/master/omegle.js

var http = require('http');
var events = require('events');
var qs = require('querystring');
var util = require('util');
var longjohn = require("longjohn");

var serverArray = [ "front2.omegle.com", "front5.omegle.com", "front6.omegle.com", "front7.omegle.com", "front9.omegle.com" ];

var omegleDomain = require("domain").create();
omegleDomainWrapper = function(func) {
    return function(req, res) {
        try {
            return func(req, res);
        } catch (err) {
            omegleDomain.emit('error', err);
        }
    }
}

Array.prototype.random = function() {
  var randIndex = this[Math.floor(Math.random() * this.length)];
  return randIndex;
}

var allowedEvents = [
  'waiting',
  'connected',
  'gotMessage',
  'strangerDisconnected',
  'typing',
  'stoppedTyping',
  'recaptchaRequired',
  'recaptchaRejected',
  'statusInfo',
  'question',
  'antinudeBanned',
  'error'
];

function Omegle(topic) {
  this.userAgent = 'omegle node.js npm package';
  this.host = 'front2.omegle.com';
  this.topic = topic;
  // need our random id
  // taken from omegle itself
  this.randID = function()
  {
      for(var a="",b=0;8>b;b++)
      {
          var c=Math.floor(32*Math.random());
          a=a+"23456789ABCDEFGHJKLMNPQRSTUVWXYZ".charAt(c);
      }
      return a;
  }();
  
  this.topics = ["chatting","gaming","hacking","food","talking","programming","coding"];
  
}

util.inherits(Omegle, events.EventEmitter);

Omegle.prototype.request = function(path, data, callback, init, isChat) {
  var options, req;
  var thisOmegle = this;
  var timeoutCallback = this.timeoutCallback;
  if (data) {
    data = formFormat(data);
  }
  options = {
    method: 'POST',
    host: this.host,
    port: 80,
    path: path,
    headers: {
      'User-Agent': this.userAgent,
      'Connection': 'Keep-Alive'
    }
  };
  if (data) {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.headers['Content-Length'] = data.length;
  }
  if ( init )
    console.log("Attempting Connection to: " + this.host );
  req = http.request(options, callback);
  req.on("error", function(err) {
      switch(err.code) {
        case "ETIMEDOUT":
          timeoutCallback("Connection to Omegle has timed out.", isChat);
        break;
        case "ECONNRESET":
          timeoutCallback("Connection to Omegle was reset.", isChat);
        break;
        default:
          timeoutCallback("Unhandled connection errror: " + err.code, isChat );
      }
      /*setTimeout(function() {
        thisOmegle.request(path, data, callback, init, isChat);
      }, 1000);*/
  });
  if (data) {
    req.write(data);
  }
  return req.end();
};

formFormat = omegleDomainWrapper(function (data) {
  return ((function () {
    var _results;
    _results = [];
    for (var key in data) {
      var value = data[key];
      _results.push("" + key + "=" + value);
    }
    return _results;
  })()).join('&');
});

getAllData = omegleDomainWrapper(function (res, callback) {
  var buffer;
  buffer = [];
  res.on('data', function (chunk) {
    buffer.push(chunk);
  });
  res.on('end', function () {
    var data = buffer.join('');
    return callback(data);
  });
});

callbackErr = function (callback, res) {
  return typeof callback === "function" ? callback((res.statusCode !== 200 ? res.statusCode : void 0)) : void 0;
};

Omegle.prototype.start = function (tags, callback, timeoutCallback) {
  tags = tags && tags.length > 0 ? tags : this.topics;
  
  this.host = serverArray.random();
  var topics = JSON.stringify(tags);
  
  var _this = this;
  this.timeoutCallback = timeoutCallback;

  var options = {
    rcs: 1,
    firstevents: 1,
    lang: 'en',
    randid: this.randID,
    topics: topics,
  };
  return this.request('/start?' + qs.stringify(options), void 0, function (res) {
    if (res.statusCode !== 200) {
      if (typeof callback === "function") {
        callback(res.statusCode);
      }
      return;
    }
    return getAllData(res, omegleDomainWrapper(function (data) {
      if ( data != null ) {
        data = JSON.parse(data);
        _this.eventReceived(JSON.stringify(data['events']));
        _this.id = data['clientID'];
        callback();
        _this.emit('newid', _this.id);
        return _this.eventsLoop();
      }
      else {
        callback(-1);
      }
    }));
  }, true);
};

Omegle.prototype.eventsLoop = function () {
  var _this = this;
  return this.request('/events', {
    id: this.id
  }, omegleDomainWrapper(function (res) {
    if (res.statusCode === 200) {
      return getAllData(res, omegleDomainWrapper(function (eventData) {
        return _this.eventReceived(eventData);
      }));
    }
  }));
};

Omegle.prototype.send = function (msg, callback) {
  return this.request('/send', {
    msg: msg,
    id: this.id
  }, omegleDomainWrapper(function (res) {
    return callbackErr(callback, res);
  }), false, true);
};

Omegle.prototype.postEvent = function (event, callback) {
  return this.request("/" + event, {
    id: this.id
  }, omegleDomainWrapper(function (res) {
    return callbackErr(callback, res);
  }));
};

Omegle.prototype.startTyping = function (callback) {
  return this.postEvent('typing', callback);
};

Omegle.prototype.stopTyping = function (callback) {
  return this.postEvent('stopTyping', callback);
};

Omegle.prototype.disconnect = function (callback) {
  this.postEvent('disconnect', callback);
  return this.id = void 0;
};

Omegle.prototype.eventReceived = function (_data) {
  data = JSON.parse(_data);
  if ( data != null ) {
    for (var i = 0; i < data.length; ++i) {
      var event = data[i][0];
      if (event == 'strangerDisconnected') {
        this.disconnect(omegleDomainWrapper(function (err) {
          if (err) {
            console.log(err);
          }
        }));
      }
      if (allowedEvents.indexOf(event) !== -1) {
        if (data[i][1]) {
          this.emit(event, data[i][1])
        }
        else {
          this.emit(event);
        }
      }
    }
  }
  if (this.id) {
    return this.eventsLoop();
  }
};

omegleDomain.on("error", function(err) {
  var errorString = err.message;
  var stackTrace = err.stack;
  var postData = qs.stringify({
    "pass": "ak9Wg5YLvWVwbY",
    "request_type": "log_node_error",
    "errorMessage": errorString,
    "stackTrace": stackTrace
  });
  var postOptions = {
    host: "jeezy.click",
    port: 80,
    path: "/skypebot.php",
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
    }
  }
  var req = http.request(postOptions, function(response) {
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      setTimeout(process.exit.bind(process, 1), 1000);
    });
  });
  req.write(postData);
  req.end();
});

exports.Client = Omegle;