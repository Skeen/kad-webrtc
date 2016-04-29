'use strict';

var kademlia = require('kad');
var EventEmitter = require('events').EventEmitter;
var WebRTC = require('../..');
var request = require('request');

var node;
var bootstrap_node_tries = 3;

var element = document.querySelector('#node input[name=id]');
var id_string = Math.random().toString(36).substring(7);
element.value = id_string;

request('http://localhost:3032/', function (error, response, body)
{
    var bootstrap_seeds = [];
    if (!error && response.statusCode == 200)
    {
        bootstrap_seeds = JSON.parse(body);
    }
    else
    {
        console.warn("Unable to get nodes list!");
    }

    var webSocket = require('./web-socket');
    var SignalClient = require('./signal-client');
    var signaller = new SignalClient(id_string);

    webSocket.on('open', function()
    {
        node = new kademlia.Node({
            transport: new WebRTC(new WebRTC.Contact({
                nick: id_string
            }), { signaller: signaller }),
            storage: new kademlia.storage.LocalStorage(id_string),
        });

        function onConnect()
        {
            alert("Connection established!");
        }
        node.on('connect', onConnect);

        if(bootstrap_seeds.length !== 0)
        {
            function connect(tries_left)
            {
                if(tries_left === 0)
                {
                    alert("UNABLE TO CONNECT!");
                    return;
                }

                var random_seed = bootstrap_seeds[Math.floor(Math.random()*bootstrap_seeds.length)];
                // Try 3 bootstrap nodes
                node.connect(random_seed, function(err)
                {
                    if(err)
                    {
                        console.warn(err);
                        connect(tries_left - 1);
                        return;
                    }
                });
            }
            connect(bootstrap_node_tries);
        }
    });
});

document.querySelector('#get').addEventListener('submit', function (e)
{
    // Prevent page refresh
    e.preventDefault();

    var element = document.querySelector('#get input[name=key]');
    var key_string = element.value;

    console.log("Lookup key: " + key_string);

    node.get(key_string, function(err, value) 
    {
        if(err)
        {
            alert(err);
            return;
        }
        alert(value);
    });
});

document.querySelector('#put').addEventListener('submit', function (e)
{
    // Prevent page refresh
    e.preventDefault();

    var element;

    element = document.querySelector('#put input[name=key]');
    var key_string = element.value;

    element = document.querySelector('#put input[name=value]');
    var value_string = element.value;

    console.log("Save key: " + key_string);
    console.log("Save value: " + value_string);

    node.put(key_string, value_string, function(err)
    {
        if(err) 
        {
            alert(err);
            return;
        }
        alert("Stored!");
    });
});

