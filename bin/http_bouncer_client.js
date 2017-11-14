#!/usr/bin/env node

var package = require(require('path').resolve(__dirname + '/../package.json'));

function channels(val, c) {
  var vals = val.split(':');
  c.push([vals.shift(), vals.join(':')]);
  return c;
}

var program = require('commander');
program.version(package.version);
program.option(
  '-s, --server [server]',
  'Socket Server (Default: http://localhost:3000/)',
  'http://localhost:3000/'
);
program.option(
  '-c, --channels [value]',
  'Channels to listen to (format is keyname:server)',
  channels,
  []
);
program.parse(process.argv);

var client = new require('../index.js')();
client.setServer(program.server);
program.channels.forEach(function(val) {
  /* Start listening to Channels in config file */
  client.addChannel(val[0], val[1]);
});
client.start();
