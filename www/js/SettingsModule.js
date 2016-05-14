/**
 * Created by paulocristo on 13/05/16.
 */
angular.module('trackme.SettingsController', [])

    .controller('SettingsController',function ($scope, $http) {

        $scope.batchSize = 2;

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