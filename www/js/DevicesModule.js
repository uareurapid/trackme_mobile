/**
 * Created by paulocristo on 09/05/16.
 */

angular.module('trackme.DevicesController', [])

    .controller('DevicesController',function ($scope, $http) {

    $scope.formData = {};

    //all these stuff should be on the services, not on the controllers,
    //$http and $resource on services, $scope on controllers
    //like: https://scotch.io/tutorials/setting-up-a-mean-stack-single-page-application
    //http://kirkbushell.me/when-to-use-directives-controllers-or-services-in-angular/

    $scope.getDeviceOwner = function(successCallback, errorCallback) {

        console.log("getting device owner...");
        $http.get('/profile/user')
            .success(function (data) {
                console.log("device owner: " + data.username);
                //assign the username to the scope var
                $scope.formData.owner = data.username;
                successCallback();

            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    //$scope.selectedDevice = "Show all";


    //############ GET ALL USER DEVICES ##################
    $scope.getUserDevices = function() {

        var userData = JSON.parse( window.localStorage.getItem( 'userData'));
        if(userData) {
            console.log("getting all available devices for username: " + userData.email);

            var serverLocation = window.localStorage.getItem('serverLocation');
            var apiPath = serverLocation +'/api/devices?owner=' + userData.email;

            $http({
                method  : 'GET',
                url     : apiPath,
                headers : { 'Authorization': 'Bearer ' + userData.token }  // set the headers so angular passing info as form data (not request payload)
            })
            //$http.get(apiPath)
                .success(function(data) {
                    $scope.devices = data;
                    console.log(data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }
        else {
            console.log("no user data");
        }


    };
    //call it immediatelly
    $scope.getUserDevices();
});