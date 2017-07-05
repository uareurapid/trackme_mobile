/**
 * Created by paulocristo on 03/11/2016.
 */
var PreferencesService = angular.module('PreferencesService', [])
    //was SettingsService

    .service('Preferences', function() {

        var self = this;

        self.loadDefaultPreferences = function() {
            //Awesome local storage for Ionic with ngStorage?
            var trackingPreferences = window.localStorage.getItem('trackingPreferences');

            //create one if dos not exist yet
            if (!trackingPreferences) {

                var defaultTrackable = {
                    name: "",
                    description: "",
                    privacy: "",
                    type: "",
                    _id: ""

                };

                //default values
                trackingPreferences = {
                    startupTrackingEnabled: true,
                    startupTrackable: defaultTrackable,
                    backgroundTrackingEnabled: true,
                    batchesEnabled: true,
                    batchesSize: 2,
                    wifiOnly: false,
                    trackingInterval: 5
                };

                //save them now
                window.localStorage.setItem('trackingPreferences', JSON.stringify(trackingPreferences));
                //get them back
                trackingPreferences = window.localStorage.getItem('trackingPreferences');
            }
            //return the JSON object
            return JSON.parse(trackingPreferences);
        };

        self.savePreferences = function(trackingPreferences) {

            /*var trackingPreferences = Preferences.loadDefaultPreferences();
            trackingPreferences.startupTrackingEnabled = $scope.startupTracking.checked;
            trackingPreferences.startupTrackable = $scope.defaultTrackable;
            trackingPreferences.batchesEnabled = $scope.batchesSending.checked;
            trackingPreferences.batchesSize = $scope.batches.size;
            trackingPreferences.wifiOnly = $scope.wifiOnly.checked;
            trackingPreferences.trackingInterval = $scope.trackingInterval.minutes;*/

            if(trackingPreferences) {
                window.localStorage.setItem('trackingPreferences', JSON.stringify(trackingPreferences));
            }
        };

        //update the preferable trackable (only one at the time!!!)
        self.setPreferableTrackable = function(trackable) {
            var trackingPreferences = self.loadDefaultPreferences();
            trackingPreferences.startupTrackable = trackable;
            window.localStorage.setItem('trackingPreferences', JSON.stringify(trackingPreferences));
        };

        //get it back
        self.getPreferableTrackable = function() {
            var trackingPreferences = self.loadDefaultPreferences();
            return trackingPreferences.startupTrackable;
        };

        self.stopTracking = function(trackable) {
            self.previousTrackable = trackable;
            alert("i want to stop tracking " + JSON.stringify(trackable));
        };

        self.getPreviousTrackable = function() {
            return self.previousTrackable;
        };

        //this holds login data, like email, status and token
        self.getUserData = function() {
            var userData = window.localStorage.getItem('userData');
            if(userData) {
                userData = JSON.parse(userData);
            }
            return userData;
        };

        self.setUserData = function(userData) {
            if(userData) {
                window.localStorage.setItem('userData',JSON.stringify(userData));
            }
        };

        //this holds only credentials (user + pass)
        self.loadSavedCredentials = function() {
            var credentials = window.localStorage.getItem('userCredentials');
            if(credentials) {
                credentials = JSON.parse(credentials);
            }
            return credentials;
        };

        self.saveCredentials = function(username,password) {
            var userCredentials = {
                username: username,
                password: password
            };
            //add to local storage
            window.localStorage.setItem('userCredentials',JSON.stringify(userCredentials));
        };

        self.saveDefaultDevice = function(deviceIdentifier,deviceDescription, id) {
            var deviceData = {
                deviceId: deviceIdentifier,
                deviceDescription: deviceDescription,
                _id: id //the database id
            };
            //save data for prefill();
            window.localStorage.setItem('deviceData',JSON.stringify(deviceData));
        };

        self.loadDefaultDevice = function() {
            var deviceData = window.localStorage.getItem('deviceData');
            if(deviceData) {
                deviceData = JSON.parse(deviceData);
            }
            return deviceData;
        };

    });