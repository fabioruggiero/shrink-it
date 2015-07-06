/**
 * Created by Fabio on 20/06/2015.
 */

var module = angular.module('BusinessDelegate', ['CRUD']);

module.factory('BusinessDelegate', ['CRUD', function (CRUD) {

    return {


        saveUrl: function (long, short, isCustom) {

            var document = {
                longUrl: long,
                shortUrl: short,
                custom: isCustom,
                createdOn: Date.now()
            };

            return CRUD.save('urls', document);
        },

        saveStat: function () {

            var document = {
                nClick: 0
            };

            return CRUD.save('stats', document);

        },

        existShortUrl: function (short) {

            var matcher = {shortUrl: short};

            return CRUD.find('urls', matcher);

        },

        existOneShortUrl: function (short) {

            var matcher = {shortUrl: short};

            return CRUD.findOne('urls', matcher);

        },

        getLongByShort: function (short) {

            var matcher = {shortUrl: short};

            return CRUD.find('urls', matcher);

        },

        saveVisit: function (idUrl, from) {

            var document = {
                id_url: idUrl,
                visitedOn: Date.now(),
                visitedFrom: from
            };

            return CRUD.save('visits', document);
        },

        countVisits: function (idUrl) {

            var matcher = {
                id_url: idUrl
            };

            return CRUD.count('visits', matcher);
        },

        getVisitFrom : function (idUrl) {

            var matcher = {
                id_url: idUrl
            };

            return CRUD.find('visits', matcher);
        },

        getVisitTime : function (idUrl) {

            var matcher = {
                id_url: idUrl
            };

            return CRUD.find('visits', matcher);
        },

        aggregateVisits : function () {

            var pipelines =

                {$group: {_id: '$id_url', count: {$sum: 1}}}
            ;

            return CRUD.aggregate('visits', pipelines);
        }
    };
}]);
