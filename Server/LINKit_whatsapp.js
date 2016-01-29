var common = require('whatsapi');
var events = require('events');
var util = require('util');

function WhatappManager(){
	this.waArray = [];
};

WhatappManager.prototype.connect = function(phonenumber){

	var config = {
		msisdn         : phonenumber,
		device_id      : '',
		username       : 'Elvis',
		password       : 'tYr4uLOUEm3vdggqePwX3PfWm3E=',
		ccode          : '86',
		reconnect      : true,
		host           : 'c.whatsapp.net',
		server         : 's.whatsapp.net',
		gserver        : 'g.us',
		port           : 5222,
		device_type    : 'Android',
		app_version    : '2.11.489',
		ua             : 'WhatsApp/2.11.489 Android/4.4.4 Device/MI 4W',
		challenge_file : __dirname + '/challenge'
	}
	var wa = new common.createAdapter(config, false);
	util.inherits(wa, events.EventEmitter);

	wa.connect(); 

	//Wait for connection event and the login to WA Server
	wa.on('connect', function(){
		console.log("Connected to WA Server");
		wa.login(); 
	});
	wa.on('disconnect', function(){
		console.log("disconnect to WA Server");
	});

	//Send online to WA server
	wa.on('login',function(){
		console.log ('Logged in to WA server');
		wa.sendIsOnline(); //You will be online now
	});//Logs all the error 
	
	wa.on('error', function(err){
		console.log('error:' + err);
	});

	//Logs connectivity related errors
	wa.on('connectError', function(err){
		console.log("CE: "+err);
	});
	
	wa.on('message.delivered', function(from, id, t){
		console.log("Message received by:"+from);
   //wa.disconnect();  //WA server connection will be disconnected
	});

	//Receive typing status
	wa.on('typing', function(from, tag){
		console.log(from+"-"+tag);
	}); 

	//Event to receive and log messages
	wa.on('message', function(from, id, name, body, author){
	   console.log("Message: "+body+" From: "+from+" Name: "+name);
	});
	wa.on('receivedMessage', function(from, id, name, body, author){
	   console.log("Message: "+body+" From: "+from+" Name: "+name);
	});

	var waExist = this.getWa(phonenumber);
	if(waExist){
		waExist = wa;
	} else {
		this.waArray.push({'phonenumber':phonenumber, 'wa':wa});
	}
}

WhatappManager.prototype.disconnect = function(phonenumber){
	var wa = this.getWa(phonenumber);
	if(wa){
		wa.disconnect();
		wa = null;
	}
}

WhatappManager.prototype.OnLine = function(phonenumber){
	var wa = this.getWa(phonenumber);
	if(wa){
		wa.sendIsOnline();
	} else {
		console.log("wa is null");
	}
}

WhatappManager.prototype.OffLine = function(phonenumber){
	var wa = this.getWa(phonenumber);
	if(wa){
		wa.sendIsOffline()
	} else {
		console.log("wa is null");
	}
}

WhatappManager.prototype.sendMessage = function(from, to, message){
	var wa = this.getWa(from);
	if(wa){
		wa.sendMessage(to, message);
	} else {
		console.log("wa is null");
	}
}

WhatappManager.prototype.getWa = function(phonenumber){
	for(var i=0; i<this.waArray.length; i++){
		if(this.waArray[i].phonenumber == phonenumber){
			return this.waArray[i].wa;
		}
	}
	return null;
}

module.exports = WhatappManager;