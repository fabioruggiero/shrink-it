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
        sendRequest: function (documentoParametri) {

            var modulo = 'vertx.mongopersistor';
            var deferred = $q.defer();

            eb.send(modulo, documentoParametri,
                function (reply) {
                    deferred.resolve(reply);
                    console.log('A reply received: ', reply);
                });
            return deferred.promise;

        },

        find: function (collection, matcher) {

            var parametri = {action: 'find', collection: collection, matcher: matcher};
            return this.sendRequest(parametri);
        },

        save: function (collection, document) {

            var parametri = {action: 'save', collection: collection, document: document};
            return this.sendRequest(parametri);
        },

        update: function(collection, criteria, data) {

            var parametri = {
                action: 'update',
                collection: collection,
                criteria: criteria,
                objNew: data,
                upsert: false,
                multi: false
            };

            return this.sendRequest(parametri);
        }
    };
}]);



