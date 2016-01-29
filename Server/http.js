var Notification = require('./notification.js');
var Avatar = require('./avatar.js');
var config = require('./config.js');
////var mytwilio = require('./twilio.js');
//var myWhatsapp = require('./LINKit_whatsapp.js');
////var Tips = require('./tips.js');
////var Couchbase = require('./couchbase.js');
////var CouchTips = require('./couch_tips.js');
////var BenisonSMS = require('./sms.js');
var Feedback = require('./feedback.js');
var Userinfo = require('./userinfo.js');
////var UserinfoCouchbase = require('./userinfo_couch.js');
var Background = require('./background.js');
var Rule = require('./rule.js');
var Wallpaper = require('./wallpaper.js');
var AndroidVM = require('./vm_feature.js');

var request = require('request');

var notify = new Notification();
var avatar = new Avatar();
////var twilio = new mytwilio();
//var whatsapp = new myWhatsapp();
////var tips = new Tips();
////var couchbase = new Couchbase();
////var couch_tips = new CouchTips();
////var sms = new BenisonSMS();
var feedback = new Feedback();
var userinfo = new Userinfo();
////var userinfoCouch = new UserinfoCouchbase();
var background = new Background();
var rule = new Rule();
var wallpaper = new Wallpaper();
var androidVM = new AndroidVM();

function HttpResponser() {
}

HttpResponser.prototype.init = function (express, dbmanager, invoker) {
    notify.init(dbmanager);
    avatar.init(dbmanager);
    ////tips.init(dbmanager);
    ////sms.init(dbmanager);
    feedback.init(dbmanager);
    userinfo.init(dbmanager, invoker);
    ////userinfoCouch.init(dbmanager, invoker);
    background.init(dbmanager, invoker);
    rule.init(dbmanager, invoker);
	wallpaper.init(dbmanager);
	
    ////express.get("/", function (req, res, next) {
    ////    if (req.subdomains == "d") {
    ////        res.redirect(config.kAPKDownloadURL);
    ////        return;
    ////    }

    ////    next();
    ////});

    ////express.post("/", function (req, res, next) {
    ////    if (req.subdomains == "d") {
    ////        res.redirect(config.kAPKDownloadURL);
    ////        return;
    ////    }

    ////    next();
    ////});

    express.get("/notify/upload", notify.upload);
    express.post("/notify/upload", notify.upload);
    express.get("/notify/query", notify.get);
    express.post("/notify/query", notify.get);

    express.get("/avatar/upload", avatar.upload);
    express.post("/avatar/upload", avatar.upload);
    express.get("/avatar/query", avatar.get);
    express.post("/avatar/query", avatar.get);

    ////express.get("/tips/publish", tips.publish);
    ////express.post("/tips/publish", tips.publish);
    ////express.get("/tips/query", tips.get);
    ////express.post("/tips/query", tips.get);

    ////express.get("/couch_tips/publish", couch_tips.publish);
    ////express.post("/couch_tips/publish", couch_tips.publish);
    ////express.get("/couch_tips/query", couch_tips.get);
    ////express.post("/couch_tips/query", couch_tips.get);

	////var couchbase_url = "http://114.215.236.240:4984/sync_gateway/";
	////express.get("/_all_docs", function(req, res) {
	////	request(couchbase_url + "_all_docs", function (error, response, body) {
	////		res.send(body);
	////	});
	////});
	
	////express.get("/couchbasedb", couchbase.getBucketInfo);
	////express.get("/_all_docs", couchbase.getBucketAllDocs);
	////express.get("/_changes", couchbase.getBucketChanges);
	////express.get("/_doc", function (req, res) {
	////    couchbase.getOneDocumentContent(req, res);
	////});
	////express.get("/_newDoc", function (req, res) {
	////    couchbase.createOneDocument(req, res);
	////});

	////express.get("/_twilio_auth", function(req, res){
	////	var clientName = req.param('name');
	////	console.log("twilio name: " + clientName);
	////	res.send(twilio.init(clientName));
	////});

	////express.get("/_twilio_voice", function(req, res){
	////	var phoneNumber = req.param('phoneNumber');
	////	console.log("phoneNumber:" + phoneNumber);
	////	res.send(twilio.voiceResponse(phoneNumber));
	////});

	////express.get("/sms/publish", sms.publish);
	////express.post("/sms/publish", sms.publish);
	////express.get("/sms/query", sms.get);
	////express.post("/sms/query", sms.get);
	////express.get("/sms/change", sms.change);
	////express.post("/sms/change", sms.change);
	////express.get("/sms/delete", sms.delete);
	////express.post("/sms/delete", sms.delete);

	express.get("/feedback/publish", feedback.publish);
	express.post("/feedback/publish", feedback.publish);
	express.get("/feedback/query", feedback.get);
	express.post("/feedback/query", feedback.get);

	express.get("/login", userinfo.login);
	express.post("/login", userinfo.login);
	express.get("/login/qq", userinfo.qqLogin);
	express.post("/login/qq", userinfo.qqLogin);

	////express.get("/usr/login", userinfoCouch.login);
	////express.post("/usr/login", userinfoCouch.login);
	////express.get("/usr/query", userinfoCouch.get);
	////express.post("/usr/query", userinfoCouch.get);

	////express.get("/verify", userinfoCouch.verify);
	////express.post("/verify", userinfoCouch.verify);
	////express.get("/lenovo/verify", userinfoCouch.verify);
	////express.post("/lenovo/verify", userinfoCouch.verify);

	express.get("/online", background.getOnlinePeople);
	express.post("/online", background.getOnlinePeople);

	express.get("/rule", rule.get);
	express.post("/rule", rule.get);
	express.get("/rule/update", rule.update);
	express.post("/rule/update", rule.update);

	express.get("/wallpaper/upload", wallpaper.upload);
	express.post("/wallpaper/upload", wallpaper.upload);
	express.get("/wallpaper/query", wallpaper.get);
	express.post("/wallpaper/query", wallpaper.get);

	express.get("/preload", androidVM.getAPPList);

	//express.get("/_whatsapp_connect", function(req, res){
	//	var phoneNumber = req.param('phonenumber');
	//	console.log(phoneNumber + "connect to whatsapp");
	//	whatsapp.connect(phoneNumber);
	//});

	//express.get("/_whatsapp_disconnect", function(req, res){
	//	var phoneNumber = req.param('phonenumber');
	//	console.log("disconnect whatsapp");
	//	whatsapp.disconnect(phoneNumber);
	//});

	//express.get("/_whatsapp_online", function(req, res){
	//	console.log("whatsapp online");
	//	var phoneNumber = req.param('phonenumber');
	//	whatsapp.OnLine(phoneNumber);
	//});

	//express.get("/_whatsapp_offLine", function(req, res){
	//	console.log("whatsapp offLine");
	//	var phoneNumber = req.param('phonenumber');
	//	whatsapp.OffLine(phoneNumber);
	//});

	//express.get("/_whatsapp_send", function(req, res){
	//	var from = req.param('from');
	//	var to = req.param('to');
	//	var message = req.param('message');
	//	console.log("whatsapp send to:" + to + "  message:"+ message + "  from:" + from);
	//	whatsapp.sendMessage(from,to, message);
	//});
}

HttpResponser.prototype.getUserStatistics = function (info, callback) {
    userinfo.getUserStatistics(info, callback);
}

module.exports = HttpResponser;
