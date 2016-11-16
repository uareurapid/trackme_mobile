/**
 * Created by paulocristo on 31/10/15.
 */

//trackables controller

angular.module('trackme.TrackablesController',['trackme.MapController','ionic','ionic-material'])

.controller('TrackablesController',function ($scope, /*$cookies,*/ $http, $ionicPopover) {

    $scope.testme = function() {
        $scope.$emit("testme", {});
    };

        $scope.$on('$ionicView.enter', function(){
            alert('Map View Entered');
        });

        $scope.$on('$ionicView.loaded', function(){
            alert('Map View Exited');
        });

        $scope.selectedTrackable = {
            privacy: "",
            name: "",
            description: "",
            type: "",
            _id: ""
        };
        //FOR POPOVER
        // .fromTemplateUrl() method
        $ionicPopover.fromTemplateUrl('trackable_detail.html', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });


        $scope.openPopover = function($event,trackable) {
            $scope.selectedTrackable = trackable;
            $scope.popover.show($event);
        };
        $scope.closePopover = function() {
            $scope.popover.hide();
        };
        //Cleanup the popover when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.popover.remove();
        });
        // Execute action on hidden popover
        $scope.$on('popover.hidden', function() {
            // Execute action
        });
        // Execute action on remove popover
        $scope.$on('popover.removed', function() {
            // Execute action
        });

    var serverLocation = window.localStorage.getItem('serverLocation');

    $scope.trackables = [];

    var isLoadingTrackables = false;
    //store the main object on the scope
    $scope.formTrackablesData = {};

    //default privacy level
    $scope.formTrackablesData.privacy = "Private";

    $scope.formTrackablesData.showPrivacy = false;

    $scope.formTrackablesData.typeOptions = ['Person','Object', 'Animal'];

    $scope.privacyChanged = function() {
        console.log("privacy changed to: " + $scope.formTrackablesData.privacy);
    };

    //TODO CODE ME
    $scope.startTracking = function(trackable){

    };

    //############ GET THE TRACKABLE OWNER #####################################
    $scope.getTrackableOwner = function(successCallback, errorCallback) {

        //actually gets the logged in username
        $http.get('/profile/user')
            .success(function (data) {
                console.log("trackable owner: " + data.username);
                //assign the username to the scope var
                $scope.formTrackablesData.owner = data.username;
                successCallback();

            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    //TODO FOR FORM VALIDATION HOWTO CHECK:
    //https://scotch.io/tutorials/angularjs-form-validation


    //######## GET ALL TRACKABLES ###############
    $scope.getAllTrackables = function() {

        var userData = JSON.parse( window.localStorage.getItem( 'userData'));
        if(userData) {

            isLoadingTrackables = true;

            console.log("getting all available trackables for username: " + userData.email);


            var apiPath = serverLocation +'/api/trackables?owner=' + userData.email;
            $http({
                method  : 'GET',
                url     : apiPath,
                headers : { 'Authorization': 'Bearer ' + userData.token }  // set the headers so angular passing info as form data (not request payload)
            })
            //$http.get(apiPath)
                .success(function(data) {

                    //add new received data to the $scope var
                    $scope.trackables = data;
                    console.log("received: " +JSON.stringify(data));
                    isLoadingTrackables = false;
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                    isLoadingTrackables = false;
                });
        }


    };

    // when landing on the page, get the username, all his trackables, and then we show them!
    // TODO this should be cached and loaded on demand, and not called all the time when the page loads

    if($scope.trackables.length===0 && !isLoadingTrackables) {
        $scope.getAllTrackables();
    }

    //############## CREATE NEW TRACKABLE ######################
    //this is actually the submit of the form
    //called from ui to create a new trackable object
    $scope.createTrackable = function() {

        //first thing is get the username
        //i do not need to check the username again, since the value is available since first landed on the page

        //now send the trackable data
        console.log("sending new trackable request now...");

        var apiPath = serverLocation +'/api/trackables';

        var userData = JSON.parse( window.localStorage.getItem( 'userData'));
        if(userData) {
            console.log("for username: " + userData.email);
            $scope.formTrackablesData.owner = userData.email;

        }

        $http({
            method  : 'POST',
            url     : apiPath,
            /*transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },*/
            data: $scope.formTrackablesData,
            headers : { /*'Content-Type': 'application/x-www-form-urlencoded',*/'Authorization': 'Bearer ' + userData.token }
              // set the headers so angular passing info as form data (not request payload)
        })
        //$http.post('/api/trackables', $scope.formTrackablesData)
            .success(function(data) {
                console.log("ADD TRACKABLE RESPONSE: " + data);
                //get them all again and clear the form fields
                $scope.getAllTrackables();
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });

    };

    //select a startup trackable
    $scope.selectStartupTrackable = function(trackable) {
        console.log("selected startup trackable: " + JSON.stringify(trackable));

        //TODO direct mapping here, carefull, check this
        var trackingPreferences = window.localStorage.getItem('trackingPreferences');
        if(trackingPreferences) {
            trackingPreferences = JSON.parse(trackingPreferences);
            trackingPreferences.startupTrackable = trackable;
            window.localStorage.setItem('trackingPreferences',JSON.stringify(trackingPreferences));

        }
    };

    // delete a trackable after checking it
    $scope.deleteTrackable = function(id) {

        $http.delete('/api/trackables/' + id)
            .success(function(data) {
                $scope.trackables = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };


});