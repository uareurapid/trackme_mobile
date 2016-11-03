/**
 * Created by paulocristo on 13/05/16.
 */
angular.module('trackme.SettingsController', ['ionic','ionic-material'])

    .controller('SettingsController',function ($scope, $http, $ionicModal) {

        var STARTUP_CHOICE_CHOOSE_LATER_VALUE = 'wcl';
        var STARTUP_CHOICE_CHOOSE_DEFAULT_VALUE = 'cdt';
        var STARTUP_CHOICE_CHOOSE_LATER_TEXT = "No thanks! I will choose later";
        var STARTUP_CHOICE_CHOOSE_DEFAULT_TEXT = "Choose a default trackable";

        //models for the checkboxes
        $scope.wifiOnly = { checked: true };
        $scope.batchesSending = { checked: true} ;
        $scope.batchSize = 2;
        $scope.startupTracking = {checked: true} ;

        $scope.data =  {
            startupChoice : STARTUP_CHOICE_CHOOSE_LATER_VALUE
            //cdt
        };


        $scope.trackingInterval = { minutes: 1};

        $scope.batches = {size: 2};

        //is there a default trackable selected? if so, show it´s name on the settings
        //TODO, maybe select it also on the modal window??
        $scope.defaultTrackable = {
            name: "",
            description: "",
            privacy: "",
            type: ""

        };

        $scope.startupChoicesList = [
            { text: STARTUP_CHOICE_CHOOSE_DEFAULT_TEXT + $scope.defaultTrackable, value: STARTUP_CHOICE_CHOOSE_DEFAULT_VALUE },
            { text: STARTUP_CHOICE_CHOOSE_LATER_TEXT, value: STARTUP_CHOICE_CHOOSE_LATER_VALUE }
        ];

        //load default preferences
        var loadDefaultPreferences = function() {

            var trackingPreferences = window.localStorage.getItem('trackingPreferences');

            if(!trackingPreferences) {

                trackingPreferences = {
                    startupTrackingEnabled : $scope.startupTracking.checked,
                    startupTrackable: $scope.defaultTrackable,
                    batchesEnabled : $scope.batchesSending.checked,
                    batchesSize: $scope.batches.size,
                    wifiOnly: $scope.wifiOnly.checked
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

                $scope.batchesSending.checked = trackingPreferences.batchesEnabled;
                $scope.batches.size = trackingPreferences.batchesSize;
                $scope.wifiOnly.checked = trackingPreferences.wifiOnly;

            }
        };

        //load on startup
        loadDefaultPreferences();

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



        //*******************************************************

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

                alert("selected: " + $scope.defaultTrackable);
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