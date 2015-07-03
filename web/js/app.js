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
    'appDirective',
    'appController',
    'TabService'
]);

app.config(function ($routeProvider) {

    $routeProvider
        .when('/:url', {
            templateUrl: 'views/redirect.html'
        });

});



