var HttpProxyAgent = require('http-proxy-agent');
//var HttpsProxyAgent = require('https-proxy-agent');
var io = require('socket.io-client');
var request = require('request');
var url = require('url');
var path = require('path');
var nconf = require('nconf');
var _ = require('underscore');

nconf.add('global', { type: 'file', file: './config.json' });
nconf.add('user', { type: 'file', file: './config.local.json' });
nconf.load();

var agent;
if (process.env.http_proxy) {
  agent = HttpProxyAgent.new(process.env.http_proxy);
}

var socket = io.connect(nconf.get('socket_server'), { agent: agent });

socket.on('connect_error', function() { console.log('connect_error', arguments); });
socket.on('error', function() { console.log('error', arguments); });
socket.on('event', function(data){ console.log('event', data); });
socket.on('connect', function() { console.log('connected', arguments); });

socket.on('request_channels', function() {
  console.log('requesting channels');
  Object.keys(nconf.get('channels')).forEach(function(channel) {
    socket.emit('listen_channel', channel);
  });
});

socket.on('channel_data', function(channel, data) {
  data = JSON.parse(data);
  delete data.headers.host; // Public host != private host

  var server = nconf.get('channels:'+channel);

  if (!server) {
    //console.log('channel_data', channel, data);
    console.log('Unable to handle ', channel);
    return;
  }

  /* Use data from socket server to build a nice url */
  var parsed_url = url.parse(server, true);
  parsed_url.pathname = path.join(parsed_url.pathname, data.path);
  if (data.query) {
    delete parsed_url.search;
    parsed_url.query = _.extend(parsed_url.query,data.query);
  }
  parsed_url = url.format(parsed_url);

  /* POST/GET that sucka */
  request({
    url: parsed_url, 
    method: data.method,
    headers: data.headers,
    body: data.body,
  }, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log('Unable to connect to target(' + parsed_url + '):', body);
    } else {
      console.log('Submitted to ' + parsed_url);
    }
  });

});
