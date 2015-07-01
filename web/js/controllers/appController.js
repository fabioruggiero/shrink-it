var app = angular.module('appController', [
    'ngRoute',
    'ngSanitize',
    'CRUD',
    'BusinessDelegate',
    'angularLoad',
    'monospaced.qrcode',
    'ui.bootstrap'
]);

app.controller('TabController', ['TabService', function (TabService) {

    this.selectTab = function (tabToSelect) {

        TabService.selectTab(tabToSelect);
    };

    this.isSelected = function (tabToCompare) {

        return TabService.isSelected(tabToCompare);
    };

}]);

app.controller('ShortenerController', [
    '$scope',
    '$rootScope',
    'BusinessDelegate',
    'TabService',
    function ($scope, $rootScope, BusinessDelegate, TabService) {

        $scope.customExist = false;
        $rootScope.stored = false;


        $scope.saveRandomUrl = function (long) {

            var newUrl = shortUrlGen();

            BusinessDelegate.existShortUrl(newUrl)
                .then(function (result) {

                    var exist = result.number > 0;

                    if (!exist) {

                        BusinessDelegate.saveStat()
                            .then(function (statDoc) {
                                if (statDoc.status === 'ok') {

                                    BusinessDelegate.saveUrl(long, newUrl, false, statDoc._id)
                                        .then(function (result) {
                                            if (result.status === 'ok') {
                                                $rootScope.stored = true;
                                                $rootScope.shortStored = newUrl;
                                                $rootScope.longStored = long;
                                                TabService.selectTab('preview');
                                            }
                                            else {
                                                console.error('Failed saving url');
                                            }

                                        }, function (error) {
                                            console.error('Failed saving url (promise)' + error);
                                        });

                                } else {
                                    console.error('Error in creating stat document');
                                }
                            }, function (error) {
                                console.error('Error in creating stat document(promise)' + error);
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
                            .then(function (statDoc) {
                                if (statDoc.status === 'ok') {

                                    BusinessDelegate.saveUrl(long, short, true, statDoc._id)
                                        .then(function (result) {
                                            if (result.status === 'ok') {
                                                $rootScope.stored = true;
                                                $rootScope.shortStored = short;
                                                $rootScope.longStored = long;
                                                TabService.selectTab('preview');
                                            }
                                            else {
                                                console.error('Failed saving url');
                                            }

                                        }, function (error) {
                                            console.error('Failed saving url (promise)' + error);
                                        });

                                } else {
                                    console.error('Error in creating stat document');
                                }
                            }, function (error) {
                                console.error('Error in creating stat document(promise)' + error);
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

app.controller('PreviewController', [
    '$scope',
    '$sce',
    '$rootScope',
    '$q',
    'BusinessDelegate',
    function ($scope, $sce, $rootScope, $q, BusinessDelegate) {

        $scope.isCollapsed = false;

        $scope.thumbnailShow = function (type, fullUrl) {

            $scope.previewEnabled = true;

            if (type === 'previewStored') {

                thumbnailGen($rootScope.longStored)

            } else {

                //Removing 'http://127.0.0.1:8080/#/', first 24 char
                var urlToFind = fullUrl.slice(24, fullUrl.length);

                BusinessDelegate.existShortUrl(urlToFind)
                    .then(function (result) {

                        var exist = result.number > 0;

                        if (exist) {

                            /** @namespace result.results */
                            var longUrl = result.results[0].longUrl;

                            thumbnailGen(longUrl);
                        }

                    }, function (error) {
                        console.error("Can't resolve promise:" + error);
                    });

            }


        };

        var thumbnailGen = function (urlToGen) {

            var deferred = $q.defer();

            deferred.resolve($sce.trustAsResourceUrl('http://api.pagepeeker.com/v2/thumbs.php?size=x&url=' + urlToGen));

            deferred.promise.then(function (thumb) {

                $scope.preview = thumb;
            }, function (error) {
                console.error('Error in loading thumbnail' + error);
            });
        }


    }]);

app.controller('QrcodeController', function () {


});

app.controller('StatsController', [function ($scope) {


}]);

app.controller('RedirectController', [
    '$scope',
    '$routeParams',
    '$window',
    'BusinessDelegate',
    'angularLoad',
    function ($scope, $routeParams, $window, BusinessDelegate, angularLoad) {

        var param = $routeParams.url;


        var redirect = function () {

            BusinessDelegate.getLongByShort(param)
                .then(function (reply) {

                    if (reply.number > 0) {

                        BusinessDelegate.updateClick(reply.results[0].id_stats)
                            .then(function (result) {

                                console.log(result);
                                $window.location.href = reply.results[0].longUrl;

                            }, function (error) {

                                console.error('Error in updating stat document' + error);
                            });

                    } else {

                        $window.location.href = '404.html';
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
                        redirect();

                    }, function (error) {

                        console.error('Error in loading vertxbus.js '+error);

                    });

            }, function (error) {

                console.error('Error in loading sockjs.js '+error);
            });

    }]);


