/**
* @module kad/examples/webrtc-browser-e2e/SignalClient
*/

'use strict';

var EventEmitter = require('events').EventEmitter;
var webSocket = require('./web-socket');
var inherits = require('util').inherits;

inherits(SignalClient, EventEmitter);

/**
* A client for talking to the signal server.
* @param {string} nick
* @constructor
*/
function SignalClient(nick) {
    var signalClient = this;

    webSocket.on('open', function() {
        // Send a message that announces us to the network
        var msg = {
            type: 'announce',
            payload: {
                announceNick: nick 
            }
        };
        webSocket.send(JSON.stringify(msg));
    });

    webSocket.on('message', function(message) {
        var json = JSON.parse(message);
        if(json.type == "announce")
        {
            console.log(message);
        }
        else
        {
            var parsed = json.payload;
            if(nick === parsed.recipient) {
                EventEmitter.prototype.emit.call(signalClient, nick, parsed.message);
            }
        }
    });
}

/**
* Send a signal to the signal server to perform a WebRTC handshake
* @param {string} recipient
* @param {string} message
*/
SignalClient.prototype.emit = function(recipient, message) {
    var msg = {
        type: 'handshake',
        payload: {
            recipient: recipient,
            message: message
        }
    };
    webSocket.send(JSON.stringify(msg));
};

module.exports = SignalClient;
