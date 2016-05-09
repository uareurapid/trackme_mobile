angular.module('starter.DeviceUtils', [])

.factory('Device', function(){

        return {

            Hello: function(){
                return "Hello World!";
            },

            init: function() {
                var self = this;
                this.isPhoneGap = typeof cordova !== 'undefined';
                this.isAndroid = $.os.android;
                this.isAndroid2 = this.isAndroid2Fn();
                this.isIOS = this.isiOS = $.os.ios;
                this.isKindleFire = this.isKindleFireFn();
                this.isAmazon = false;

                if(this.isKindleFire) {
                    self.isAmazon = true;
                }

                if(this.isIOS) {
                    this.isIOS7orSuperiorVersion = (this.iOSversion() >= 7);
                    this.isIOS8 = (this.iOSversion() == 8);
                    this.isIOS8orSuperiorVersion = (this.iOSversion() >= 8);
                    this.isIOS9orSuperiorVersion = (this.iOSversion() >=9);
                }


                if(!this.isIOS && !this.isAndroid) {
                    this.isWeb = true;
                }
                else {
                    this.isWeb = false;
                }

                if (this.isPhoneGap) {
                    this.deviceModel = device.model;
                }

                if (typeof window.isWeb !== 'undefined' && window.isWeb === true) {
                    // True if app running inside the platform iframe
                    this.isWebPlatform = true;
                } else {
                    this.isWebPlatform = false;
                }
                self.appendDeviceToBody();
            },

            isCachedImagesEnabled: function() {
                return (!this.isWebPlatform);
            },

            isPhoneGapEnv: function() {
                // works also in the case that init() is not called yet
                return (typeof cordova !== 'undefined');
            },

            isAndroid2Fn: function() {
                var isAndroid2 = false;
                if($.os.android) {
                    var ua=navigator.userAgent.toLowerCase();
                    var androidversion = parseFloat(ua.toLowerCase().slice(ua.indexOf("android")+8));
                    if(androidversion < 4) {
                        isAndroid2 = true;
                    }
                }

                return isAndroid2;
            },

            isAndroid4dot0: function() {
                var isAndroid4dot0 = false;
                if($.os.android) {
                    var androidversion = navigator.userAgent.match(/Android [\d+\.]{3,5}/)[0].replace('Android ','');
                    if(androidversion.indexOf("4.0") === 0) {
                        isAndroid4dot0 = true;
                    }
                }

                return isAndroid4dot0;
            },

            iOSversion : function() {
                if(!this.isIOS) {
                    return 0;
                }

                var match = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                if (match) {
                    var version = [
                        parseInt(match[1], 10),
                        parseInt(match[2], 10),
                        parseInt(match[3] || 0, 10)
                    ];

                    return parseFloat(version.join('.'));
                } else {
                    return 8.0;
                }
            },

            isKindleFireFn : function(){
                if(navigator.userAgent.indexOf('Kindle') > -1 ||
                    navigator.userAgent.indexOf('KFOT') > -1 ||
                    navigator.userAgent.indexOf('KFTT') > -1 ||
                    navigator.userAgent.indexOf('KFSOW') > -1 ||
                    navigator.userAgent.indexOf('KFTHW') > -1 ||
                    navigator.userAgent.indexOf('KFAPW') > -1) {
                    return true;
                }
                else {
                    return false;
                }
            },

            isAmazon: function(callback) {
                //If AmazonAppStore installed on android device, we consider it's an amazon device
                // if(window.plugins && window.plugins.isAppInstalled) {
                //     plugins.isAppInstalled.packageName("com.amazon.venezia",function(result) {
                //         if(result ==  "true") {
                //             callback(true);
                //         }
                //         else {
                //             callback(false);
                //         }
                //     });

                // }
                // else {
                //     callback(false);
                // }
            },

            isAndroidChrome: function() {
                //check if is web version on android device
                var isAndroidWeb = false;
                if (!Device.isPhoneGap) {

                    var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
                    if (!app && (navigator.userAgent.toLowerCase().match(/android/i))) {
                        //go to next step and hide this one
                        isAndroidWeb = true;
                    }
                }
                return isAndroidWeb;
            },

            isTouchDevice: function() {
                // from: http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
                return !!('ontouchstart' in window);
            },

            isOnline: function() {
                if (this.isPhoneGap) {
                    return (navigator.connection.type != Connection.NONE);
                }
                else {
                    return navigator.onLine;
                }
            },

            isVolumeSliderEnabled: function() {
                return (this.isPhoneGap && this.isIOS);
            },

            isSoundSynthesisAvailableForThisLang: function(lang, callback) {

                if(Device.isAndroid && Device.isPhoneGap) {
                    //Need to check if installed
                    speechSynthesis.isLanguageAvailable(lang,function(result) {
                        if(result == "true") {
                            callback(true);
                        }
                        else {
                            callback(false);
                        }
                    });
                }
                else if(Device.isIOS7orSuperiorVersion) {
                    //Always installed
                    callback(true);
                }
                else if(Device.isWeb) {
                    var speechSynthesisBrowserSupport = ('speechSynthesis' in window);
                    if (speechSynthesisBrowserSupport) {
                        window.speechSynthesis.onvoiceschanged = function() {
                            var voiceForLangFound = false;
                            $(window.speechSynthesis.getVoices()).each(function(index, voice) {
                                // comparing language (f.e. de) with the language of the voice (f.e. de-DE)
                                if (voice.lang && voice.lang.indexOf(lang) > -1) {
                                    voiceForLangFound = true;
                                }
                            });
                            callback(voiceForLangFound);
                        };
                    } else {
                        // No support for speech synthesis in browser tous court.
                        callback(false);
                    }
                }
                else {
                    callback(false);
                }

            },

            platformSpecificInit:function() {

            },

            isShowFooterMenu: function() {
                // in previous versions, we didn't show the footer menu
                // for android. Now it's enabled everywhere.
                return true;
            },

            isIPad: function() {
                return  (!this.isWebPlatform && navigator.userAgent.match(/iPad/i))  == "iPad";
            },

            isIPhone: function() {
                return  (!this.isWebPlatform && navigator.userAgent.match(/iPhone/i))  == "iPhone";
            },


            /**
             * Returns the width of the document, taking into account the screen orientation.
             */
            getDeviceWidth: function() {
                var minSide = Math.min($(document).width(), $(document).height());
                var maxSide = Math.max($(document).width(), $(document).height());
                var ORIENTATION = {
                    PORTRAIT: 0,
                    LANDSCAPE: 1
                };
                var currentOrientation;
                if (this.isAndroid) {
                    //window.orientation is different for iOS and Android
                    if (window.orientation == 0 || window.orientation == 180) currentOrientation = ORIENTATION.LANDSCAPE;
                    else if (window.orientation == 90 || window.orientation == -90) currentOrientation = ORIENTATION.PORTRAIT;
                }
                else {
                    if (window.orientation == 90 || window.orientation == -90) currentOrientation = ORIENTATION.LANDSCAPE;
                    else if (window.orientation == 0 || window.orientation == 180) currentOrientation = ORIENTATION.PORTRAIT;
                }
                return (currentOrientation === ORIENTATION.PORTRAIT ? minSide : maxSide);
            },

            appendDeviceToBody : function() {
                var device = "web";
                if(this.isAndroid) {
                    device = "android";
                }
                else if(this.isIOS) {
                    device = "ios";
                    if(this.isIOS7orSuperiorVersion) {
                        device = "ios ios7andSuperiorVersion";
                    }
                    if(this.isIOS8orSuperiorVersion) {
                        //keep all version
                        device = "ios ios7andSuperiorVersion ios8andSuperiorVersion";
                    }
                }

                $("body").addClass(device);

                if(this.isKindleFire)  {
                    $("body").addClass("kindle");
                }

            }
        }
    });

