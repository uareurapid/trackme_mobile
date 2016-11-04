/**
 * Created by paulocristo on 13/05/16.
 */
angular.module('trackme.SettingsController', ['ionic','ionic-material','GeoLocationService','PreferencesService'])

    .controller('SettingsController',function ($scope, $http, $ionicModal, GeoLocation,Preferences) {

        var STARTUP_CHOICE_CHOOSE_LATER_VALUE = 'wcl';
        var STARTUP_CHOICE_CHOOSE_DEFAULT_VALUE = 'cdt';
        var STARTUP_CHOICE_CHOOSE_LATER_TEXT = "No thanks! I will choose later";
        var STARTUP_CHOICE_CHOOSE_DEFAULT_TEXT = "Choose a default trackable";

        //models for the checkboxes
        $scope.wifiOnly = { checked: true };
        $scope.batchesSending = { checked: true} ;
        $scope.batchSize = 2;
        $scope.startupTracking = {checked: true} ;
        $scope.backgroundTracking = {checked: true} ;

        $scope.data =  {
            startupChoice : STARTUP_CHOICE_CHOOSE_LATER_VALUE
            //cdt
        };


        //every 5 minutes interval
        $scope.trackingInterval = { minutes: 5};

        //send batches of 2 by default
        $scope.batches = {size: 2};

        //is there a default trackable selected? if so, show it´s name on the settings
        //TODO, maybe select it also on the modal window??
        $scope.defaultTrackable = {
            name: "",
            description: "",
            privacy: "",
            type: "",
            _id: "" //this is the field used in API calls

        };

        //load default preferences
        var loadDefaultPreferences = function() {

            //TODO find a better way to deal with JSON, maybe
            //Awesome local storage for Ionic with ngStorage?
            var trackingPreferences = Preferences.loadDefaultPreferences();

            if(!trackingPreferences) {

                trackingPreferences = {
                    startupTrackingEnabled : $scope.startupTracking.checked,
                    startupTrackable: $scope.defaultTrackable,
                    batchesEnabled : $scope.batchesSending.checked,
                    batchesSize: $scope.batches.size,
                    wifiOnly: $scope.wifiOnly.checked,
                    trackingInterval: $scope.trackingInterval.minutes
                };

                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));
            }
            else {
                //they exist, read them
                trackingPreferences = JSON.parse(trackingPreferences);
                $scope.startupTracking.checked = trackingPreferences.startupTrackingEnabled;
                //get all the info
                $scope.defaultTrackable.name = trackingPreferences.startupTrackable.name;
                $scope.defaultTrackable.description = trackingPreferences.startupTrackable.description;
                $scope.defaultTrackable.privacy = trackingPreferences.startupTrackable.privacy;
                $scope.defaultTrackable.type = trackingPreferences.startupTrackable.type;
                //we use _id to match the response API
                $scope.defaultTrackable._id = trackingPreferences.startupTrackable._id;

                $scope.batchesSending.checked = trackingPreferences.batchesEnabled;
                $scope.batches.size = trackingPreferences.batchesSize;
                $scope.wifiOnly.checked = trackingPreferences.wifiOnly;

                $scope.trackingInterval.minutes = trackingPreferences.trackingInterval;

            }
        };

        //load on startup
        loadDefaultPreferences();

        //create the options list
        $scope.startupChoicesList = [
            { text: STARTUP_CHOICE_CHOOSE_DEFAULT_TEXT + $scope.defaultTrackable.name, value: STARTUP_CHOICE_CHOOSE_DEFAULT_VALUE },
            { text: STARTUP_CHOICE_CHOOSE_LATER_TEXT, value: STARTUP_CHOICE_CHOOSE_LATER_VALUE }
        ];

        $scope.backgroundTrackingChanged =  function() {

        };

        $scope.wifiOnlyChanged =  function() {

            var trackingPreferences = window.localStorage.getItem('trackingPreferences');
            if(trackingPreferences) {
                trackingPreferences = JSON.parse(trackingPreferences);
                trackingPreferences.wifiOnly = $scope.wifiOnly.checked;
                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));
            }
        };

        $scope.startupTrackingChanged = function() {

            var trackingPreferences = window.localStorage.getItem('trackingPreferences');
            if(trackingPreferences) {
                trackingPreferences = JSON.parse(trackingPreferences);
                trackingPreferences.startupTrackingEnabled = $scope.startupTracking.checked;
                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));

            }
        };

        //apply changes
        $scope.applyNewPreferences = function() {

            if(GeoLocation.isTrackingInProgress()) {
                //stop the current tracking
                GeoLocation.stopTrackingLocation();
                //restart tracking with new settings
                GeoLocation.startTrackingLocation();
            }

        };


        //******************* TRACKABLES MODAL ************************************

        $ionicModal.fromTemplateUrl('./templates/modal_trackables.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.openModal = function() {
            $scope.modal.show();
        };
        //cancel button, reset selected option
        $scope.closeModal = function() {
            //$scope.data.startupChoice = STARTUP_CHOICE_CHOOSE_LATER;
            $scope.modal.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function() {
            var trackingPreferences = window.localStorage.getItem('trackingPreferences');
            if(trackingPreferences) {
                trackingPreferences = JSON.parse(trackingPreferences);
                //save all the fields
                $scope.defaultTrackable.name = trackingPreferences.startupTrackable.name;
                $scope.defaultTrackable.privacy = trackingPreferences.startupTrackable.privacy;
                $scope.defaultTrackable.description = trackingPreferences.startupTrackable.description;
                $scope.defaultTrackable.type = trackingPreferences.startupTrackable.type;

                //update the label
                $scope.startupChoicesList[0].text = STARTUP_CHOICE_CHOOSE_DEFAULT_TEXT +
                    " ( " + $scope.defaultTrackable.name + " )";

            }
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
        });

        //******************************************************

        $scope.startupChoiceChanged = function(item) {
            alert("item chosed is: " + item.value + $scope.data.startupChoice);
            if(item.value===STARTUP_CHOICE_CHOOSE_DEFAULT_VALUE) {
                $scope.openModal();
            }
        };


        //range input change, for revert language direction
        $scope.batchesSwitchChanged = function() {

            var trackingPreferences = window.localStorage.getItem('trackingPreferences');
            if(trackingPreferences) {
                trackingPreferences = JSON.parse(trackingPreferences);
                trackingPreferences.batchesEnabled = $scope.batchesSending.checked;
                trackingPreferences.batchesSize = $scope.batches.size;
                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));

            }

        };


});