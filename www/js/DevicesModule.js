/**
 * Created by paulocristo on 09/05/16.
 */

angular.module('trackme.DevicesController', ['ionic','ionic-material','PreferencesService'])

    .controller('DevicesController',function ($scope, $state, $http, $ionicPopover,Preferences) {

    //clean the form fields
    $scope.formData = {};
    $scope.formData.deviceId ="";
    $scope.formData.deviceDescription="";

    var serverLocation = window.localStorage.getItem('serverLocation');

    $scope.selectedDevice = {
        owner: "",
        deviceId: "",
        description: ""
    };

        //FOR POPOVER
        // .fromTemplateUrl() method
        $ionicPopover.fromTemplateUrl('device_detail.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });


        $scope.openDeviceDetails = function($event,device) {
            $scope.selectedDevice = device;
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });
        // Execute action on hidden popover
        $scope.$on('popover.hidden', function() {
            // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function() {
            // Execute action
        });
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

         //TODO update this call, use the Preferences service
         var userData = JSON.parse( window.localStorage.getItem( 'userData'));
         if(userData) {
             console.log(userData.email);
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

               //get the prefilled data
               var deviceData = Preferences.loadDefaultDevice();

               //if form values are different from saved data, update them
               if($scope.formData.deviceId!==deviceData.deviceId) {
                   deviceData.deviceId = $scope.formData.deviceId;
               }
               if($scope.formData.deviceDescription!==deviceData.deviceDescription) {
                   deviceData.deviceDescription = $scope.formData.deviceDescription;
               }

               //save the id coming from the api/database
               //TODO use the same field names returned by the API if possible
               deviceData._id = data._id;
               //update the values on local storage
               Preferences.saveDefaultDevice(deviceData.deviceId,deviceData.deviceDescription,deviceData._id);

               console.log("just added device with deviceData: " + JSON.stringify(deviceData));

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
         else if(window.device){
             $scope.formData.deviceId = window.device.uuid;
         }

     };
    //call it immediatelly
    // TODO this should be cached and loaded on demand, and not called all the time when the page loads
    $scope.getUserDevices();
});