let HttpProxyAgent = require('http-proxy-agent');
// var HttpsProxyAgent = require('https-proxy-agent');
let io = require('socket.io-client');
let request = require('request');
let url = require('url');
let path = require('path');
let _ = require('underscore');

module.exports = function () {
  let socket;
  let socketServer = 'http://localhost:3000/';
  let channels = {};
  this.setServer = function (value) {
    socketServer = value;
  };
  this.addChannel = function (channel, server) {
    if (channels[channel]) {
      console.trace('WARNING - Already listening to ' + channel);
    }
    channels[channel] = server;
    if (socket) {
      socket.emit('listen_channel', channel);
    }
  };

  let listen = function (socketServer) {
    let agent;
    if (process.env.http_proxy && /http:\/\//.test(socketServer)) {
      agent = new HttpProxyAgent(process.env.http_proxy);
    }

    return io.connect(
      socketServer,
      { agent: agent }
    );
  };

  this.start = function () {
    if (!Object.keys(channels).length) {
      console.log('WARNING - no channels to listen to');
    }

    socket = listen(socketServer);

    socket.on('connect_error', function () {
      console.log('connect_error', arguments);
    });
    socket.on('error', function () {
      console.log('error', arguments);
    });
    socket.on('event', function (data) {
      console.log('event', data);
    });
    socket.on('connect', function () {
      console.log('connected to ' + this.io.uri);
    });

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
      let parsedUrl = url.parse(server, true);
      parsedUrl.pathname = path.join(parsedUrl.pathname, data.path);
      if (data.query) {
        delete parsedUrl.search;
        parsedUrl.query = _.extend(parsedUrl.query, data.query);
      }
      parsedUrl = url.format(parsedUrl);

      /* POST/GET that sucka */
      request(
        {
          url: parsedUrl,
          method: data.method,
          headers: data.headers,
          body: data.body
        },
        function (error, response, body) {
          if (error || response.statusCode !== 200) {
            // FIXME - emit('error, ....);
            console.log(
              'Unable to connect to target(' + parsedUrl + '):',
              body
            );
          } else {
            // FIXME - emit('success, ....);
            console.log('Submitted to ' + parsedUrl);
          }
        }
      );
    });
  };
  return this;
};
