var vertx = require('vertx');
var container = require('vertx/container');

var mongo_config = {

    address: 'vertx.mongopersistor',
    host: '192.168.99.100',
    port: 27017,
    database: 'default_db'
};

var webServerConf = {
    port: 8080,
    host: 'localhost',
    bridge: true,

    inbound_permitted: [
        // Allow calls to login and authorise
        {
            address: 'vertx.basicauthmanager.login'
        },
        // Allow calls to get static album data from the persistor
        {
            address: 'vertx.mongopersistor',

            match: {
                action: 'find',
                collection: 'urls'
            }
        },
        {
            address: 'vertx.mongopersistor',
            requires_auth: false,
            match: {
                action: 'save',
                collection: 'urls'
            }
        },
        {
            address: 'vertx.mongopersistor',
            requires_auth: false,
            match: {
                action: 'save',
                collection: 'visits'
            }
        },
        {
            address: 'vertx.mongopersistor',
            requires_auth: false,
            match: {
                action: 'count',
                collection: 'visits'
            }
        },
        {
            address: 'vertx.mongopersistor',
            requires_auth: false,
            match: {
                action: 'find',
                collection: 'visits'
            }
        },
        {
            address: 'vertx.mongopersistor',
            requires_auth: false,
            match: {
                action: 'command'
            }
        }
    ],

    outbound_permitted: [{}]
};

container.deployModule('io.vertx~mod-mongo-persistor~2.1.1', mongo_config, function() {

    load('indexes.js');
});

container.deployModule('io.vertx~mod-auth-mgr~2.0.0-final');

container.deployModule('io.vertx~mod-web-server~2.0.0-final', webServerConf);
