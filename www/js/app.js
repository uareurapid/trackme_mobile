// Ionic Starter App


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('trackme', ['ionic','trackme.DeviceUtils','trackme.DevicesController','trackme.TrackablesController'])


    .controller('MainController', function($scope, $http, $state) {

        var serverLogin = "http://localhost:8100/rlogin";//http://trackme.no-ip.net
        var serverSignup = "http://localhost:8100/rsignup";//http://trackme.no-ip.net
        //store the main object on the scope
        $scope.formLogin = {};

        //default privacy level
        $scope.formLogin.user = "";

        $scope.formLogin.pass = "";


        // process the form
        $scope.performLogin = function() {

            $http({
                method  : 'POST',
                url     : serverLogin,
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {email: $scope.formLogin.user, password: $scope.formLogin.pass},
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
            })
            //$http.post(server, $scope.formLogin)
                .success(function(data) {
                    console.log(data);

                    if (data.status) {

                        console.log('response:' + JSON.stringify(data));

                        // if successful, bind success message to message
                        $scope.status = data.status;
                        $scope.email = data.email;
                        $scope.expires = data.expires;
                        $scope.token = data.token;

                        var userData = {
                            status: data.status,
                            email: data.email,
                            expires: data.expires,
                            token: data.token
                        };


                    window.localStorage.setItem( 'userData',JSON.stringify(userData));
                        console.log("navigate to devices");
                        $state.go('devices');

                        //TODO use this https://medium.com/@petehouston/awesome-local-storage-for-ionic-with-ngstorage-c11c0284d658#.ndfefslhq

                    }

                    //http://blog.ionic.io/handling-cors-issues-in-ionic/
                    //http://stackoverflow.com/questions/24710503/how-do-i-post-urlencoded-form-data-with-http-in-angularjs

                });
        };

        // process the form
        $scope.performSignup = function() {

            $http({
                method  : 'POST',
                url     : serverSignup,
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: {email: $scope.formLogin.user, password: $scope.formLogin.pass},
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
            })
                //$http.post(server, $scope.formLogin)
                .success(function(data) {
                    console.log(data);

                    if (data.status) {

                        console.log('response:' + JSON.stringify(data));

                        // if successful, bind success message to message
                        $scope.status = data.status;
                        $scope.email = data.email;
                        $scope.expires = data.expires;
                        $scope.token = data.token;

                        var userData = {
                            status: data.status,
                            email: data.email,
                            expires: data.expires,
                            token: data.token
                        };


                        window.localStorage.setItem( 'userData',JSON.stringify(userData));
                        console.log("navigate to devices");
                        $state.go('devices');

                        //TODO use this https://medium.com/@petehouston/awesome-local-storage-for-ionic-with-ngstorage-c11c0284d658#.ndfefslhq

                    }

                    //http://blog.ionic.io/handling-cors-issues-in-ionic/
                    //http://stackoverflow.com/questions/24710503/how-do-i-post-urlencoded-form-data-with-http-in-angularjs

                });
        };

    })

 .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            .state('splash', {
                url: '/splash',
                templateUrl: "splash.html"
            })

            // setup an abstract state for the tabs directive
            .state('login', {
                url: "/login",
                templateUrl: "login.html"
            })

            // setup an abstract state for the tabs directive
            .state('signup', {
                url: "/signup",
                templateUrl: "signup.html"
            })

            .state('devices', {
                url: "/devices",
                templateUrl: "devices.html"
            });




        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/splash');

        /*var $cookies;
        angular.injector(['ngCookies']).invoke(['$cookies', function(_$cookies_) {
            $cookies = _$cookies_;
        }]);*/


    })

.run(function($ionicPlatform, Device) {



  $ionicPlatform.ready(function() {

      var hello = Device.Hello();
      console.log(hello);

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // Getting the map selector in DOM
    var div = document.getElementById("map_canvas");

    if(Device.isPhoneGap) {
        // Invoking Map using Google Map SDK v2 by dubcanada
        var map = plugin.google.maps.Map.getMap(div,{
            'camera': {
                'latLng': setPosition(-19.9178713, -43.9603117),
                'zoom': 10
            }
        });

        // Capturing event when Map load are ready.
        map.addEventListener(plugin.google.maps.event.MAP_READY, function(){

            // Defining markers for demo
            var markers = [{
                position: setPosition(-19.9178713, -43.9603117),
                title: "Marker 1"
            }, {
                position: setPosition(-19.8363826, -43.9787167),
                title: "Marker 2"
            }];

            // Bind markers
            for (var i = 0; i < markers.length; i++) {
                map.addMarker({
                    'marker': markers[i],
                    'position': markers[i].position
                }, function(marker) {

                    // Defining event for each marker
                    marker.on("click", function() {
                        alert(marker.get('marker').title);
                    });

                });
            }
        });

        // Function that return a LatLng Object to Map
        function setPosition(lat, lng) {
            return new plugin.google.maps.LatLng(lat, lng);
        }
    }

  });
});
