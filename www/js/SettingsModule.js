/**
 * Created by paulocristo on 13/05/16.
 */
angular.module('trackme.SettingsController', ['ionic','ionic-material'])

    .controller('SettingsController',function ($scope, $http, $ionicModal) {

        $scope.wifiOnly = { checked: true };

        $scope.batchSize = 2;

        //model for the checkboxes
        $scope.batchesSending = { checked: true} ;
        $scope.startupTracking = {checked: true} ;

        $scope.data =  {
            startupChoice : 'cdt'
        };

        $scope.wifiOnlyChanged =  function() {
            console.log("use wifi only" + $scope.wifiOnly.checked);
        };

        //DO THIS ON INIT
        var testData = window.localStorage.getItem('startupTracking');
        var enabledOnStartup = true;
        if(!testData) {
            var startupTracking = {
                startupTrackingEnabled : enabledOnStartup,
                startupTrackable:null
            };
            console.log("setting item on storage");
            window.localStorage.setItem('startupTracking',JSON.stringify(startupTracking));
        }

        //is enabled?
        $scope.isStartupTrackingEnabled = function() {
            console.log("isStartupTrackingEnabled()");
            var testData = window.localStorage.getItem('startupTracking');
            if(testData) {
                var startupTracking = JSON.parse(testData);
                enabledOnStartup = startupTracking.startupTrackingEnabled;
                console.log("isStartupTrackingEnabled() return " + enabledOnStartup);
                return enabledOnStartup;
            }
            console.log("isStartupTrackingEnabled() return true");
            return true;
        };

        //save changes
        $scope.startupTrackingChanged = function() {
            console.log("startupTrackingChanged()");
            enabledOnStartup = !enabledOnStartup;
            var testData = window.localStorage.getItem('startupTracking');
            if(testData) {
                var startupTracking = JSON.parse(testData);
                startupTracking.startupTrackingEnabled = enabledOnStartup;
                window.localStorage.setItem('startupTracking',JSON.stringify(startupTracking));
                console.log("after startupTrackingChanged()");
            }
        };

        $scope.startupChoicesList = [
            { text: "Choose a default trackable", value: "cdt" },
            { text: "I will choose later", value: "wcl" }
        ];

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
            console.log("item chosed is: " + item.value + $scope.data.startupChoice);
            if(item.value==='cdt') {
                $scope.openModal();
            }
        };


        //range input change, for revert language direction
        $scope.batchesSwitchChanged = function() {

            console.log('batchesSwitchChanged called');

            var divBatchesSize = document.getElementById('invisible_batch_sizes');
            if(angular.element(divBatchesSize).hasClass('is-hidden')) {
                angular.element(divBatchesSize).removeClass('is-hidden');
                angular.element(divBatchesSize).addClass('is-visible');
            }
            else {
                angular.element(divBatchesSize).removeClass('is-visible');
                angular.element(divBatchesSize).addClass('is-hidden');
            }

            var self = this;
            var rangeElement = document.getElementById('batches-switch-input');


            //---------------------------- try a bubble
            // Measure width of range input
            var width = angular.element(rangeElement).clientWidth;// Figure out placement percentage between left and right of input
            var newPoint = ( angular.element(rangeElement).val() - angular.element(rangeElement).attr("min")) / ( angular.element(rangeElement).attr("max") - angular.element(rangeElement).attr("min"));
            var newPlace,offset = -1;
            // Prevent bubble from going beyond left or right (unsupported browsers)
            if (newPoint < 0) {
                newPlace = 0;
            }
            else if (newPoint > 1) {
                newPlace = width;
            }
            else {
                newPlace = width * newPoint + offset; offset -= newPoint;
            }

            // Move bubble
            //var rangeElementOutput = document.getElementById('.batches-switch-output');
            angular.element(rangeElement)
                .next("output")
                .css({
                    left: newPlace,
                    marginLeft: offset*15 + "%",
                })
                .text( angular.element(rangeElement).val());


        };


    });