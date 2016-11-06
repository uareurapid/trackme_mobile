/**
 * Created by paulocristo on 24/10/2016.
 */

var GeoLocationService = angular.module('GeoLocationService', ['PreferencesService'])

    //TODO SHOULD BE A SERVICE, NOT A CONTROLLER
    .service('GeoLocation', function($interval, $http, Preferences) {


        var self = this;

        //load all needed info
        self.trackingPreferences = Preferences.loadDefaultPreferences();
        self.device = Preferences.loadDefaultDevice();
        self.userData = Preferences.getUserData();
        self.stopGeolocation = undefined;
        self.isTracking = false;

        //------------------- call the server API here -------------------------
        self.sendRecordToServer = function(position) {

            if(self.trackingPreferences && self.trackingPreferences.startupTrackable && self.device && self.userData) {

                var serverLocation = window.localStorage.getItem('serverLocation');
                var apiPath = serverLocation +'/api/records';

                var payload = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    trackableId: self.trackingPreferences.startupTrackable._id,
                    deviceId: self.device.id
                };

                $http({
                    method  : 'POST',
                    url     : apiPath,
                    data: JSON.stringify(payload),
                    headers : { 'Authorization': 'Bearer ' + self.userData.token }  // set the headers so angular passing info as form data (not request payload)
                })
                    .success(function(data) {

                        alert("received" + JSON.stringify(data));

                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }
            else {
                alert("no user data or device or trackable info!!!!");
            }

        };
        //Get location and send it to the server
        self.getCoordinates = function () {

            // onSuccess Callback
            // This method accepts a Position object, which contains the
            // current GPS coordinates
            //
            var onSuccess = function(position) {
                /*alert('Latitude: '          + position.coords.latitude          + '\n' +
                    'Longitude: '         + position.coords.longitude         + '\n' +
                    'Altitude: '          + position.coords.altitude          + '\n' +
                    'Accuracy: '          + position.coords.accuracy          + '\n' +
                    'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                    'Heading: '           + position.coords.heading           + '\n' +
                    'Speed: '             + position.coords.speed             + '\n' +
                    'Timestamp: '         + position.timestamp                + '\n');*/

                //send the record to the server
                self.sendRecordToServer(position);
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
                alert("no geolocation system available!");
            }

        };

        //start traking
        self.startTrackingLocation = function() {

            self.isTracking = true;

            self.trackingPreferences = Preferences.loadDefaultPreferences();
            var minutesInterval = self.trackingPreferences.trackingInterval || 2; //will default to 2 minutes while testing
            self.device = Preferences.loadDefaultDevice();
            self.userData = Preferences.getUserData();

            var delay = minutesInterval * 60 *1000; //delay must be in miliseconds (tracking interval in the settings is in minutes)
            //returns a promise that we can cancel
            self.stopGeolocation = $interval(self.getCoordinates,delay);
            //invoke the get location every minutesInterval


        };

        //stop tracking
        self.stopTrackingLocation = function() {
            if(self.stopGeolocation) {
                $interval.cancel(self.stopGeolocation);
                self.stopGeolocation = undefined;
            }
            self.isTracking = false;
        };

        self.isTrackingInProgress = function() {
            return self.isTracking;
        };

});