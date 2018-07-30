let HttpProxyAgent = require('http-proxy-agent');
// var HttpsProxyAgent = require('https-proxy-agent');
let io = require('socket.io-client');
let request = require('request');
let url = require('url');
let path = require('path');
let _ = require('underscore');

module.exports = function () {
  let socket;
  let socket_server = 'http://localhost:3000/';
  let channels = {};
  this.setServer = function (value) { socket_server = value; };
  this.addChannel = function (channel, server) {
    if (channels[channel]) {
      console.trace('WARNING - Already listening to ' + channel);
    }
    channels[channel] = server;
    if (socket) {
      socket.emit('listen_channel', channel);
    }
  };

  let listen = function (socket_server) {
    let agent;
    if (process.env.http_proxy && /http:\/\//.test(socket_server)) {
      agent = new HttpProxyAgent(process.env.http_proxy);
    }

    return io.connect(socket_server, { agent: agent });
  };

  this.start = function () {
    if (!Object.keys(channels).length) {
      console.log('WARNING - no channels to listen to');
    }

    socket = listen(socket_server);

    socket.on('connect_error', function () { console.log('connect_error', arguments); });
    socket.on('error', function () { console.log('error', arguments); });
    socket.on('event', function (data) { console.log('event', data); });
    socket.on('connect', function () { console.log('connected to ' + this.io.uri); });

    socket.on('request_channels', function () {
      Object.keys(channels).forEach(function (channel) {
        socket.emit('listen_channel', channel);
      });
    });

    socket.on('channel_data', function (channel, data) {
      delete data.headers.host; // Public host != private host

      let server = channels[channel];

      if (!server) {
        // console.log('channel_data', channel, data);
        console.log('Unable to handle ', channel);
        return;
      }

      /* Use data from socket server to build a nice url */
      let parsed_url = url.parse(server, true);
      parsed_url.pathname = path.join(parsed_url.pathname, data.path);
      if (data.query) {
        delete parsed_url.search;
        parsed_url.query = _.extend(parsed_url.query, data.query);
      }
      parsed_url = url.format(parsed_url);

      /* POST/GET that sucka */
      request({
        url: parsed_url,
        method: data.method,
        headers: data.headers,
        body: data.body
      }, function (error, response, body) {
        if (error || response.statusCode !== 200) {
          // FIXME - emit('error, ....);
          console.log('Unable to connect to target(' + parsed_url + '):', body);
        } else {
          // FIXME - emit('success, ....);
          console.log('Submitted to ' + parsed_url);
        }
      });
    });
  };
  return this;
};
