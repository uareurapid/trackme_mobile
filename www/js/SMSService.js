/**
 * Created by paulocristo on 23/06/2017.
 */
var SMSService = angular.module('SMSService',[])
    
    .service('SMSSender', function() {

       var self = this;
       self.checkSMSPermission = function() {
            var success = function (hasPermission) {
                if (hasPermission) {
                    //sms.send(...);
                }
                else {
                    alert("no permissio");
                    // show a helpful message to explain why you need to require the permission to send a SMS
                    // read http://developer.android.com/training/permissions/requesting.html#explain for more best practices
                }
            };
            var error = function (e) {
                alert('Something went wrong:' + e);
            };
            sms.hasPermission(success, error);
        };

        //TODO how do i send the batch with SMS limitations of 160 chars?
        //the SMS api must be shorter
        self.sendSMS = function(payload) {
            var number = "938460768";
            var message = payload;
            console.log("number=" + number + ", message= " + message);

            //CONFIGURATION
            var options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                    //intent: 'INTENT'  // send SMS with the native android SMS messaging
                    intent: '' // send SMS without open any other app
                }
            };

            var success = function () {
                alert('Message sent successfully');
            };
            var error = function (e) {
                alert('Message Failed:' + e);
            };
            sms.send(number, message, options, success, error);
        };

    });