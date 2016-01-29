var formidable = require('formidable');
var Couchbase = require('./couchbase.js');
var request = require('request');
var config = require('./config.js');
var constants = require('./constants.js');

var QueryString = require('querystring');
var XMLParser = require('xmldom').DOMParser;
var XPath = require('xpath.js');

var dbmanager = null;
var invoker = null;
var couchbase = new Couchbase();

var kCmdFailed = "kFailed";
var kCmdSucceeded = "kSucceeded";
var kCmdInvalidParam = "kInvalidParam";

var lenovo_url = "https://uss.lenovomm.com/interserver/authen/1.2/getaccountid";

function UserinfoCouchbase() {
}

UserinfoCouchbase.prototype.init = function (dbm, invkr) {
    dbmanager = dbm;
    invoker = invkr;
}

UserinfoCouchbase.prototype.login = function (req, res) {

    var uid = req.param('uid');
    var usr = req.param('usr');
    var key = req.param('key');
    var token = req.param('token');

    if (!uid) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (!fields.uid) {
                return loginUseLenovoID(res);
            }

            if (!fields.key && !fields.token) {
                return sendResult(res, kCmdInvalidParam);
            }
            
            if (!fields.key) {
                storeUserinfo(fields.uid, fields.usr, fields.token);
            } else {
                verifyUserinfo(fields.uid, fields.usr, fields.key);
            }
        });

        return;
    }

    if (!key && !token) {
        return sendResult(res, kCmdInvalidParam);
    }

    if (!key) {
        storeUserinfo(uid, usr, token);
    } else {
        verifyUserinfo(uid, usr, key);
    }
}

UserinfoCouchbase.prototype.get = function (req, res) {
    getUserinfo(res);
}

UserinfoCouchbase.prototype.verify = function (req, res) {
    var wust = req.param("lenovoid.wust");
    var data = {};
    data.lpsust = wust ;
    data.realm = "www.thelinkit.com" ;
	
    data = QueryString.stringify(data);
    var url = "linkit.html";

    request(lenovo_url + "?" + data, function (err, response) {
        try {
            if (!err) {
                var doc = new XMLParser().parseFromString(response.body);
                
                var nodes = XPath(doc, "//AccountID");
                var uid = nodes[0].firstChild.data;
                if (uid != null) {
                    nodes = XPath(doc, "//Username");
                    var username = nodes[0].firstChild.data;

                    nodes = XPath(doc, "//verified");
                    var verified = nodes[0].firstChild.data;

                    res.setHeader("Set-Cookie", ['uid=' + uid, 'username=' + username, 'verified=' + verified, 'lenovoid.wust=' + wust]);
                    res.redirect(url);

                    invoker.onLogin(uid, username, wust, constants.kTypeWebside);
                } 
            }
        } catch (e) {
            console.log("Userinfo.verify exception: " + e);
            res.redirect(url);
        }
    });
}

function storeUserinfo(uid, usr, token) {
    var packet = {};
    packet.channels = "usr";
    packet.usr = {};
    packet.usr.uid = uid;
    packet.usr.name = usr;
    packet.usr.token = token;

    var data = JSON.stringify(packet);
    
    invoker.onLogin(uid, usr, token, constants.kTypeAndroid);

    var doc_id = uid;
    couchbase.getDocument(doc_id, function (body) {
        if (!body) {
            console.log("get document failed.");
            return;
        }

        var result = {};
        try {
            result = JSON.parse(body);
        } catch (e) {
            console.log("get document failed, invalid json data: " + body);
            return;
        }
        
        if (result.error) {
            couchbase.createDocument(data, doc_id);
            return;
        }

        couchbase.createDocument(data, doc_id, result._rev);
    });
}

function verifyUserinfo(uid, usr, key) {
}

function getUserinfo(res) {
    
    var url = config.kCouchbaseViewURL;
    url += "_design/userinfo/_view/userinfo";

    request(url, function (error, response, body) {

        var result = {};
        try {
            result = JSON.parse(body);
        } catch (e) {
            console.log("get tips failed");
            sendResult(res, kCmdFailed);
            return;
        }

        if (result.error) {
            console.log("get tips failed: " + body);
            sendResult(res, kCmdFailed);
            return;
        }
        
        if (result.rows && result.rows.length > 0) {

            var values = [];
            for (var i in result.rows) {
                values.push(result.rows[i].value);
            }

            var str = JSON.stringify(values);
            res.send(str);
        } else {
            console.log("get tips failed: empty");
            sendResult(res, kCmdFailed);
        }
    });
}

function sendResult(res, cmd) {
    var result = {};

    result.cmd = cmd ? kCmdFailed : cmd;
    result.data = {};
    try {
    } catch (e) {
        result.cmd = kCmdFailed;
    }

    res.send(JSON.stringify(result));
}

function loginUseLenovoID(res) {
    var url = "https://passport.lenovo.com/wauthen/login";
    url += "?lenovoid.action=uilogin";
    url += "&lenovoid.realm=www.thelinkit.com";
    url += "lenovoid.uinfo=username";
    url += "&lenovoid.ctx=";
    url += "&lenovoid.cb=http://127.0.0.1/lenovo/verify";

    res.redirect(url);
}

module.exports = UserinfoCouchbase;
