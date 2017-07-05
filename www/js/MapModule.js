/**
 * Created by paulocristo on 09/05/16.
 */

angular.module('trackme.MapController', ['ionic','ionic-material','PreferencesService'])

.controller('MapController',function ($scope, $http, $ionicPopover,$ionicPlatform,$ionicSideMenuDelegate, Preferences) {

        var serverLocation = window.localStorage.getItem('serverLocation');

        //http://ionicframework.com/docs/api/directive/ionSideMenus/
        $scope.$watch(function () {
                return $ionicSideMenuDelegate.isOpenLeft();
            },
            function (isOpen) {
                if (isOpen){
                    document.getElementById('main_menu_view').style.display = 'initial';
                }else {
                    document.getElementById('main_menu_view').style.display = 'none';
                }

            });

        //in order to events fire the controller must be attached to the ion-view on the template
        /*$scope.$on('$ionicView.enter', function(){
            // Entering in map page, assuring the content will show up
            document.getElementById('main_menu_view').style.display = 'none';
        });

        $scope.$on('$ionicView.leave', function(){
            document.getElementById('main_menu_view').style.display = 'initial';
        });*/

        //will hold the devices
        //$scope.allDevices = [];
        //filtering options
        $scope.selectedDevice= "Show all";

        //will hold the trackables
        //$scope.allTrackables = [];
        //filtering options
        $scope.selectedTrackable = "Show all";

        //will hold the map markers
        $scope.mapMarkers = [];
        //will hold the lines between records
        $scope.polylines = [];

        //aux function to set the position of the marker given a lat/lng pair
        $scope.setPosition = function(lat, lng) {
            return new plugin.google.maps.LatLng(lat, lng);
        };

        //creates the marker for the record on the map!!!
        var createRecordMarker = function(i, lat,lng,/*, bounds,*/ idKey) {

            if (idKey == null) {
                idKey = "id";
            }

            /*

             //icon as background image
             var newstyle = {
             'background-image':'url("img/markers/'+value[8]+'")',
             'background-size': '36.5px 61px',
             'background-position': 'top left',
             'background-repeat': 'no-repeat'
             }

             on css
             .labelClass {
             padding-top:29px;
             padding-left:2px;
             color:#000;
             font-family: 'open_sansregular';
             height:61px;
             width:37px;
             font-size:9px;
             line-height: 12px;
             }



             */

            var newstyle = {
                'opacity': '0.75'
            }

            var marker = {
                //latitude: lat,
                //longitude: lng,
                'position': $scope.setPosition(lat,lng),
                'title': 'marker_' + i + '<br/>Location: ' + '(' + lat + '),('+  lng + ')'
                /*options: {
                    labelContent : 'Paulo Cristo',
                    labelAnchor: "36 61",
                    labelClass: 'labelClass',
                    labelStyle: newstyle,
                    labelInBackground: false
                }*/

            };
            marker[idKey] = i;
            return marker;
        };

        //call this
        $scope.refreshMap = function (newMarkers) {
            //clear previous markers
            $scope.mapMarkers = newMarkers;

            $scope.mapMarkers.push(createRecordMarker(1,32.779680, -79.935493/*, $scope.map.bounds*/));

            console.log("refreshing map for device/trackable change....");
            //optional param if you want to refresh you can pass null undefined or false or empty arg
            //$scope.map.control.refresh($scope.map.center);//{latitude: 32.779680, longitude: -79.935493}
            //$scope.map.control.getGMap().setZoom($scope.map.zoom);
            for (var i = 0; i < $scope.mapMarkers.length; i++) {
                $scope.map.addMarker({
                    'title': $scope.mapMarkers[i].title,
                    'position': $scope.mapMarkers[i].position
                }, function(marker) {

                    // Defining event for each marker
                    marker.on("click", function() {
                       // alert(marker.get('marker').title);
                        marker.showInfoWindow();
                    });


                });
            }

            return;
        };


        $ionicPlatform.ready(function() {
        //$scope.loadMap = function() {
            // Getting the map selector in DOM
            var div = document.getElementById("map_canvas");

            //if(Device.isPhoneGap) {
            // Invoking Map using Google Map SDK v2 by dubcanada
            var map = plugin.google.maps.Map.getMap(div,{

                'mapType': plugin.google.maps.MapTypeId.NORMAL,
                'camera': {
                    'latLng': $scope.setPosition(32.779680, -79.935493),//this is the initial position
                    'zoom': 4
                },
                'controls': {
                    'compass': true,
                    'myLocationButton': true,
                    'indoorPicker': true,
                    'zoom': true
                },
                'gestures': {
                    'scroll': true,
                    'tilt': true,
                    'rotate': true,
                    'zoom': true
                }
            });

            //TODO https://github.com/mapsplugin/cordova-plugin-googlemaps/issues/791
            
            //check http://codepen.io/yafraorg/pen/jBEky
            //https://gist.github.com/thomasfl/6e9cd0c25e331dc1f42c#file-ionic-map-slide-menu-app-markdown
            //setting the var available on $scope
            $scope.map = map;

            // Capturing event when Map load are ready.
            $scope.map.addEventListener(plugin.google.maps.event.MAP_READY, function(){
                
                $scope.map.setVisible(true);
                $scope.map.setClickable(true);
                //$ionicSideMenuDelegate.canDragContent(false);
                // Defining markers for demo
                /*var markers = [{
                    position: $scope.setPosition(-19.9178713, -43.9603117),
                    title: "Marker 1"
                }, {
                    position: $scope.setPosition(-19.8363826, -43.9787167),
                    title: "Marker 2"
                }];

                // Bind markers
                for (var i = 0; i < markers.length; i++) {
                    $scope.map.addMarker({
                        'marker': markers[i],
                        'position': markers[i].position
                    }, function(marker) {

                        // Defining event for each marker
                        marker.on("click", function() {
                            alert(marker.get('marker').title);
                        });

                    });
                }*/

                //when landing on the page, will get all trackables and assign them on the map
                $scope.trackableChanged(null);

            });


        });

        $scope.trackableChanged = function(trackableFilter) {
            alert($scope.selectedTrackable);
            if(window.plugin) {

                var userData = Preferences.getUserData();
                var apiPath = serverLocation + '/api/records';

                //TODO change the backend, i do not need (or should) to pass the owner (should be only mines)
                if (trackableFilter == null) {
                    trackableFilter = "Show all";
                }
                else {
                    apiPath = apiPath + "?trackable_id=" + trackableFilter;
                }
                console.log("apiPath: " + apiPath);

                //clear markers
                var markers = [];


                $http({
                    method: 'GET',
                    url: apiPath,
                    headers: {'Authorization': 'Bearer ' + userData.token}  // set the headers so angular passing info as form data (not request payload)
                }).success(function (data) {
                    $scope.records = data;
                    console.log("received" + JSON.stringify(data));

                    //TODO, this is wrong the line should be always between records of same trackable (even if from different devices?)
                    //TODO and the values should be returned in order/date no?? otherwise the lines are not correct
                    var previous = 0;
                    var current = 0;
                    var currentTrackableId = "";
                    var previousTrackableId = "";

                    for (var i = 0; i < data.length; i++) {

                        var latitude = data[i].latitude;
                        var longitude = data[i].longitude;
                        //TODO
                        markers.push(createRecordMarker(i, latitude, longitude/*, $scope.map.bounds*/));
                        console.log("created marker for position lat:" + latitude + ",lng: " + longitude);

                        /**************** handle poly lines ***************************************/


                        if (i > 0) {
                            previous = i - 1;
                            previousTrackableId = data[previous].trackableId;
                        }
                        current = i;
                        currentTrackableId = data[current].trackableId;

                        //var latitude = data[i].latitude;
                        //var longitude = data[i].longitude;
                        //markers.push(createRecordMarker(i,latitude, longitude, $scope.map.bounds));

                        current = i;


                        if ((current !== previous && current > previous) && (previousTrackableId === currentTrackableId)) {
                            //run the loop again BAD!!!

                            $scope.map.addPolyline({
                                points: [
                                    $scope.setPosition(data[previous].latitude, data[previous].longitude),
                                    $scope.setPosition(data[current].latitude, data[current].longitude)
                                ],
                                'color': '#6060FB',
                                'width': 3,
                                'geodesic': true,
                                'editable': false,
                                'draggable': false,
                                'visible': true,

                                //NOT supported on V2 (plugin uses it)
                                /*icons: [{
                                    icon: {
                                        //https://developers.google.com/maps/documentation/javascript/symbols
                                        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                                    },
                                    offset: '25px',
                                    repeat: '50px'
                                }]*/


                            }, function (polyline) {

                            });




                        }


                        /**************************************************************************/


                    }
                    //TODO
                    $scope.refreshMap(markers);
                })
                    .error(function (data) {
                        console.log('Error: ' + data);
                    });

            }

        };

        $scope.deviceChanged = function(deviceFilter) {

            //if(window.plugin) {
            alert(deviceFilter);

                var userData = Preferences.getUserData();
                console.log("mapmodule: getting all available devices for username: " + userData.email);

                var serverLocation = window.localStorage.getItem('serverLocation');
                var apiPath = serverLocation +'/api/records';


                if(deviceFilter==null) {
                    deviceFilter = "Show all";
                }
                else {
                    apiPath = apiPath + "?device_id=" + deviceFilter;
                }
                console.log("device changed to: " + deviceFilter + " apiPath: " + apiPath);

                //clear markers
                var markers = [];
                $http({
                    method  : 'GET',
                    url     : apiPath,
                    headers : { 'Authorization': 'Bearer ' + userData.token }
                    // set the headers
                }).success(function(data) {
                    $scope.records = data;
                    console.log("received" + JSON.stringify(data));
                    for(var i=0; i< data.length; i++) {

                        var latitude = data[i].latitude;
                        var longitude = data[i].longitude;
                        markers.push(createRecordMarker(i, latitude, longitude/*, $scope.map.bounds*/));
                    }
                    $scope.refreshMap(markers);
                })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            //}




        };

        //if(window.plugin) {
            //load the map
            var defaultDevice = Preferences.loadDefaultDevice();
            if(defaultDevice && defaultDevice.deviceId) {
                $scope.deviceChanged(defaultDevice.deviceId);
            }
        //}


});
