// Ionic Starter App


// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('trackme', ['ionic','trackme.DeviceUtils','trackme.DevicesController',
    'trackme.TrackablesController','trackme.MapController'])


    .controller('MainController', function($scope, $http, $state, $ionicSideMenuDelegate) {

        if(!window.localStorage.getItem('serverLocation')) {
            window.localStorage.setItem('serverLocation','http://localhost:8100');
        }

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
                        console.log("navigate to home page");
                        //$state.go('devices');
                        $state.go('app.home');

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
                        //$state.go('devices');

                        $state.go('app');
                        //TODO use this https://medium.com/@petehouston/awesome-local-storage-for-ionic-with-ngstorage-c11c0284d658#.ndfefslhq

                    }

                    //http://blog.ionic.io/handling-cors-issues-in-ionic/
                    //http://stackoverflow.com/questions/24710503/how-do-i-post-urlencoded-form-data-with-http-in-angularjs

                });
        };

    })

    .controller("HomeController", function($scope) {

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



            /*.state('app.home', {
                url: "/home",
                views: {
                    'appContent' :{
                        templateUrl: "home.html",
                        controller : "HomeController"
                    }
                }
            });*/

        /*

         //this state has no parent, so it uses 'index.html' as its template. The index page has no
         //sidemenu in it
         .state('page2', {
         url: "/page2",
         templateUrl: "templates/page2.html"
         }
         })
         */




        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/front');



    })

.run(function($ionicPlatform, Device) {



  $ionicPlatform.ready(function() {

      console.log(Device.Hello());

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
