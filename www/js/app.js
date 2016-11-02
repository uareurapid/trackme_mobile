// Ionic Starter App


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('trackme', ['ionic','trackme.DeviceUtils','trackme.DevicesController',
    'trackme.TrackablesController','trackme.MapController','trackme.SettingsController',
    'trackme.GeoLocationController','GeoLocationService','ionic-material'])


    //TODO check ionic material stuff
    //https://github.com/zachfitz/Ionic-Material
    //DEMO http://ionicmaterial.com/demo/
    .controller('MainController', function($scope, $http, $state, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicPopup, GeoLocation) {


        //if(!window.localStorage.getItem('serverLocation')) {
        //TODO for testing with the proxy on the browser, need to set localhost:8100 (this app and not the other!!!)
            window.localStorage.setItem('serverLocation','http://trackme.no-ip.net:8080');//http://trackme.no-ip.net:8080
        //}

        $scope.rememberMe = { checked: true };
        $scope.keepMeLoggedin = { checked: true };

        $scope.data2 = { 'volume' : '50' };

        $scope.loggedin_user = "";

        //for the slider tutorial
        $scope.data = {};

        //toggle menu left
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        var serverLocation = window.localStorage.getItem('serverLocation');

        var serverLogin = serverLocation +"/rlogin";//http://trackme.no-ip.net
        var serverSignup = serverLocation + "/rsignup";//http://trackme.no-ip.net
        //store the main object on the scope
        $scope.formLogin = {};

        //default privacy level
        $scope.formLogin.user = "";
        $scope.formLogin.pass = "";

        var credentials = window.localStorage.getItem( 'userCredentials');
        if(credentials) {
            credentials = JSON.parse(credentials);
            $scope.formLogin.user = credentials.username;
            $scope.formLogin.pass =  credentials.password;
        }

        //remember me option changed
        $scope.rememberMeChanged =  function() {

        };

        $scope.keepMeLoggedinChanged =  function() {

        };

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

                        //to show on the account menu
                        $scope.loggedin_user = data.email;

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
                    if($scope.rememberMe.checked) {
                        var userCredentials = {
                            username: $scope.formLogin.user,
                            password: $scope.formLogin.pass
                        };

                        //add to local storage
                        window.localStorage.setItem( 'userCredentials',JSON.stringify(userCredentials));

                    }
                    else {
                        //forget it
                        if(window.localStorage.getItem('userCredentials')) {
                            window.localStorage.removeItem('userCredentials');
                        }

                    }

                    window.localStorage.setItem( 'userData',JSON.stringify(userData));
                        console.log("navigate to home/map page, and broadcastmessage...");
                        //$state.go('devices');
                        $state.go('app.home');




                        //GeoLocation.startTrackingLocation();

                        $scope.checkUserDevices();


                        //TODO use this https://medium.com/@petehouston/awesome-local-storage-for-ionic-with-ngstorage-c11c0284d658#.ndfefslhq

                    }

                    //http://blog.ionic.io/handling-cors-issues-in-ionic/
                    //http://stackoverflow.com/questions/24710503/how-do-i-post-urlencoded-form-data-with-http-in-angularjs

                });
        };

        //############ GET ALL USER DEVICES ##################
        // TODO THIS IS DUPLICATED SHOULD BE A SERVICE??
        $scope.getUserDevices = function( callback ) {

            var userData = JSON.parse( window.localStorage.getItem( 'userData'));
            if(userData) {
                console.log("devicesmodule: getting all available devices for username: " + userData.email);

                var serverLocation = window.localStorage.getItem('serverLocation');
                var apiPath = serverLocation +'/api/devices?owner=' + userData.email;

                $http({
                    method  : 'GET',
                    url     : apiPath,
                    headers : { 'Authorization': 'Bearer ' + userData.token }  // set the headers so angular passing info as form data (not request payload)
                })
                    //$http.get(apiPath)
                    .success(function(data) {
                        $scope.devices = data;
                        console.log(data);
                        //send the data to the callback function
                        if(callback && typeof callback === 'function') {
                            callback(data);
                        }
                    })
                    .error(function(data) {
                        console.log('Error: ' + data);
                    });
            }
            else {
                console.log("no user data");
            }


        };

        // A confirm dialog
        $scope.showConfirm = function(confirm, deny) {

            /*$scope.deviceData = {};

            var confirmPopup = $ionicPopup.show({
                template: '<input type="text" name="dev_description" ng-model="deviceData.description">',
                title: 'Add new device?',
                subTitle: 'Add this device as new tracking device?',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.deviceData.description) {
                                //don't allow the user to close unless he enters device description
                                e.preventDefault();
                            } else {
                                return $scope.deviceData.description;
                            }
                        }
                    }
                ]
            });*/

            var confirmPopup = $ionicPopup.confirm({
                title: 'Add new device',
                template: 'Add this device as new tracking device?'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    console.log('You are sure');
                    if(confirm && typeof confirm === 'function') {
                        confirm();
                    }
                } else {
                    console.log('You are not sure');
                    if(deny && typeof deny === 'function') {
                        deny();
                    }
                }
            });
        };

        $scope.checkUserDevices = function() {

            var deviceIdentifier = "My Device Id";//dummy id, just in case
            var deviceDescription = "My Device Description";

            //The cordova-plugin-device plugin defines a global device object,
            if(window.device) {
                deviceIdentifier = device.uuid;
                deviceDescription = device.name;
            }

            console.log("device id/name: " + deviceIdentifier);

            $scope.getUserDevices( function(data) {
                var exists = false;
                //callback function for success
                console.log("callback called with data: " + JSON.stringify(data));
                for (var i = 0; i < data.length; i++) {
                    if(data[i].deviceId==deviceIdentifier) {
                        exists = true;
                        console.log("this device already exists: name " + data[i].deviceId);
                        break;
                    }
                }
                if(!exists) {


                    //----------

                    $scope.showConfirm( function() {
                            //user confirmed
                            var deviceData = {
                                deviceId: deviceIdentifier,
                                deviceDescription: deviceDescription
                            };
                            //save data for prefill();
                            window.localStorage.setItem( 'deviceData',JSON.stringify(deviceData));
                            //navigate
                            $state.go('app.add_devices');
                        },
                        function () {
                            //user denied, do nothing
                        });

                }

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
                        //$state.go('devices');

                        $state.go('app');
                        //TODO use this https://medium.com/@petehouston/awesome-local-storage-for-ionic-with-ngstorage-c11c0284d658#.ndfefslhq

                    }

                    //http://blog.ionic.io/handling-cors-issues-in-ionic/
                    //http://stackoverflow.com/questions/24710503/how-do-i-post-urlencoded-form-data-with-http-in-angularjs

                });
        };

        $scope.next = function() {
            $ionicSlideBoxDelegate.next();
        };
        $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
        };


        $scope.slides = [{name:"1"},{name:"2"},{name:"3"},{name:"4"}];

        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };


        /*$scope.$on("$ionicSlides.sliderInitialized", function(event, data){
            // data.slider is the instance of Swiper
            $scope.slider = data.slider;
        });

        $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
            console.log('Slide change is beginning');
        });

        $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
            // note: the indexes are 0-based
            $scope.activeIndex = data.activeIndex;
            $scope.previousIndex = data.previousIndex;
        });*/

    })


    //ANGULAR ROUTES
 .config(function($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            .state('front', {
                url: '/front',
                templateUrl: "templates/front.html"
            })

            // setup an abstract state for the tabs directive
            .state('login', {
                url: "/login",
                templateUrl: "templates/login.html"
            })

            // setup an abstract state for the tabs directive
            .state('signup', {
                url: "/signup",
                templateUrl: "templates/signup.html"
            })

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
            })

            .state('app.settings', {
                url: "/settings",
                views: {
                    'menuContent': {
                        templateUrl: "templates/settings.html"
                    }
                }

            })

            .state('app.devices', {
                url: "/devices",
                views: {
                    'menuContent': {
                     templateUrl: "templates/devices.html"
                    }
                }

            })

            .state('app.trackables', {
                url: "/trackables",
                views: {
                    'menuContent': {
                        templateUrl: "templates/trackables.html"
                    }
                }

            })

            .state('app.add_trackables', {
                url: "/add_trackables",
                views: {
                    'menuContent': {
                        templateUrl: "templates/add_trackables.html"
                    }
                }

            })


            .state('app.add_devices', {
                url: "/add_devices",
                views: {
                    'menuContent': {
                        templateUrl: "templates/add_devices.html"
                    }
                }

            })

            .state('app.filtering', {
                url: "/filtering",
                views: {
                    'menuContent': {
                        templateUrl: "templates/filtering.html"
                    }
                }

            })

            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent': {
                        templateUrl: "templates/profile.html"
                    }
                }

            })

            .state('app.map', {
                url: "/map",
                views: {
                    'menuContent': {
                        templateUrl: "templates/map.html"
                    }
                }

            })

            //this state has the 'app' state (which has the sidemenu) as its parent state
            .state('app.home', {
                url: "/home",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/home.html"
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/front');



    })

.run(function($ionicPlatform, Device) {



  $ionicPlatform.ready(function() {


    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }



  });
});
