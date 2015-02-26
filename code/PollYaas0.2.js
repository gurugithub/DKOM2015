var https = require('https');
var autonomy = require('..');
var mission  = autonomy.createMission();
var arDroneConstants = require('ar-drone/lib/constants');
var fs = require('fs');
var path = require('path');
var df = require('dateformat'),
    arDrone = require('ar-drone');

var exiting = false;
process.on('SIGINT', function () {
    if (exiting) {
        process.exit(0);
    } else {
        console.log('Got SIGINT. Landing, press Control-C again to force exit.');
        exiting = true;
        mission.control().disable();
        mission.client().land(function () {
            process.exit(0);
        });
    }
});

function yaasWorkItem(){
	var optionsget = {
    host : 'c4cdkom-demo.cf3.hybris.com', 
    port : 443,
    path : '/workitems', 
    method : 'GET', 
	headers : {'hybris-tenant':'test','hybris-app':'test'},
	rejectUnauthorized: false
	};
 
	console.info('\nConnecting to Yaas using: ');
	console.info(optionsget);
	console.info('\nPolling for Flight Plan');
 
	var reqGet = https.request(optionsget, function(res) {
		console.log("\nPolling Response Status Code: ", res.statusCode);
 
		res.on('data', function(d) {       
        process.stdout.write(d);
		//if( d === null || d === "null" || d.length < 3 ){
           
			console.info('\n No Flight Plan Scheduled)');
		//}
		//else{
			
			console.info('\n**** Flight Plan Available ***');
			console.info('\nSend Flight Plan to Drone');	
			mission.takeoff()
					.zero()       // Sets the current state as the reference
					.altitude(1)  // Climb to altitude = 1 meter
					.hover(5000)  // Hover in place for 5 second   
					.land();

			mission.run(function (err, result) {
				if (err) {
					console.trace("\nOops, something bad happened: %s", err.message);
					mission.client().stop();
					mission.client().land();
				} else {
					console.log("\n**** Mission success! ****");
					process.exit(0);
				}
			});
		//}
        console.info('\n\nPolling cycle completed');
		});
 
	});
 
	reqGet.end();
	reqGet.on('error', function(e) {
		console.error(e);
	});

	setTimeout(function() { yaasWorkItem() }, 5000);
};

yaasWorkItem();

