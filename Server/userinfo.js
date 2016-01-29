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

var kCmdFailed = "kFailed";
var kCmdSucceeded = "kSucceeded";
var kCmdInvalidParam = "kInvalidParam";

var lenovo_url = "https://uss.lenovomm.com/interserver/authen/1.2/getaccountid";

function Userinfo() {
}

Userinfo.prototype.init = function (dbm, invkr) {
    dbmanager = dbm;
    invoker = invkr;

    var sql = 'CREATE TABLE IF NOT EXISTS nanao.userinfo (\
        username VARCHAR(128) NOT NULL,\
        uid VARCHAR(64),\
        time VARCHAR(32),\
        PRIMARY KEY (username)\
    );';

    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Create userinfo DB failed: " + err);
        } else {
        }
    });
}

Userinfo.prototype.login = function (req, res) {

    var uid = req.param('uid');
    var usr = req.param('usr');
    var key = req.param('key');     // 用于验证

    if (!uid) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (!fields.uid) {
                return loginUseLenovoID(res);
            }

            if (!fields.uid && !fields.usr) {
                return sendResult(res, kCmdInvalidParam);
            }
            
            if (!fields.key) {
                storeUserinfo(res, fields.uid, fields.usr);
            } else {
                verifyUserinfo(res, fields.usr, fields.key, fields.uid);
            }
        });

        return;
    }

    if (!uid && !usr) {
        return sendResult(res, kCmdInvalidParam);
    }

    if (!key) {
        storeUserinfo(res, uid, usr);
    } else {
        verifyUserinfo(res, usr, key, uid);
    }
}

Userinfo.prototype.get = function (req, res) {
    getUserinfo(res);
}

Userinfo.prototype.verify = function (req, res) {

}

Userinfo.prototype.getUserStatistics = function (info, callback) {

    info.dau = 0;
    info.mau = 0;
    info.users = 0;
    if (!callback) {
        return;
    }

    var count = 0;

    // 用户总数
    var sql = "select count(*) as cnt from nanao.userinfo";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Select users failed: " + err);
        } else {
            if (rows && rows.length > 0 && rows[0].cnt) {
                info.users = rows[0].cnt;
            }
        }

        ++count;
        if (count == 3) {
            callback(info);
        }
    });

    // 日活跃用户数
    sql = "select count(*) as cnt from nanao.userinfo where TO_DAYS(NOW()) - TO_DAYS(time) = 0";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Select dau failed: " + err);
        } else {
            if (rows && rows.length > 0 && rows[0].cnt) {
                info.dau = rows[0].cnt;
            }
        }

        ++count;
        if (count == 3) {
            callback(info);
        }
    });

    // 月活跃用户数
    sql = "select count(*) as cnt from nanao.userinfo where TO_DAYS(NOW()) - TO_DAYS(time) < 30";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Select mau failed: " + err);
        } else {
            if (rows && rows.length > 0 && rows[0].cnt) {
                info.mau = rows[0].cnt;
            }
        }

        ++count;
        if (count == 3) {
            callback(info);
        }
    });
}

function storeUserinfo(res, uid, usr) {
    if (!uid) {
        uid = "";
    }

    var sql = "insert into nanao.userinfo(username, uid, time) values('" + usr + "', '" + uid + "', NOW())";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            if (err.code == "ER_DUP_ENTRY") {
                // 已存在,则更新上线时间.
                sql = "update nanao.userinfo set time=NOW() where username='" + usr + "'";
                dbmanager.query(sql, function (err, rows, fields) {
                    // do nothing
                });
            } else {
                console.log("Store userinfo failed: " + err);
            }
        } else {
            sendResult(res);
        }
    });

}

function verifyUserinfo(res, usr, key, uid) {
}

function getUserinfo(res) {
    
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

Userinfo.prototype.qqLogin = function (req, res) {
    console.log(req);
    res.send("");
}

module.exports = Userinfo;
