/**
 * Created by Fabio on 17/06/2015.
 */

var module = angular.module('CRUD', []);

module.factory('CRUD', ['$q', function ($q) {

    //Crea una nuova istanza di tipo EventBus, per comunicare con il Server vertx
    var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');

    eb.onclose = function () {
        eb = null;
    };

    return {

        //Invio richiesta al server
        sendRequest: function (requestDoc) {

            var modulo = 'vertx.mongopersistor';
            var deferred = $q.defer();

            eb.send(modulo, requestDoc,
                function (reply) {
                    deferred.resolve(reply);
                });
            return deferred.promise;

        },

        find: function (collection, matcher) {

            var params = {
                action: 'find',
                collection: collection,
                matcher: matcher
            };
            return this.sendRequest(params);
        },

        save: function (collection, document) {

            var params = {
                action: 'save',
                collection: collection,
                document: document
            };
            return this.sendRequest(params);
        },

        update: function(collection, criteria, data) {

            var params = {
                action: 'update',
                collection: collection,
                criteria: criteria,
                objNew: data,
                upsert: false,
                multi: false
            };

            return this.sendRequest(params);
        },

        count: function(collection, matcher) {

            var params = {
                action: 'count',
                collection: collection,
                matcher: matcher
            };
            return this.sendRequest(params);
        },

        aggregate: function(collection, pipelines) {

            var params = {
                'action': 'command',
                'command': JSON.stringify({
                    aggregate: collection,
                    pipeline: pipelines
                })
            };

            return this.sendRequest(params);
        }
    };
}]);



