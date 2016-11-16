/**
 * Created by paulocristo on 03/11/2016.
 */
var SettingsService = angular.module('PreferencesService', [])

    //TODO SHOULD BE A SERVICE, NOT A CONTROLLER
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