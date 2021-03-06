var app = angular.module('TabService', []);

app.factory('TabService', function () {

    var currentTab = 'home';

    return {

        selectTab: function (tabToSelect) {

            currentTab = tabToSelect;
        },

        isSelected: function (tabToCompare) {

            return currentTab === tabToCompare;
        }

    }
});
