[![Stories in Ready](https://badge.waffle.io/halkeye/http_bouncer_client.png?label=ready&title=Ready)](https://waffle.io/halkeye/http_bouncer_client)
# http_bouncer_client

[![Build Status](https://travis-ci.org/halkeye/http_bouncer_client.png?branch=master)](https://travis-ci.org/halkeye/http_bouncer_client)
[![Dependency Status](https://gemnasium.com/halkeye/http_bouncer_client.png)](https://gemnasium.com/halkeye/http_bouncer_client)

Simple app that talks to `http_bouncer_server` using and replays http hits

## About

I created this so I could have a public server listening for http hits, and then replay them locally.

## Getting Started

Have an `http_bouncer_server` up and running

### 1) CLI Mode


    http_bouncer_client -s http://another-server-blah-blah/ -c 'gavin:http://localhost/dev_application?query_string_to_merge=1' -c 'gavin2:http://localhost/dever_application?query_string_to_merge=1'

### 2) Custom script mode


    var client = new require('http_bouncer_client')();
    client.setServer('http://other-server-blah-blah/');
    client.addChannel('gavin', 'http://localhost/dev_application?query_string_to_merge=1');
    client.addChannel('gavin2', 'http://localhost/dever_application?query_string_to_merge=1');
    client.start();

## Release History

0.0.3 - 2014-06-27

* Fix another bug with bin client (-c now works)

0.0.2 - 2014-06-19

* Fix bug with bin client

0.0.1 - 2014-06-17

* Initial Release

## License
Copyright (c) 2014 Gavin Mogan
Licensed under the MIT license.

