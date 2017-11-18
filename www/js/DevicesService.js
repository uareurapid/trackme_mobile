/**
 * Created by paulocristo on 18/11/2017.
 */
var DevicesService = angular.module('DevicesService', ['ionic'])

    .service('DevicesService', function($http) {

        var self = this;

        //############ GET ALL USER DEVICES ##################
        self.getAllUserDevices = function( callback ) {

            var userData = JSON.parse( window.localStorage.getItem( 'userData'));
            if(userData) {
                console.log("DevicesService: getting all available devices for username: " + userData.email);

                var serverLocation = window.localStorage.getItem('serverLocation');
                var apiPath = serverLocation +'/api/devices?owner=' + userData.email;

                $http({
                    method  : 'GET',
                    url     : apiPath,
                    headers : { 'Authorization': 'Bearer ' + userData.token }  // set the headers so angular passing info as form data (not request payload)
                })
                    //$http.get(apiPath)
                    .success(function(data) {
                        //$scope.devices = data;
                        console.log(data);
                        //send the data to the callback function
                        if(callback && typeof callback === 'function') {
                            callback(data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }
            else {
                console.log("no user data");
            }


        };
    });
