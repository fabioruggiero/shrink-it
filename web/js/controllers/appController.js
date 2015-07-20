var app = angular.module('appController', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'BusinessDelegate',
    'angularLoad',
    'monospaced.qrcode',
    'ui.bootstrap',
    'geolocation'
]);

app.controller('TabController', [
    'TabService',
    function (TabService) {

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
    '$http',
    'BusinessDelegate',
    'TabService',
    function ($scope, $rootScope, $http, BusinessDelegate, TabService) {

        $rootScope.stored = false;

        $scope.closeAlert = function (alert) {
            if (alert === 'exist') {
                $scope.alertExist = null;
            } else if (alert === 'bad') {
                $scope.alertBadWord = null;
            }
        };

        $scope.saveRandomUrl = function (long) {

            var newUrl = shortUrlGen();

            BusinessDelegate.existShortUrl(newUrl)
                .then(function (result) {

                    var exist = result.number > 0;

                    if (!exist) {

                        BusinessDelegate.saveUrl(long, newUrl, false)
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

                        //Richiama il metodo ricorsivamente fino alla creazione di un url univoco
                        $scope.saveRandomUrl(long);
                    }

                }, function (error) {
                    console.error(error);
                }
            );


        };

        $scope.saveCustomUrl = function (long, short) {

            $http.get('utils/bad_words')
                .success(function (data) {

                    //Verifying that custom url isn't a bad word
                    if (data.hasOwnProperty(short)) {

                        $scope.alertBadWord = {type: 'danger', msg: "You can't use this word here...", visible: true};
                        return;
                    }

                    BusinessDelegate.existShortUrl(short)
                        .then(function (result) {

                            var exist = result.number > 0;

                            if (!exist) {

                                BusinessDelegate.saveUrl(long, short, true)
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

                                $scope.alertExist = {
                                    type: 'danger', msg: 'Unfortunately this name already exist!',
                                    visible: true
                                };
                            }

                        }, function (error) {
                            console.error(error);
                        });


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
    '$http',
    'BusinessDelegate',
    function ($scope, $sce, $rootScope, $q, $http, BusinessDelegate) {

        $scope.isCollapsed = false;

        $scope.thumbnailShow = function (type, fullUrl) {



            if (type === 'previewStored') {

                thumbnailGen($rootScope.longStored)

            } else {

                //Removing 'http://127.0.0.1:8080/#/', first 24 char
                var urlToFind = fullUrl.slice(24, fullUrl.length);

                BusinessDelegate.existShortUrl(urlToFind)
                    .then(function (result) {

                        var exist = result.number > 0;

                        if (exist) {

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

            return deferred.promise.then(function (thumb) {

                $scope.preview = thumb;
                $scope.previewEnabled = true;

            }, function (error) {

                console.error('Error in loading thumbnail' + error);
            });



        };

    }]);

app.controller('QrcodeController', [
    '$scope',
    function ($scope) {

        $scope.qrcodeEnabled = false;

        $scope.showQrcode = function () {

            $scope.qrcodeEnabled = true;
        }

    }]);

app.controller('StatsController', [
    '$scope',
    'BusinessDelegate',
    'angularLoad',
    function ($scope, BusinessDelegate, angularLoad) {

        $scope.topTenCollapsed = true;
        $scope.singleUrlCollapsed = true;
        $scope.urlVisitsCollapsed = true;

        $scope.alertNotFound = {type: 'danger', msg: "This URL doesn't exist!"};

        $scope.closeAlert = function () {
            $scope.alertNotFound = null;
        };

        $scope.showSingle = function () {

            $scope.topTenCollapsed = true;
            $scope.singleUrlCollapsed = false;
        };

        $scope.showTopTen = function () {

            $scope.singleUrlCollapsed = true;
            $scope.urlVisitsCollapsed = true;
            $scope.topTenVisited();
        };

        $scope.getVisitOf = function (fullUrl) {

            //Removing 'http://127.0.0.1:8080/#/', first 24 char
            var urlToFind = fullUrl.slice(24, fullUrl.length);

            BusinessDelegate.existShortUrl(urlToFind)
                .then(function (reply) {

                    var exist = reply.number > 0;

                    if (exist) {

                        var urlDoc = reply.results[0];

                        BusinessDelegate.countVisits(urlDoc._id)
                            .then(function (countReply) {

                                $scope.count = countReply.count;

                            }, function (error) {
                                console.error('Error during count visit of ' + urlDoc._id + ': ' + error);
                            });

                        BusinessDelegate.getVisitsInfo(urlDoc._id)
                            .then(function (visitsReply) {

                                var visitsTemp = [];

                                angular.forEach(visitsReply.results, function (visit) {

                                    visitsTemp.push({when: visit.visitedOn, from: visit.visitedFrom});
                                });

                                $scope.visits = visitsTemp;
                                $scope.urlVisitsCollapsed = false;

                            }, function (error) {
                                console.error('Error during count visits of ' + urlDoc._id + ': ' + error);
                            });

                    } else {

                        $scope.alertNotFound = {type: 'danger', msg: "This URL doesn't exist!", visible: true};
                    }

                }, function (error) {
                    console.error('Error in retrieving url ' + error);
                });


        };

        $scope.topTenVisited = function () {

            BusinessDelegate.aggregateVisits()
                .then(function (reply) {

                    console.log(reply);
                    var results = reply.result.result;
                    var topTen;

                    if (results.length < 10) {

                        topTenTemp = results;
                    } else {

                        for (var i = 0; i < results.length; i++) {

                            topTenTemp[i] = results[i];

                        }
                    }

                    console.log(topTen);
                    $scope.topTen = topTenTemp;
                    $scope.topTenCollapsed = false;
                }, function (error) {
                    console.error('Error during aggregate ' + error);
                })

        };

        var loadData = function () {

            BusinessDelegate.countVisits()
                .then(function (result) {

                    $scope.stats = result.results;

                }, function (error) {

                    console.error('Error with loading stats ' + error);
                });
        };

    }]);

app.controller('RedirectController', [
    '$scope',
    '$routeParams',
    '$window',
    '$http',
    'BusinessDelegate',
    'angularLoad',
    'geolocation',
    function ($scope, $routeParams, $window, $http, BusinessDelegate, angularLoad, geolocation) {

        var urlToRetrieve = $routeParams.url;

        var redirect = function () {

            BusinessDelegate.existShortUrl(urlToRetrieve)
                .then(function (reply) {

                    var exist = reply.number > 0;

                    if (exist) {

                        var urlDoc = reply.results[0];

                        geolocation.getLocation()
                            .then(function (location) {

                                var lat = location.coords.latitude;

                                var long = location.coords.longitude;

                                $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + long + '+&sensor=true')
                                    .success(function (locationInfo) {

                                        //Getting city and contry from user's ip
                                        var visitedFrom = locationInfo.results[1].formatted_address;

                                        BusinessDelegate.saveVisit(urlDoc._id, urlDoc.shortUrl, visitedFrom)
                                            .then(function (result) {

                                                $window.location.href = urlDoc.longUrl;

                                            }, function (error) {

                                                console.error('Error in saving visit' + error);
                                            });
                                    });
                            }, function (reply) {

                                BusinessDelegate.saveVisit(urlDoc._id, urlDoc.shortUrl, 'unknow')
                                    .then(function (result) {

                                        $window.location.href = urlDoc.longUrl;

                                    }, function (error) {

                                        console.error('Error in saving visit' + error);
                                    });
                            });
                    } else {

                        $window.location.href = '404.html';
                    }

                }, function (error) {
                    console.error('Failed to retrieve url' + error);
                });
        };

        angularLoad.loadScript('/js3rdpart/sockjs/sockjs.js')
            .then(function () {

                angularLoad.loadScript('/js3rdpart/vertxbus/vertxbus.js')
                    .then(function () {

                        redirect();

                    }, function (error) {

                        console.error('Error in loading vertxbus.js ' + error);

                    });

            }, function (error) {

                console.error('Error in loading sockjs.js ' + error);
            });

    }]);

