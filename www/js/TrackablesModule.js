/**
 * Created by paulocristo on 31/10/15.
 */

//trackables controller

angular.module('trackme.TrackablesController',[])

.controller('TrackablesController',function ($scope, /*$cookies,*/ $http) {

    $scope.testme = function() {
        $scope.$emit("testme", {});
    };

    var serverLocation = window.localStorage.getItem('serverLocation');

    console.log("trying it now....");
    //$scope.testGetProfile();

    //will hold the trackables
    $scope.trackables = [];
    //filtering options
    $scope.selectedTrackable = "Show all";

    //store the main object on the scope
    $scope.formTrackablesData = {};

    //default privacy level
    $scope.formTrackablesData.privacy = "Private";

    $scope.formTrackablesData.showPrivacy = false;

    $scope.formTrackablesData.typeOptions = ['Person','Object', 'Animal'];

    $scope.privacyChanged = function() {
        console.log("privacy changed to: " + $scope.formTrackablesData.privacy);
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

            console.log("getting all available trackables for username: " + userData.email);


            var apiPath = serverLocation +'/api/trackables?owner=' + userData.email;
            $http({
                method  : 'GET',
                url     : apiPath,
                headers : { 'Authorization': 'Bearer ' + userData.token }  // set the headers so angular passing info as form data (not request payload)
            })
            //$http.get(apiPath)
                .success(function(data) {

                    //reset all input fields, so we can add a new one again
                    //$scope.formTrackablesData.privacy = "Private";
                    //$scope.formTrackablesData.name = "";
                    //$scope.formTrackablesData.description = "";
                    //$scope.formTrackablesData.type = $scope.formTrackablesData.typeOptions[0];
                    //do not clear $scope.formTrackablesData.owner

                    //add new received data to the $scope var
                    $scope.trackables = data;
                    console.log("received: " +data);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
        }


    };

    // when landing on the page, get the username, all his trackables, and then we show them!
    //$scope.getTrackableOwner($scope.getAllTrackables);

    console.log("CALLED HERERERERERERRERERERE");
    $scope.getAllTrackables();

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


        //call this
     $scope.refreshMap = function (newMarkers) {
          //clear previous markers
         /*$scope.mapMarkers = newMarkers;

         $scope.mapMarkers.push(createRecordMarker(1,32.779680, -79.935493, $scope.map.bounds));

         console.log("refreshing map for device/trackable change....");
         //optional param if you want to refresh you can pass null undefined or false or empty arg
         $scope.map.control.refresh($scope.map.center);//{latitude: 32.779680, longitude: -79.935493}
         $scope.map.control.getGMap().setZoom($scope.map.zoom);
         return;*/
      };

      $scope.trackableChanged = function(trackableFilter) {

            $scope.testme();

            var userData = JSON.parse( window.localStorage.getItem( 'userData'));
            var apiPath = serverLocation +'/api/trackables?owner=' + userData.email;

          //TODO change the backend, i do not need (or should) to pass the owner (should be only mines)
            if(trackableFilter==null) {
                trackableFilter = "Show all";
            }
            else {
                apiPath = apiPath + "&trackable_id=" + trackableFilter;
            }
            console.log("apiPath: " + apiPath);

            //clear markers
            var markers = [];


              $http({
                  method  : 'GET',
                  url     : apiPath,
                  headers : { 'Authorization': 'Bearer ' + userData.token }  // set the headers so angular passing info as form data (not request payload)
              }).success(function(data) {
                    $scope.records = data;
                    console.log("received" + JSON.stringify(data));

                    for(var i=0; i< data.length; i++) {

                        var latitude = data[i].latitude;
                        var longitude = data[i].longitude;
                        //TODO
                        //markers.push(createRecordMarker(i, latitude, longitude, $scope.map.bounds));
                    }
                    //TODO
                    //$scope.refreshMap(markers);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });

      };

});