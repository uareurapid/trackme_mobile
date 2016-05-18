/**
 * Created by paulocristo on 09/05/16.
 */

angular.module('trackme.DevicesController', ['ionic'])

    .controller('DevicesController',function ($scope, $state, $http, $ionicPopup) {

    //clean the form fields
    $scope.formData = {};
    $scope.formData.deviceId ="";
    $scope.formData.deviceDescription="";

    var serverLocation = window.localStorage.getItem('serverLocation');

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

    //############ CREATE A NEW DEVICE ####################
    // this is actually the submit of the form
    // called from ui, to add a new device
     $scope.createDevice = function() {

         console.log("submitting the form to add a new device for user: ");

         var apiPath = serverLocation +'/api/devices';

         var userData = JSON.parse( window.localStorage.getItem( 'userData'));
         if(userData) {
             console.log(userData.email);
             //$scope.formTrackablesData.owner = userData.email;

         }

         $http({
             method  : 'POST',
             url     : apiPath,
             data: $scope.formData,
             headers : { 'Authorization': 'Bearer ' + userData.token }
         })
          .success(function(data) {
               console.log("received devices response: " + data);
                 //TODO only after confirmation
               window.localStorage.setItem("deviceId",$scope.formData.deviceId);

               $scope.formData.deviceId = ""; // clear the form so our user is ready to enter another
               $scope.formData.deviceDescription = "";
               //get all updated/devices list again
               $scope.getUserDevices();
               //navigate to see them
               $state.go('app.devices');

          }).error(function(data) {
              console.log('Error: ' + data);
          });
     };


    //############ GET ALL USER DEVICES ##################
    $scope.getUserDevices = function( callback ) {

        var userData = JSON.parse( window.localStorage.getItem( 'userData'));
        if(userData) {
            console.log("devicesmodule: getting all available devices for username: " + userData.email);

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

     $scope.prefillData = function() {
         //fill fields
         var deviceData = JSON.parse( window.localStorage.getItem( 'deviceData'));
         if(deviceData) {
             console.log("prefill now");
             $scope.formData.deviceId = deviceData.deviceId;
             $scope.formData.deviceDescription = deviceData.deviceDescription;
         }

     };

     // A confirm dialog
     $scope.showConfirm = function(confirm, deny) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Add new device',
                template: 'Add this device as new tracking device?'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    console.log('You are sure');
                    if(confirm && typeof confirm === 'function') {
                        confirm();
                    }
                } else {
                    console.log('You are not sure');
                    if(deny && typeof deny === 'function') {
                        deny();
                    }
                }
            });
    };

    $scope.checkUserDevices = function() {

        console.log("TODO get user device info here: ");
        var deviceIdentifier = "My Device Id";//dummy id, just in case
        var deviceDescription = "My Device Description";

        //The cordova-plugin-device plugin defines a global device object,
        if(device) {
            deviceIdentifier = device.uuid;
            deviceDescription = device.name;
        }

        console.log("device id/name: " + deviceIdentifier);

        $scope.getUserDevices( function(data) {
            var exists = false;
            //callback function for success
            console.log("callback called with data: " + JSON.stringify(data));
            for (var i = 0; i < data.length; i++) {
                if(data[i].deviceId==deviceIdentifier) {
                    exists = true;
                    console.log("this device already exists: name " + data[i].deviceId);
                    break;
                }
            }
            if(!exists) {

                $scope.showConfirm( function() {
                     //user confirmed
                     var deviceData = {
                            deviceId: deviceIdentifier,
                            deviceDescription: deviceDescription
                     };
                     //save data for prefill();
                     window.localStorage.setItem( 'deviceData',JSON.stringify(deviceData));
                     //navigate
                     $state.go('app.add_devices');
                },
                function () {
                    //user denied, do nothing
                });

            }
            /**
             * example response
             * [{"_id":"5637ecb213b2ca529970a539","deviceId":"iPad de PC","deviceDescription":"iPad de PC","deviceOwner":"cristo.paulo@gmail.com","__v":0},
             * {"_id":"563e2591922733760b37bbcd","deviceId":"dev3","deviceDescription":"dev3desc","deviceOwner":"cristo.paulo@gmail.com","__v":0},
             * {"_id":"564143e35b2683d0a543dca4","deviceId":"Paulo Cristo’s iPhone","deviceDescription":"added again","deviceOwner":"cristo.paulo@gmail.com","__v":0},
             * {"_id":"56424175bc107b247618c986","deviceId":"newidentifier","deviceDescription":"newdescription","deviceOwner":"cristo.paulo@gmail.com","__v":0}]
             */


        });
    };
    //call it immediatelly
    // TODO this should be cached and loaded on demand, and not called all the time when the page loads
    //$scope.getUserDevices();
});