var formidable = require('formidable');
var Couchbase = require('./couchbase.js');
var request = require('request');
var config = require('./config.js');

var maxTipsID = 1;
var dbmanager = null;
var couchbase = new Couchbase();

function CouchTips() {
}

CouchTips.prototype.init = function (dbm) {
    dbmanager = dbm;
}

CouchTips.prototype.publish = function (req, res) {

    var chinese = req.param('chinese');
    var english = req.param('english');
    var type = req.param('type');

    if (!chinese && !english) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var result = {};
            if (!fields.chinese && !fields.english) {
                return sendResult(res);
            }
            
            storeTipsInfo(fields.chinese, fields.english, fields.type ? 0 : 1);
        });

        return;
    }

    if (!chinese || !english) {
        return sendResult(res);
    }

    storeTipsInfo(chinese, english, type ? 0 : 1);
}

CouchTips.prototype.get = function (req, res) {
    var index = req.param('index');
    if (!index)
        index = 0;
    else
        index = Number(index);

    getTips(index, res, sendResult);
}

function storeTipsInfo(chinese, english, type) {

    var packet = {};
    packet.cmd = "kNewTips";
    packet.data = {};
    packet.data.tips = {};
    packet.data.type = type;
    packet.data.tips.en = english;
    packet.data.tips.cn = chinese;

    if (type == 1) {
        storeNewTips(packet);
    } else {
        storeUETips(packet);
    }
}

function storeNewTips(pkg) {
    var packet = {};
    packet.channels = "tips";
    packet.pkg = pkg;

    var data = JSON.stringify(packet);

    var doc_id = "new777tips777id";
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

        maxTipsID++;

        if (result.error) {
            couchbase.createDocument(data, doc_id);
            return;
        }

        couchbase.createDocument(data, doc_id, result._rev);
    });
}

function storeUETips(pkg) {
    var packet = {};
    packet.channels = "uetips";
    packet.pkg = [];


    var doc_id = "ue222tips222id";
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
            packet.pkg.push(pkg);
            var data = JSON.stringify(packet);
            couchbase.createDocument(data, doc_id);
            return;
        }

        packet.pkg = result.pkg;
        packet.pkg.push(pkg);
        var data = JSON.stringify(packet);

        couchbase.createDocument(data, doc_id, result._rev);
    });
}

function getTips(index, res, callback) {
    
    if (index >= maxTipsID) {
        sendResult(res);
        return;
    }

    var url = config.kCouchbaseViewURL;
    if (index == 0) {
        url += "_design/uetips/_view/uetips";
    } else {
        url += "_design/tips/_view/tips";
    }

    request(url, function (error, response, body) {

        var result = {};
        try {
            result = JSON.parse(body);
        } catch (e) {
            console.log("get tips failed");
            sendResult(res);
            return;
        }

        if (result.error) {
            console.log("get tips failed: " + body);
            sendResult(res);
            return;
        }

        if (result.rows && result.rows.length > 0) {

            var pkt = result.rows[0].key;
            if (index == 0) {
                var idx = Math.floor(Math.random() * pkt.length);

                var pkg = pkt[idx];
                pkg.data.index = maxTipsID;
                pkt = pkg;
            } else {
                pkt.data.index = maxTipsID;
            }

            var str = JSON.stringify(pkt);
            res.send(str);
        } else {
            console.log("get tips failed: empty");
            sendResult(res);
        }
    });
}

function sendResult(res, text, index) {
    var result = {};

    result.cmd = "kNewTips";
    result.data = {};
    try {
        if (text) {
            result.data.index = index;
            result.data.tips = JSON.parse(text);
        }
    } catch (e) {
        result.cmd = "kInvalidTips";
    }

    res.send(JSON.stringify(result));
}

module.exports = CouchTips;
