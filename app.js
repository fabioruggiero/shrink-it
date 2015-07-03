var vertx = require('vertx');
var container = require('vertx/container');

var mongo_config = {

  address: 'vertx.mongopersistor',
  host: '192.168.99.100',
  port: 27017,
  database: 'pippo'
};

var webServerConf = {  
  port: 8080,
  host: '127.0.0.1',
  bridge: true,

  inbound_permitted: [
    // Allow calls to login and authorise
    {
      address: 'vertx.basicauthmanager.login'
    },
    // Allow calls to get static album data from the persistor
    {
      address : 'vertx.mongopersistor',
      match : {
        action : 'find',
        collection : 'urls'
      }
    },
    {
      address : 'vertx.mongopersistor',
      requires_auth : false,  
      match : {
        action : 'save',
        collection : 'urls'
      }
    },
    {
      address : 'vertx.mongopersistor',
      requires_auth : false,
      match : {
        action : 'save',
        collection : 'stats'
      }
    },
    {
      address : 'vertx.mongopersistor',
      requires_auth : false,
      match : {
        action : 'update',
        collection : 'stats'
      }
    },
    {
      address : 'vertx.mongopersistor',
      requires_auth : false,
      match : {
        action : 'find',
        collection : 'stats'
      }
    }
  ],

  outbound_permitted: [ {} ]
};

container.deployModule('io.vertx~mod-mongo-persistor~2.0.0-final', mongo_config, 1);

container.deployModule('io.vertx~mod-auth-mgr~2.0.0-final');

container.deployModule('io.vertx~mod-web-server~2.0.0-final', webServerConf);
