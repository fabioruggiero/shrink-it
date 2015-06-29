'use strict';

/**
 * @ngdoc overview
 * @name shortenerApp
 * @description
 * # shortenerApp
 *
 * Main module of the application.
 */
var app = angular.module('shortenerApp', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'CRUD',
    'BusinessDelegate',
    'ui.bootstrap',
    'monospaced.qrcode',
    'appDirective',
    'angularLoad'
]);

app.config(function ($routeProvider, $httpProvider, $locationProvider) {


    $routeProvider
        .when('/shortner', {
            templateUrl: 'views/shortener.html',
            controller: 'UrlController'
        })
        .when('/preview', {
            templateUrl: 'views/preview.html',
            controller: 'PreviewController'
        })
        .when('/qrcode', {
            templateUrl: 'views/qrcode.html',
            controller: 'QrcodeController'
        }).when('/:url', {
            templateUrl: 'views/redirect.html',
            controller: 'RedirectController'
        });

    $locationProvider.html5Mode(true);
});

app.controller('RedirectController', [
    '$scope',
    '$routeParams',
    '$window',
    'BusinessDelegate',
    'angularLoad',
    function ($scope, $routeParams, $window, BusinessDelegate, angularLoad) {

        var param = $routeParams.url;

        $scope.redirect = function () {

            BusinessDelegate.getLongByShort(param)
                .then(function (reply) {

                    if (reply.number > 0) {

                        BusinessDelegate.updateClick(reply.results[0].id_stats)
                            .then(function(result){

                                console.log(result);
                                $window.location.href = reply.results[0].longUrl;

                            }, function(error){

                                console.error('Error in updating stat document'+reply);
                        });

                    } else {

                        //404 page
                    }

                }, function (error) {
                    console.error('Failed to retrieve url' + error);
                });
        };

        angularLoad.loadScript('/js3rdparty/sockjs/sockjs.js')
            .then(function () {

                console.log('Loading...');

                angularLoad.loadScript('/js3rdparty/vertxbus/vertxbus.js')
                    .then(function () {

                        console.log('Loading...2');
                        $scope.redirect();

                    }, function() {

                    });

            }, function() {

            });

    }]);


app.controller('TabController', ['TabService', function (TabService) {


    this.selectTab = function (tabToSelect) {

        TabService.selectTab(tabToSelect);
        console.log('Controller says: ');
    };

    this.isSelected = function (tabToCompare) {

        return TabService.isSelected(tabToCompare);
    };

}]);


app.factory('TabService', function () {

    var currentTab = 'home';

    return {

        selectTab: function (tabToSelect) {

            currentTab = tabToSelect;
            console.log('Service says: ' + tabToSelect);
        },

        isSelected: function (tabToCompare) {

            return currentTab === tabToCompare;
        }

    }
});

app.controller('PreviewController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$q',
    function ($scope, $sce, $rootScope, $q) {

        $scope.isCollapsed = false;

        $scope.thumbnailGen = function () {

            var deferred = $q.defer();

            deferred.resolve($sce.trustAsResourceUrl('http://api.pagepeeker.com/v2/thumbs.php?size=x&url=' + $rootScope.longUrl));

            deferred.promise.then(function (thumb) {

                    $scope.preview = thumb;
                }, function (error) {
                    console.error('Error in loading thumbnail' + error);
                }
            )
        };


    }]);

app.controller('QrcodeController', function () {


});

app.controller('StatsController', [ function ($scope) {

        
    }]);


app.controller('ShortnerController', [
    '$scope',
    '$rootScope',
    'CRUD',
    'BusinessDelegate',
    'TabService',
    function ($scope, $rootScope, CRUD, BusinessDelegate, TabService) {

        $scope.customExist = false;
        $rootScope.stored = false;


        $scope.saveRandomUrl = function (long) {

            $rootScope.longUrl = long;

            var newUrl = shortUrlGen();

            BusinessDelegate.existShortUrl(newUrl)
                .then(function (result) {

                    var exist = result.number > 0;

                    if (!exist) {

                        BusinessDelegate.saveStat()
                            .then(function(statDoc){
                                if (statDoc.status === 'ok') {

                                    BusinessDelegate.saveUrl(long, newUrl, false, statDoc._id)
                                        .then(function (result) {
                                            if (result.status === 'ok') {
                                                $rootScope.stored = true;
                                                $rootScope.urlStored = newUrl;
                                                TabService.selectTab('preview');
                                            }
                                            else{
                                                console.error('Failed saving url');
                                            }

                                        }, function (error) {
                                            console.error('Failed saving url (promise)'+error);
                                        });

                                } else {
                                    console.error('Error in creating stat document');
                                }
                            }, function(error){
                                console.error('Error in creating stat document(promise)'+error);
                            });

                    } else {

                        $scope.saveRandomUrl(long);

                    }

                }, function (error) {
                    console.error(error);
                }
            );


        };

        $scope.saveCustomUrl = function (long, short) {

            BusinessDelegate.existShortUrl(short)
                .then(function (result) {

                    var exist = result.number > 0;

                    if (!exist) {

                        BusinessDelegate.saveStat()
                            .then(function(statDoc){
                                if (statDoc.status === 'ok') {

                                    BusinessDelegate.saveUrl(long, short, true, statDoc._id)
                                        .then(function (result) {
                                            if (result.status === 'ok') {
                                                $rootScope.stored = true;
                                                $rootScope.urlStored = short;
                                                TabService.selectTab('preview');
                                            }
                                            else{
                                                console.error('Failed saving url');
                                            }

                                        }, function (error) {
                                            console.error('Failed saving url (promise)'+error);
                                        });

                                } else {
                                    console.error('Error in creating stat document');
                                }
                            }, function(error){
                                console.error('Error in creating stat document(promise)'+error);
                            });

                    } else {

                        $scope.customExist = true;
                    }

                }, function (error) {
                    console.error(error);
                });


        };

        var shortUrlGen = function () {

            var url = 'empty';
            var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

            while (url === 'empty') {
                url = '';
                for (var i = 0; i < 5; i++) {
                    url += possible.charAt(Math.floor(Math.random() * possible.length));
                }
            }
            return url;
        }

    }]);



