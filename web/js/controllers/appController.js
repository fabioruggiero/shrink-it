var app = angular.module('appController', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'CRUD',
    'BusinessDelegate',
    'angularLoad',
    'monospaced.qrcode',
    'ui.bootstrap',
    'googlechart'
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
    'BusinessDelegate',
    'TabService',
    function ($scope, $rootScope, BusinessDelegate, TabService) {

        $rootScope.stored = false;

        $scope.alert = [
            {type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.', visible: false}
        ];

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

                        $scope.alert.visible = true;
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

        $scope.showChart = false;

        $scope.getVisitOf = function (urlToSearch) {

            BusinessDelegate.existOneShortUrl(urlToSearch)
                .then(function(reply){

                    //var exist = reply.number > 0;
                    if(reply.status === 'ok') {

                        //var urlDoc = reply.results[0];
                        var urlDoc = reply.result;

                        BusinessDelegate.countVisits(urlDoc._id)
                            .then(function(countReply){

                                $scope.count = countReply.count;

                            },function(error){
                                console.error('Error during count visit of '+urlDoc._id+': '+error);
                            });

                        BusinessDelegate.getVisitTime(urlDoc._id)
                            .then(function(visitsReply){

                                var visitsTemp = [];

                                angular.forEach(visitsReply.results, function(visit){

                                    visitsTemp.push({when: visit.visitedOn, from: visit.visitedFrom});
                                });

                                $scope.visits = visitsTemp;

                            },function(error){
                                console.error('Error during count visit of '+urlDoc._id+': '+error);
                            });

                    } else {

                        //show Alert
                    }

                },function(error){
                    console.error('Error in retrieving url '+error);
                });



        };

        $scope.topTenVisited = function () {

            BusinessDelegate.aggregateVisits()
                .then(function(reply){

                    console.log('Really?? Done!');
                    console.log(reply);
                },function(error){
                    console.error('Error during mapReduce '+error);
                })

        };

        var loadData = function () {

            BusinessDelegate.countVisits()
                .then(function (result) {

                    $scope.stats = result.results;

                    $scope.showChart = true;
                    chartPopulate();


                }, function (error) {

                    console.error('Error with loading stats ' + error);
                });
        };

        angularLoad.loadScript('/js3rdparty/sockjs/sockjs.js')
            .then(function () {


                angularLoad.loadScript('/js3rdparty/vertxbus/vertxbus.js')
                    .then(function () {

                        //loadData();

                    }, function (error) {

                        console.error('Error in loading vertxbus.js ' + error);

                    });

            }, function (error) {

                console.error('Error in loading sockjs.js ' + error);
            });


        var chartPopulate = function () {

            $scope.chartObject = {
                "type": "AreaChart",
                "displayed": true,
                "data": {
                    "cols": [
                        {
                            "id": "month",
                            "label": "Month",
                            "type": "string",
                            "p": {}
                        },
                        {
                            "id": "laptop-id",
                            "label": "Laptop",
                            "type": "number",
                            "p": {}
                        },
                        {
                            "id": "desktop-id",
                            "label": "Desktop",
                            "type": "number",
                            "p": {}
                        },
                        {
                            "id": "server-id",
                            "label": "Server",
                            "type": "number",
                            "p": {}
                        },
                        {
                            "id": "cost-id",
                            "label": "Shipping",
                            "type": "number"
                        }
                    ],
                    "rows": [
                        {
                            "c": [
                                {
                                    "v": "January"
                                },
                                {
                                    "v": 19,
                                    "f": "42 items"
                                },
                                {
                                    "v": 12,
                                    "f": "Ony 12 items"
                                },
                                {
                                    "v": 7,
                                    "f": "7 servers"
                                },
                                {
                                    "v": 4
                                }
                            ]
                        },
                        {
                            "c": [
                                {
                                    "v": "February"
                                },
                                {
                                    "v": 13
                                },
                                {
                                    "v": 1,
                                    "f": "1 unit (Out of stock this month)"
                                },
                                {
                                    "v": 12
                                },
                                {
                                    "v": 2
                                }
                            ]
                        },
                        {
                            "c": [
                                {
                                    "v": "March"
                                },
                                {
                                    "v": 24
                                },
                                {
                                    "v": 5
                                },
                                {
                                    "v": 11
                                },
                                {
                                    "v": 6
                                }
                            ]
                        }
                    ]
                },
                "options": {
                    "title": "Sales per month",
                    "isStacked": "true",
                    "fill": 20,
                    "displayExactValues": true,
                    "vAxis": {
                        "title": "Sales unit",
                        "gridlines": {
                            "count": 10
                        }
                    },
                    "hAxis": {
                        "title": "Date"
                    }
                },
                "formatters": {},
                "view": {}
            }
        }

    }]);

app.controller('RedirectController', [
    '$scope',
    '$routeParams',
    '$window',
    'BusinessDelegate',
    'angularLoad',
    function ($scope, $routeParams, $window, BusinessDelegate, angularLoad) {

        var urlToRetrieve = $routeParams.url;

        var redirect = function () {

            BusinessDelegate.existShortUrl(urlToRetrieve)
                .then(function (reply) {

                    if (reply.number > 0) {

                        var urlDoc = reply.results[0];
                        BusinessDelegate.saveVisit(urlDoc._id, 'italy')
                            .then(function (result) {

                                $window.location.href = urlDoc.longUrl;

                            }, function (error) {

                                console.error('Error in saving visit' + error);
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

                angularLoad.loadScript('/js3rdparty/vertxbus/vertxbus.js')
                    .then(function () {

                        redirect();

                    }, function (error) {

                        console.error('Error in loading vertxbus.js ' + error);

                    });

            }, function (error) {

                console.error('Error in loading sockjs.js ' + error);
            });

    }]);

