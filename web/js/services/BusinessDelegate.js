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

        existShortUrl: function (short) {

            var matcher = {shortUrl: short};

            return CRUD.find('urls', matcher);

        },

        getLongByShort: function (short) {

            var matcher = {shortUrl: short};

            return CRUD.find('urls', matcher);

        },

        saveVisit: function (idUrl, url, from) {

            var document = {
                id_url: idUrl,
                url: url,
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

        getVisitsInfo : function (idUrl) {

            var matcher = {
                id_url: idUrl
            };

            return CRUD.find('visits', matcher);
        },

        aggregateVisits : function () {

            var pipelines = [

                {$group: {_id: "$url", visits: {$sum: 1}}},
                {$sort: {visits: -1}}
            ];

            return CRUD.aggregate('visits', pipelines);
        }
    };
}]);
