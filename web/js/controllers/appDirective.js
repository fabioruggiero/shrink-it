/**
 * Created by Fabio on 25/06/2015.
 */

var app = angular.module('appDirective', []);

app.directive('shortenerDirective', function() {

    return {

        restrict : 'E',
        templateUrl : 'views/shortener.html'
    }
});

app.directive('previewDirective', function() {

    return {

        restrict : 'E',
        templateUrl : 'views/preview.html'
    }
});

app.directive('qrcodeDirective', function() {

    return {

        restrict : 'E',
        templateUrl : 'views/qrcode.html'
    }
});


app.directive('statsDirective', function() {

    return {

        restrict : 'E',
        templateUrl : 'views/stats.html'
    }
});