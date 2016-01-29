var formidable = require('formidable');

var dbmanager = null;
var kCmdSucceeded = "kBenisonSMS";
var kCmdFailed = "kFailed";

function BenisonSMS() {
}

BenisonSMS.prototype.init = function (dbm) {
    dbmanager = dbm;

    var sql = 'CREATE TABLE IF NOT EXISTS nanao.sms (\
        smsID int(11) NOT NULL AUTO_INCREMENT,\
        content VARCHAR(256) NOT NULL,\
        type int(11), \
        time VARCHAR(32),\
        forward int(11), \
        lang VARCHAR(32), \
        PRIMARY KEY (smsID)\
    );';

    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Create sms DB failed: " + err);
        } else {
        }
    });
}

BenisonSMS.prototype.publish = function (req, res) {

    var content = req.param('content');
    var type = req.param('type');
    var lang = req.param('lang');

    if (!content) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var result = {};
            if (!fields.content) {
                return sendResult(res, kCmdFailed);
            }
            
            storeSMSInfo(res, fields.content, fields.lang ? fields.lang : 'cn', fields.type ? Number(fields.type) : 0);
        });

        return;
    }

    storeSMSInfo(res, content, lang ? lang : 'cn', type ? Number(type) : 0);
}

BenisonSMS.prototype.get = function (req, res) {
    var index = req.param('index');
    var count = req.param('count');
    var lang = req.param('lang');
    if (!index)
        index = 0;

    if (!count || Number(count) == 0)
        count = 100;

    if (!lang)
        lang = 'cn';

    getSMS(index, count, lang, res, sendResult);
}

BenisonSMS.prototype.change = function (req, res) {
    var id = req.param('id');
    if (!id)
        return;

    var sql = "update nanao.sms set forward=forward+1 where smsID=" + id;
    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("update forward info failed: " + err);
            sendResult(res, kCmdFailed);
        } else {
            sendResult(res, kCmdSucceeded);
        }
    });
}

BenisonSMS.prototype.delete = function (req, res) {
    var id = req.param('id');
    if (!id) {
        sendResult(res, kCmdFailed);
        return;
    }

    var sql = "delete from nanao.sms where smsID=" + id;
    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("delete sms failed: " + err);
            sendResult(res, kCmdFailed);
        } else {
            sendResult(res, kCmdSucceeded);
        }
    });
}

function storeSMSInfo(res, content, lang, type) {

    if (!content || content.length == 0)
        return;

    var sql = "insert into nanao.sms(content, type, time, forward, lang) values('" + content + "'," + type + ", NOW(), 0, '" + lang + "')";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err && err.code != "ER_DUP_ENTRY") {
            console.log("Store tips info failed: " + err);
            sendResult(res, kCmdFailed);
        } else {
            sendResult(res, kCmdSucceeded);
        }
    });
}

function getSMS(index, count, lang, res, callback) {

    var cnt = "(select count(*) from nanao.sms where lang='" + lang + "') as cnt";
    var sql = "select smsID, content, forward, " + cnt + " from nanao.sms where lang='" + lang + "' order by forward desc" + " limit " + index + "," + count;

    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Select sms failed: " + err);

            callback(res, kCmdFailed);
            return;
        }

        if (!rows || rows.length == 0 || !rows[0].content) {
            callback(res, kCmdFailed);
            return;
        }

        var count = rows[0].cnt;
        var contents = [];
        for (var i in rows) {
            var content = {};
            content.id = rows[i].smsID;
            content.content = rows[i].content;
            content.forward = rows[i].forward;

            contents.push(content);
        }

        callback(res, kCmdSucceeded, contents, count);
    });
}

function sendResult(res, cmd, contents, count) {
    var result = {};

    result.cmd = cmd;
    result.data = {};
    try {
        if (contents) {
            result.data.count = count;
            result.data.sms = contents;
        }
    } catch (e) {
        result.cmd = kCmdFailed;
    }

    res.send(JSON.stringify(result));
}

module.exports = BenisonSMS;
