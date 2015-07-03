/**
 * Created by Fabio on 20/06/2015.
 */

var module = angular.module('BusinessDelegate', ['CRUD']);

module.factory('BusinessDelegate',['CRUD', function (CRUD) {

    return {


        saveUrl: function (long, short, isCustom, id_stats) {

            var document = {
                longUrl: long,
                shortUrl: short,
                custom: isCustom,
                id_stats: id_stats,
                createdOn: Date.now()
            };

            return CRUD.save('urls', document);
        },

        saveStat : function () {

            var document = {
                nClick : 0
            };

            return CRUD.save('stats', document);

        },

        existShortUrl: function (short) {

            var matcher = {shortUrl: short};

            return CRUD.find('urls', matcher);

        },

        getLongByShort : function (short) {

            var matcher = {shortUrl : short};

            return CRUD.find('urls', matcher);

        },

        updateClick : function(idStats) {

            var criteria = {_id : idStats};
            var data = {$inc : {nClick : 1}};

            return CRUD.update('stats', criteria, data);

        },

        getStats : function() {

            //Get all data from stats collection
            var matcher = {};

            return CRUD.find('stats', matcher);
        }

    };
}]);
