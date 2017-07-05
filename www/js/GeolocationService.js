/**
 * Created by paulocristo on 24/10/2016.
 */

var GeoLocationService = angular.module('GeoLocationService', ['PreferencesService','SMSService'])

    .service('GeoLocation', function($interval, $http, Preferences, SMSSender) {


        var self = this;

        //load all needed info
        self.trackingPreferences = Preferences.loadDefaultPreferences();
        self.device = Preferences.loadDefaultDevice();
        self.userData = Preferences.getUserData();
        self.stopGeolocation = undefined;
        self.isTracking = false;

        //------------------- call the server API here -------------------------
        self.sendRecordToServer = function(position) {


            //the call to the server API is here!
            var send = function(payload, isBatch){

                var serverLocation = window.localStorage.getItem('serverLocation');
                var apiPath = serverLocation +'/api/records';

                var finalPayload = null;
                if(isBatch) {
                    //payload is an array here
                    finalPayload = {
                        batch : payload
                    };
                    finalPayload = JSON.stringify(finalPayload);

                }
                else {
                    finalPayload = JSON.stringify(payload);
                }

                /*if(self.trackingPreferences.allowSMS) {
                    SMSSender.sendSMS("12.34556,37.6347347");
                }*/

                $http({
                    method  : 'POST',
                    url     : apiPath,
                    data: finalPayload,
                    headers : { 'Authorization': 'Bearer ' + self.userData.token }  // set the headers so angular passing info as form data (not request payload)
                })
                    .success(function(data) {

                        if(isBatch) {
                            //clear the batch
                            window.localStorage.setItem('batchPayload',[]);
                        }

                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            };

            if(self.trackingPreferences && self.trackingPreferences.startupTrackable && self.device && self.userData) {



                //API add record payload
                var payload = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    trackableId: self.trackingPreferences.startupTrackable._id, //this is the database ID
                    deviceId: self.device._id //this is the database ID
                };

                if(self.trackingPreferences.batchesEnabled) {
                    var size = self.trackingPreferences.batchesSize;
                    var batchPayload = window.localStorage.getItem('batchPayload');
                    if(!batchPayload) {
                        batchPayload = [];
                    }
                    else {
                      batchPayload = JSON.parse(batchPayload);
                    }

                    if(batchPayload.length < size) {
                        //just add the record to the batch, but do not send it yet
                        batchPayload.push(payload);
                        //save updated version
                        window.localStorage.setItem('batchPayload', JSON.stringify(batchPayload));
                        return;
                    }
                    else {
                        //send the batch and clear it afterwards
                        //batch is full
                        send(batchPayload, true);
                    }
                }
                else {
                    //just send normally one record!
                    send(payload, false);
                }



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
                //if is in batch, wait until is fill
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
                navigator.geolocation.getCurrentPosition(onSuccess, onError,{
                    //timeout: 20000, removed the timeout because of https://stackoverflow.com/questions/20239846/android-geolocation-using-phonegap-code-3-error
                    //maximumAge:30000,
                    enableHighAccuracy: true
                });
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

        //pause (for instance if on background and not enabed background tracking)
        self.pauseTrackingLocation = function() {
           if(self.isTrackingInProgress()) {
               self.stopTrackingLocation();
           }
        };

        //stop tracking
        self.stopTrackingLocation = function() {
            if(self.stopGeolocation) {
                $interval.cancel(self.stopGeolocation);
                self.stopGeolocation = undefined;
                alert("stop tracking called");
            }
            self.isTracking = false;
        };

        self.isTrackingInProgress = function() {
            return self.isTracking;
        };

});