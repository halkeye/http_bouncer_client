http_bouncer_client
====

Simple app that talks to `http_bouncer_server` using websockets. 

I created this so I could have a public server listening for http hits, and then replay them localally

config.local.json
----

    {
        "channels:gavin" : "http://localhost/dev_application?query_string_to_merge=1"
    }

This config file will allow me to hit `http://http_bouncer_server/handler/gavin` and have it replayed to `http://localhost/dev_application`
