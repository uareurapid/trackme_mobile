/**
 * Created by paulocristo on 09/05/16.
 */

angular.module('trackme.GeoLocationController', ['ionic'])

    .controller('GeoLocationController',function ($scope, $http) {

        // onSuccess Callback
        // This method accepts a Position object, which contains the
        // current GPS coordinates
        //
        var onSuccess = function(position) {
            console.log('Latitude: '          + position.coords.latitude          + '\n' +
                'Longitude: '         + position.coords.longitude         + '\n' +
                'Altitude: '          + position.coords.altitude          + '\n' +
                'Accuracy: '          + position.coords.accuracy          + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                'Heading: '           + position.coords.heading           + '\n' +
                'Speed: '             + position.coords.speed             + '\n' +
                'Timestamp: '         + position.timestamp                + '\n');

            $scope.addRecord(position.coords.latitude,position.coords.longitude);
        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            console.log('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
        }


        $scope.startTracking = function() {
          if(navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(onSuccess, onError);
          }
          else {
            console.log("no navigator.geolocation!");
          }
        };

        $scope.addRecord = function(latitude,longitude) {

            var serverLocation = window.localStorage.getItem('serverLocation');
            console.log("submitting the form to add a new record for user: ");

            var apiPath = serverLocation +'/api/records';

            var userData = JSON.parse( window.localStorage.getItem( 'userData'));
            if(userData) {
                console.log(userData.email);

            }

            /**
             * model
             *
             name: recName,
             description: recDescription,
             latitude: req.body.latitude,
             longitude : req.body.longitude,
             time: timeOfRecord,
             trackableId: req.body.trackableId,
             deviceId: req.body.deviceId,
             done: false
             */

            var deviceData = JSON.parse( window.localStorage.getItem( 'deviceData'));
            console.log("requesting add record with device id: " + deviceData.id)

            $http({
                method  : 'POST',
                url     : apiPath,
                data: {"latitude":latitude,
                        "longitude": longitude,
                        "trackableId": '56327103c8f377a602004571',
                        "deviceId": deviceData.id},
                headers : { 'Authorization': 'Bearer ' + userData.token }
            })
             .then(function(data){
                    console.log("ADD RECORDS RESPONSE: " + JSON.stringify(data));
                    //get them all again and clear the form fields
                }, function(data){
                    console.log('Error: ' + data);
                });
        };


});