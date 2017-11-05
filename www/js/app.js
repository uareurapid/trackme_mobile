// Ionic Starter App


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('trackme', ['ionic','trackme.DeviceUtils','trackme.DevicesController',
    'trackme.TrackablesController','trackme.MapController','trackme.SettingsController',
    'GeoLocationService','PreferencesService','ionic-material','ngCookies'])
//removed 'trackme.GeoLocationController',

    //TODO check ionic material stuff
    //https://github.com/zachfitz/Ionic-Material
    //DEMO http://ionicmaterial.com/demo/
    .controller('MainController', function($scope, $http, $state, $cookies, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicPopup, GeoLocation, Preferences) {


        //if(!window.localStorage.getItem('serverLocation')) {
        //TODO for testing with the proxy on the browser, need to set localhost:8100 (this app and not the other!!!)
        window.localStorage.setItem('serverLocation','http://trackme-app.herokuapp.com');//http://trackme.no-ip.net:8080
        //TODO use https https://trackme-app.herokuapp.com
        //}

        $scope.rememberMe = { checked: true, text:'Remember me' };
        $scope.keepMeLoggedin = { checked: true, text: 'Keep me Logged In' };

        $scope.loogedInInterval = { 'days' : '5' };

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

        var credentials = Preferences.loadSavedCredentials();
        if(credentials) {
            $scope.formLogin.user = credentials.username;
            $scope.loggedin_user = credentials.username;
            $scope.formLogin.pass =  credentials.password;
        }

        //for the keep me logged in stuff
        var lastLoginDate = null;

        //get user session preferences
        var userPreferences = Preferences.loadSavedUserPreferences();
        if(userPreferences) {
            $scope.rememberMe.checked = userPreferences.rememberMe;
            $scope.keepMeLoggedin.checked = userPreferences.keepMeLoggedin;
            $scope.loogedInInterval.days = userPreferences.loogedInInterval;
            //in millis
            lastLoginDate = userPreferences.lastLoginDate;
        }


        if($scope.keepMeLoggedin.checked) {
            //TODO check the expiration settings or wait for the server to say something???
            //server should handle it, we should handle the response from server (probably a 401 or 403)

            var userData = Preferences.getUserData();
            if(userData) {

                $scope.status = userData.status;
                $scope.email = userData.email;
                $scope.expires = userData.expires;
                $scope.token = userData.token;

                var now = new Date().getTime();
                //expires is in minutes so i need to convert it to milliseconds
                if( (lastLoginDate + ($scope.expires*60*1000) > now) == false ) {
                    //still valid token/session
                    //go straight to the home page
                    $state.go('app.home');
                }
                //else //already expired, proceed normally
            }

        }

        ///loads default saved tracking settings
        $scope.savedPreferences = Preferences.loadDefaultPreferences();

        //remember me option changed
        $scope.rememberMeChanged =  function() {
            if($scope.rememberMe.checked == true) {
                $scope.rememberMe.checked = false;
            }
            else {
                $scope.rememberMe.checked = true;
            }
        };

        $scope.keepMeLoggedinChanged =  function() {
            if($scope.keepMeLoggedin.checked == true) {
                $scope.keepMeLoggedin.checked = false;
            }
            else {
                $scope.keepMeLoggedin.checked = true;
            }
        };

        $scope.logout = function() {

            // Removing a cookie
            $cookies.remove('trackme_session');
            //remove the user data too (to avoid auto login next time, cause i explicitly logged out)
            Preferences.removeUserData();
            $state.go('front');
        };


        //You are defining your events from .run part of your angular application.

        //Therefore; to communicate with a controller; you need to use : - a global variable ($rootScope)
        // on your app that is watched in your controller : this is an ugly solution; that I do not recommand
        // - Broadcast / on an event in your app: this is the clean solution
        $scope.$on('app-background-foreground', function(event, background) {

            console.log('app-background-foreground ..... background? ' + background);
            if(background && !$scope.savedPreferences.backgroundTrackingEnabled) {
                alert("will try to stop tracking now");
                //stop tracking now, restart afterwards on resume
                $scope.currentTrackable  = Preferences.getPreferableTrackable();
                Preferences.stopTracking($scope.currentTrackable);
                GeoLocation.pauseTrackingLocation();
            }
            else if(!background && !$scope.savedPreferences.backgroundTrackingEnabled) {
                alert("restart tracking again");
                //restart tracking
                if(Preferences.getPreviousTrackable() && !GeoLocation.isTrackingInProgress()) {
                    GeoLocation.startTrackingLocation();
                }
            }
        });

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
                //note the expire_session is in minutes (between 1 day and 5 days max)
                data: {email: $scope.formLogin.user, password: $scope.formLogin.pass, expire_session: ($scope.loogedInInterval.days*24*60) },
                headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
            })
            //$http.post(server, $scope.formLogin)
                .success(function(data) {
                    console.log(data);

                    if (data.status) {

                        console.log('response:' + JSON.stringify(data));


                        //save user prefs for next time
                        Preferences.saveUserPreferences($scope.rememberMe.checked,
                            $scope.keepMeLoggedin.checked,
                            $scope.loogedInInterval.days,
                            new Date().getTime());

                        //to show on the account menu
                        $scope.loggedin_user = data.email;

                        // if successful, bind success message to message
                        $scope.status = data.status;
                        $scope.email = data.email;
                        $scope.expires = data.expires;
                        $scope.token = data.token;


                        if($scope.rememberMe.checked) {
                            //add to local storage
                            Preferences.saveCredentials($scope.formLogin.user,$scope.formLogin.pass);
                        }
                        else {
                            //forget it
                            if(window.localStorage.getItem('userCredentials')) {
                                window.localStorage.removeItem('userCredentials');
                            }

                        }

                        //Save user sensitive data
                        var userData = {
                            status: data.status,
                            email: data.email,
                            expires: data.expires,
                            token: data.token
                        };

                        // Put cookie
                        $cookies.put('trackme_session',userData);
                        Preferences.setUserData(userData);
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

            var userData = Preferences.getUserData();
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
                console.log("no user data available");
            }


        };

        $scope.alertImpossibleTrackWithDevice = function() {

            $ionicPopup.alert({
                title: 'Tracking Device',
                content: 'You need to add this device as a tracking device, before you can start tracking!'
            }).then(function(res) {
                console.log('ok accepted');
            });
        };

        // A confirm dialog for adding this device as a tracking device
        $scope.showConfirm = function(confirm, deny) {

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

            var currentDevice = Preferences.loadDefaultDevice();

            //default dummy stuff
            var deviceIdentifier = "My Device Id";//dummy id, just in case
            var deviceDescription = "My Device Description";
            var id = "dummy";

            //if it exists, read its data
            if(currentDevice) {
                deviceIdentifier = currentDevice.deviceId;
                deviceDescription = currentDevice.deviceDescription;
            }
            else {
                //otherwise create a new one
                //The cordova-plugin-device plugin defines a global device object,
                if(window.device) {
                    deviceIdentifier = device.uuid;
                    deviceDescription = device.name;
                }

                //save it! (will get the database id later, after success)
                Preferences.saveDefaultDevice(deviceIdentifier,deviceDescription,id);
            }

            //alert("device id/name: " + deviceIdentifier);

            //Get all the user devices and see if this one was already added
            $scope.getUserDevices( function(data) {
                var exists = false;
                //callback function for success
                //alert("callback called with data: " + JSON.stringify(data));
                for (var i = 0; i < data.length; i++) {
                    if(data[i].deviceId==deviceIdentifier) {
                        exists = true;
                        console.log("this device already exists: name " + data[i].deviceId);
                        break;
                    }
                }
                if(!exists) {


                    //------------------- SAVE DEVICE ----------------------------

                    //prompt the user to add this new device, and go to de devices page, with the device data already with default values prefilled
                    $scope.showConfirm( function() {
                            //user confirmed
                            //Preferences.saveDefaultDevice(deviceIdentifier,deviceDescription);
                            //save data for form prefill();

                            //navigate
                            $state.go('app.add_devices');
                        },
                        function () {
                            //user denied, do nothing
                            $scope.alertImpossibleTrackWithDevice();
                        });
                    //--------------------------------------------------------------
                }
                else {
                    //device already exists, start tracking on startup?
                    if($scope.savedPreferences.startupTrackingEnabled && $scope.savedPreferences.startupTrackable.name) {
                        GeoLocation.startTrackingLocation();
                    }
                    else {
                        //TODO alert the user, add/select trackable
                        //alert("do nothing!!!! " + $scope.savedPreferences.startupTrackingEnabled + " " + $scope.savedPreferences.startupTrackable.name);
                    }
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

//Another solution would have to set your event listener right in the controller
.run(function($ionicPlatform, $rootScope) {

// Wait for device API libraries to load

  $ionicPlatform.ready(function() {


      // Handle the resume event
      //
      var onResume = function() {
          console.log("app on resume (Foreground)");
          $rootScope.$broadcast('app-background-foreground',false);
      };

      var onPause = function() {
          // Handle the pause event
          console.log("app on pause (Background)");
          $rootScope.$broadcast('app-background-foreground',true);
      };

      document.addEventListener("resume", onResume, false);
      document.addEventListener("pause", onPause, false);



      // device APIs are available
      //

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
