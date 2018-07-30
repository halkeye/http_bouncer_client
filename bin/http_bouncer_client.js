#!/usr/bin/env node

const path = require('path');
const packageJSON = require(require('path').resolve(
  path.join(__dirname, '/../package.json')
));

function channels (val, c) {
  const vals = val.split(':');
  c.push([vals.shift(), vals.join(':')]);
  return c;
}

const program = require('commander');
program.version(packageJSON.version);
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

const App = require('../index.js');
const client = new App();
client.setServer(program.server);
program.channels.forEach(function (val) {
  /* Start listening to Channels in config file */
  client.addChannel(val[0], val[1]);
});
client.start();
