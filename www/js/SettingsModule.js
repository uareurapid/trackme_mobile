/**
 * Created by paulocristo on 13/05/16.
 */
angular.module('trackme.SettingsController', ['ionic','ionic-material','PreferencesService','GeoLocationService'])

    .controller('SettingsController',function ($scope, $http, $ionicModal, $ionicPopup, Preferences, GeoLocation) {

        var STARTUP_CHOICE_CHOOSE_LATER_VALUE = 'wcl';
        var STARTUP_CHOICE_CHOOSE_DEFAULT_VALUE = 'cdt';
        var STARTUP_CHOICE_CHOOSE_LATER_TEXT = "No thanks! I will choose later";
        var STARTUP_CHOICE_CHOOSE_DEFAULT_TEXT = "Choose a default trackable";

        //models for the checkboxes
        $scope.wifiOnly = { checked: true };
        //$scope.allowSMS = { checked: false };
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

        var savePreferences =  function() {

            var trackingPreferences = Preferences.loadDefaultPreferences();
            trackingPreferences.startupTrackingEnabled = $scope.startupTracking.checked;
            trackingPreferences.startupTrackable = $scope.defaultTrackable;
            trackingPreferences.batchesEnabled = $scope.batchesSending.checked;
            trackingPreferences.batchesSize = $scope.batches.size;
            trackingPreferences.wifiOnly = $scope.wifiOnly.checked;
            //trackingPreferences.allowSMS = $scope.allowSMS.checked;
            trackingPreferences.trackingInterval = $scope.trackingInterval.minutes;

            trackingPreferences.backgroundTrackingEnabled = $scope.backgroundTracking.checked;

            window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));
        };

        //load default preferences
        var loadDefaultPreferences = function() {

            //TODO find a better way to deal with JSON, maybe
            //Awesome local storage for Ionic with ngStorage?
            var trackingPreferences = Preferences.loadDefaultPreferences();

            //they exist, read them
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

            //$scope.allowSMS.checked = trackingPreferences.allowSMS;

            $scope.backgroundTracking.checked = trackingPreferences.backgroundTrackingEnabled;

            $scope.trackingInterval.minutes = trackingPreferences.trackingInterval;


        };

        //load on startup
        loadDefaultPreferences();

        //check if we have a default trackable
        var hasDefaultTrackable = function() {
          return  $scope.defaultTrackable.name.length > 0;
        };

        //create the options list
        $scope.startupChoicesList = [
            { text: STARTUP_CHOICE_CHOOSE_DEFAULT_TEXT + (hasDefaultTrackable() ? " (" + $scope.defaultTrackable.name + " )" : $scope.defaultTrackable.name),
                value: STARTUP_CHOICE_CHOOSE_DEFAULT_VALUE },
            { text: STARTUP_CHOICE_CHOOSE_LATER_TEXT, value: STARTUP_CHOICE_CHOOSE_LATER_VALUE }
        ];

        $scope.backgroundTrackingChanged =  function() {
            var trackingPreferences = Preferences.loadDefaultPreferences();
            if(trackingPreferences) {
                trackingPreferences.backgroundTrackingEnabled = $scope.backgroundTracking.checked;
                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));

            }
        };

        $scope.wifiOnlyChanged =  function() {

            var trackingPreferences = Preferences.loadDefaultPreferences();
            if(trackingPreferences) {
                trackingPreferences.wifiOnly = $scope.wifiOnly.checked;
                //if wifi only, disable SMS
                //trackingPreferences.allowSMS = !trackingPreferences.wifiOnly;
                //$scope.allowSMS.checked = trackingPreferences.allowSMS;
                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));
            }
        };

        /*$scope.allowSMSChanged =  function() {

            if(!$scope.allowSMS.checked && !$scope.wifiOnly.checked) {

                $ionicPopup.alert({
                    title: 'Network Preferences',
                    content: 'You need to provide at least one valid option'
                }).then(function(res) {
                    console.log('ok accepted');
                    return;
                });

                return;
            }

            var trackingPreferences = Preferences.loadDefaultPreferences();
            if(trackingPreferences) {
                trackingPreferences.allowSMS = $scope.allowSMS.checked;
                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));
            }
        };*/

        $scope.startupTrackingChanged = function() {

            var trackingPreferences = Preferences.loadDefaultPreferences();
            if(trackingPreferences) {
                trackingPreferences.startupTrackingEnabled = $scope.startupTracking.checked;
                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));

            }
        };

        $scope.trackingIntervalChanged = function() {

            var trackingPreferences = Preferences.loadDefaultPreferences();
            if(trackingPreferences) {
                trackingPreferences.trackingInterval = $scope.trackingInterval.minutes;
                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));

            }
        };

        //range input change, for revert language direction
        $scope.batchesSwitchChanged = function() {

            var trackingPreferences = Preferences.loadDefaultPreferences();
            if(trackingPreferences) {
                trackingPreferences.batchesEnabled = $scope.batchesSending.checked;
                trackingPreferences.batchesSize = $scope.batches.size;
                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));

            }

        };

        //apply changes
        $scope.applyNewPreferences = function() {

            savePreferences();

            //and restart again if everything is set
            if($scope.startupTracking.checked && $scope.defaultTrackable.name) {

                //if already tracking...
                if(GeoLocation.isTrackingInProgress()) {
                    //then stop the current tracking
                    GeoLocation.stopTrackingLocation();

                }
                alert("Start tracking " + $scope.defaultTrackable.name);
                //restart tracking with new settings
                GeoLocation.startTrackingLocation();
            }else alert("do nothing");
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

            loadDefaultPreferences();
            //update the selected trackable label after reading the preferences
            $scope.startupChoicesList[0].text = STARTUP_CHOICE_CHOOSE_DEFAULT_TEXT +
                (hasDefaultTrackable() ? " (" + $scope.defaultTrackable.name + " )" : $scope.defaultTrackable.name);

        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
        });

        //******************************************************

        $scope.startupChoiceChanged = function(item) {
            if(item.value===STARTUP_CHOICE_CHOOSE_DEFAULT_VALUE) {
                $scope.openModal();
            }
        };

});