var twilio = require('twilio');

function LinkitTwilio(){

};

LinkitTwilio.prototype.init = function(clientName, expireTime){
    var ACCOUNT_SID = 'ACea8da858e2c601ab58783dafeb9844a4';
    var AUTH_TOKEN = '6dbc06dd6ea38e5ba98cabf93c78cd88';
    var appSid = "AP77557ca56a073ca8fe98b69ab4e10a27";

    var capability = new twilio.Capability(ACCOUNT_SID, AUTH_TOKEN);
    capability.allowClientOutgoing(appSid);

    if(clientName)
        capability.allowClientIncoming(clientName);
    var token = capability.generate();
	
    return token;
};

LinkitTwilio.prototype.voiceResponse = function(phoneNumber){
	var resp = new twilio.TwimlResponse();
	/* Use this as the caller ID when making calls from a browser. */
	var callerId = "+12019031697";

	resp.say('Welcome to Lenovo Link it.', {
        voice:'woman',
        language:'en-gb'
    });
	if(!isNaN(phoneNumber)){
		resp.dial(phoneNumber, 
		{
			action:'/forward?Dial=true',
			callerId:callerId
		});
	} else {
		resp.dial(
		{
			action:'/forward?Dial=true',
			callerId:callerId
		}, function(node){
			node.client(phoneNumber)
		});
	}
	return resp.toString();
};

module.exports = LinkitTwilio;