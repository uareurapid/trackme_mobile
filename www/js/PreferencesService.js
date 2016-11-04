/**
 * Created by paulocristo on 03/11/2016.
 */
var SettingsService = angular.module('PreferencesService', [])

    //TODO SHOULD BE A SERVICE, NOT A CONTROLLER
    .service('Preferences', function() {

        this.loadDefaultPreferences = function() {
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

                trackingPreferences = {
                    startupTrackingEnabled: true,
                    startupTrackable: defaultTrackable,
                    batchesEnabled: true,
                    batchesSize: 2,
                    wifiOnly: false,
                    trackingInterval: 5
                };

                window.localStorage.setItem('trackingPreferences', JSON.stringify(trackingPreferences));
            }
            //return the JSON object
            trackingPreferences = JSON.parse(trackingPreferences);
            return trackingPreferences;
        };

        //this holds login data, like email, status and token
        this.getUserData = function() {
            var userData = window.localStorage.getItem('userData');
            if(userData) {
                userData = JSON.parse(userData);
            }
            return userData;
        };

        this.setUserData = function(userData) {
            if(userData) {
                window.localStorage.setItem('userData',JSON.stringify(userData));
            }
        };

        //this holds only credentials (user + pass)
        this.loadSavedCredentials = function() {
            var credentials = window.localStorage.getItem('userCredentials');
            if(credentials) {
                credentials = JSON.parse(credentials);
            }
            return credentials;
        };

        this.saveCredentials = function(username,password) {
            var userCredentials = {
                username: username,
                password: password
            };
            //add to local storage
            window.localStorage.setItem('userCredentials',JSON.stringify(userCredentials));
        };

        this.saveDefaultDevice = function(deviceIdentifier,deviceDescription) {
            var deviceData = {
                deviceId: deviceIdentifier,
                deviceDescription: deviceDescription
            };
            //save data for prefill();
            window.localStorage.setItem('deviceData',JSON.stringify(deviceData));
        };

        this.loadDefaultDevice = function() {
            var deviceData = window.localStorage.getItem('deviceData');
            if(deviceData) {
                deviceData = JSON.parse(deviceData);
            }
            return deviceData;
        };

    });