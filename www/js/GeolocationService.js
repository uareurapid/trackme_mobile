/**
 * Created by paulocristo on 24/10/2016.
 */

var GeoLocationService = angular.module('GeoLocationService', ['PreferencesService'])

    //TODO SHOULD BE A SERVICE, NOT A CONTROLLER
    .service('GeoLocation', function($interval, $http, Preferences) {

        var stopGeolocation;

        var trackable = Preferences.loadDefaultPreferences();
        var device = Preferences.loadDefaultDevice();
        var userData = Preferences.getUserData();

        //call the server API here
        this.sendRecordToServer = function(position) {

            if(userData && trackable && device) {
                console.log("adding new record: " + geoPosition +" for username: " + userData.email);

                var serverLocation = window.localStorage.getItem('serverLocation');
                var apiPath = serverLocation +'/api/records';

                /**
                 * $http.post('/api/devices', $scope.formData)
                 .success(function(data) {

                $scope.formData.deviceId = ""; // clear the form so our user is ready to enter another
                $scope.formData.deviceDescription = "";
                //do not clear $scope.formData.owner

                //get all updated/devices list again
                $scope.getUserDevices();
            })
                 .error(function(data) {
                console.log('Error: ' + data);
            });
                 */

                //---------------- API -----------------
                /*
                 name: recName,
                 description: recDescription,
                 latitude: req.body.latitude,
                 longitude : req.body.longitude,
                 time: timeOfRecord,
                 trackableId: req.body.trackableId,
                 deviceId: req.body.deviceId,
                 done: false
                 */
                //--------------------------------------

                $http({
                    method  : 'POST',
                    url     : apiPath,
                    transformRequest: function(obj) {
                        var str = [];
                        for(var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: {
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude,
                          trackableId: trackable._id,
                          deviceId: device.id
                    },
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
                console.log("no user data or device or trackable info!!!!");
            }

        };

        this.getCoordinates = function () {

            // onSuccess Callback
            // This method accepts a Position object, which contains the
            // current GPS coordinates
            //
            var onSuccess = function(position) {
                alert('Latitude: '          + position.coords.latitude          + '\n' +
                    'Longitude: '         + position.coords.longitude         + '\n' +
                    'Altitude: '          + position.coords.altitude          + '\n' +
                    'Accuracy: '          + position.coords.accuracy          + '\n' +
                    'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                    'Heading: '           + position.coords.heading           + '\n' +
                    'Speed: '             + position.coords.speed             + '\n' +
                    'Timestamp: '         + position.timestamp                + '\n');

                //send the record to the server
                this.sendRecordToServer(position);
            };




            // onError Callback receives a PositionError object
            //
            function onError(error) {
                alert('code: '    + error.code    + '\n' +
                    'message: ' + error.message + '\n');
            }
            //see https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(onSuccess, onError,{enableHighAccuracy: true});
            }
            else {
                alert("no geolocation system!");
            }

        };


        this.startTrackingLocation = function(minutesInterval) {
            var delay = minutesInterval * 60 *1000; //delay must be in miliseconds (tracking interval in the settings is in minutes)
            //returns a promise that we can cancel
            alert("will call again in delay miliseconds: " + delay);
            stopGeolocation = $interval(this.getCoordinates,delay);
            //invoke the get location every minutesInterval
        };

        this.stopTrackingLocation = function() {
            if(stopGeolocation) {
                $interval.cancel(stopGeolocation);
                stopGeolocation = undefined;
            }
        };

});