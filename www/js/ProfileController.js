/**
 * Created by paulocristo on 17/11/2017.
 */
angular.module('trackme.ProfileController',['ionic','ionic-material','PreferencesService','GeoLocationService'])

    .controller('ProfileController',function ($scope, $state, $cookies, $http, $ionicPopover, $ionicSideMenuDelegate, Preferences, GeoLocation) {

        $scope.loggedin_user = "";

        var userData = window.localStorage.getItem('userData');
        if(userData) {
            userData = JSON.parse(userData);
            $scope.loggedin_user = userData.email;
        }


    });