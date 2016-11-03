/**
 * Created by paulocristo on 13/05/16.
 */
angular.module('trackme.SettingsController', ['ionic','ionic-material'])

    .controller('SettingsController',function ($scope, $http, $ionicModal) {

        //models for the checkboxes
        $scope.wifiOnly = { checked: true };
        $scope.batchesSending = { checked: true} ;
        $scope.batchSize = 2;
        $scope.startupTracking = {checked: true} ;

        $scope.data =  {
            startupChoice : 'cdt'
        };


        $scope.trackingInterval = { minutes: 1};

        $scope.batches = {size: 2};


        $scope.startupChoicesList = [
            { text: "Choose a default trackable", value: "cdt" },
            { text: "I will choose later", value: "wcl" }
        ];

        //load default preferences
        var loadDefaultPreferences = function() {

            var trackingPreferences = window.localStorage.getItem('trackingPreferences');

            if(!trackingPreferences) {

                trackingPreferences = {
                    startupTrackingEnabled : $scope.startupTracking.checked,
                    startupTrackable:null,
                    batchesEnabled : $scope.batchesSending.checked,
                    batchesSize: $scope.batches.size,
                    wifiOnly: $scope.wifiOnly.checked
                };

                window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));
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
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function() {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
        });

        //******************************************************

        $scope.startupChoiceChanged = function(item) {
            alert("item chosed is: " + item.value + $scope.data.startupChoice);
            if(item.value==='cdt') {
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