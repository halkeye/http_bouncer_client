http_bouncer_client
====

Simple app that talks to `http_bouncer_server` using websockets. 

I created this so I could have a public server listening for http hits, and then replay them locally.

You'll need to have a bouncer server setup. (`npm install http_bouncer_server && node node_modules/http_bouncer_server/index.js`)

There are two modes that this can work.

1) CLI Mode
----

    http_bouncer_client -s http://another-server-blah-blah/ -c 'gavin:http://localhost/dev_application?query_string_to_merge=1' -c 'gavin2:http://localhost/dever_application?query_string_to_merge=1'

2) Custom script mode
----

    var client = new require('http_bouncer_client');
    client.setServer('http://other-server-blah-blah/');
    client.addChannel('gavin', 'http://localhost/dev_application?query_string_to_merge=1');
    client.addChannel('gavin2', 'http://localhost/dever_application?query_string_to_merge=1');
    client.start();

