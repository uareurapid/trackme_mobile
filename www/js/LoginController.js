/**
 * Created by paulocristo on 17/11/2017.
 */

/**
 * Created by paulocristo on 31/10/15.
 */

//login controller

angular.module('trackme.LoginController',['trackme.MapController','ionic','ionic-material','PreferencesService','GeoLocationService'])

    .controller('LoginController',function ($scope, $state, $cookies, $http, $ionicPopover, $ionicSideMenuDelegate, Preferences, GeoLocation) {

        var serverLocation = window.localStorage.getItem('serverLocation');
        //store the main object on the scope
        $scope.formLogin = {};

        $scope.rememberMe = { checked: true, text:'Remember me' };
        $scope.keepMeLoggedin = { checked: true, text: 'Keep me Logged In' };
        $scope.loogedInInterval = { 'days' : '5' };

        var userData = Preferences.getUserData();
        if(userData) {
            $scope.loggedin_user = userData.email;
        }

        var serverLogin = serverLocation +"/rlogin";//http://trackme.no-ip.net
        var serverSignup = serverLocation + "/rsignup";//http://trackme.no-ip.net


        //SIGNUP FORM
        $scope.formSignup = {

            email : "",
            password : "",
            retypePassword: ""
        };



        ///loads default saved tracking settings
        $scope.savedPreferences = Preferences.loadDefaultPreferences();


        var emptyLoginFields = function() {

            $scope.formLogin.user = "";
            $scope.formLogin.pass =  "";
        };
        //get user session preferences
        var userPreferences = Preferences.loadSavedUserPreferences();
        if(userPreferences) {

            $scope.rememberMe.checked = userPreferences.rememberMe;
            $scope.keepMeLoggedin.checked = userPreferences.keepMeLoggedin;
            $scope.loogedInInterval.days = userPreferences.loogedInInterval;
            //in millis


            if($scope.rememberMe.checked) {
                var credentials = Preferences.loadSavedCredentials();
                if(credentials) {
                    $scope.formLogin.user = credentials.username;
                    $scope.loggedin_user = credentials.username;
                    $scope.formLogin.pass =  credentials.password;
                }
            }
            else {
                emptyLoginFields();
            }
        }
        else {
            emptyLoginFields();
        }

        //remember me option changed
        $scope.rememberMeChanged =  function() {
            //this is just an event called, the value was already changed
            //if(userPreferences) {
            //  userPreferences.rememberMe = $scope.rememberMe.checked;
            //    window.localStorage.setItem('userPreferences',JSON.stringify(userPreferences));
            //}
        };

        $scope.keepMeLoggedinChanged =  function() {
            //this is just an event called, the value was already changed
            //if(userPreferences) {
            //    userPreferences.keepMeLoggedin = $scope.keepMeLoggedin.checked;
            //    window.localStorage.setItem('userPreferences',JSON.stringify(userPreferences));
            //}
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






                        $scope.loadDefaultDevice();

                        //start tracking right away
                        if($scope.savedPreferences.startupTrackingEnabled && $scope.savedPreferences.startupTrackable.name) {
                            GeoLocation.startTrackingLocation();
                        }



                        //TODO use this https://medium.com/@petehouston/awesome-local-storage-for-ionic-with-ngstorage-c11c0284d658#.ndfefslhq

                    }

                    //http://blog.ionic.io/handling-cors-issues-in-ionic/
                    //http://stackoverflow.com/questions/24710503/how-do-i-post-urlencoded-form-data-with-http-in-angularjs

                });
        };

        // process the form
        $scope.performSignup = function() {

            if($scope.checkPasswordsMatch() ) {
                $http({
                    method  : 'POST',
                    url     : serverSignup,
                    transformRequest: function(obj) {
                        var str = [];
                        for(var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    },
                    data: {email: $scope.formSignup.email, password: $scope.formSignup.password},
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

                            $state.go('app.home');
                            //TODO use this https://medium.com/@petehouston/awesome-local-storage-for-ionic-with-ngstorage-c11c0284d658#.ndfefslhq

                        }

                        //http://blog.ionic.io/handling-cors-issues-in-ionic/
                        //http://stackoverflow.com/questions/24710503/how-do-i-post-urlencoded-form-data-with-http-in-angularjs

                    })
                    .error(function(data) {
                        console.log('Signup Error: ' + JSON.stringify(data));
                    });
            }
            else {
                alert("the email is not valid or the passwords do not match!");
            }




        };

        //validates the email
        var validateEmail = function (email) {

            var exp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if( exp.test(email) === false ) {
                return false;
            }
            return true;
        };

        $scope.checkPasswordsMatch = function() {

            alert("checkPasswordsMatch");
            //TODO validate email
            var ok = validateEmail($scope.formSignup.email) && $scope.formSignup.password === $scope.formSignup.retypePassword &&
                $scope.formSignup.password.length > 6; //min 6 characters
            alert("check match" + ok);
            return ok;
        };
});