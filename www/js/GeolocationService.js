/**
 * Created by paulocristo on 24/10/2016.
 */

var GeoLocationService = angular.module('GeoLocationService', [])

//TODO SHOULD BE A SERVICE NO??? NOT A CONTROLLER
    .service('GeoLocation', function() {


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
            };

            // onError Callback receives a PositionError object
            //
            function onError(error) {
                alert('code: '    + error.code    + '\n' +
                    'message: ' + error.message + '\n');
            }
            //see https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/
            navigator.geolocation.getCurrentPosition(onSuccess, onError,{enableHighAccuracy: true});
        };



});