var formidable = require('formidable');

var dbmanager = null;
var maxTipsID = 0;

function Tips() {
}

Tips.prototype.init = function (dbm) {
    dbmanager = dbm;

    var sql = 'CREATE TABLE IF NOT EXISTS nanao.tips (\
        tipsID int(11) NOT NULL AUTO_INCREMENT,\
        tips VARCHAR(4196) NOT NULL,\
        type int(11), \
        time VARCHAR(32),\
        PRIMARY KEY (tipsID)\
    );';

    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Create tips DB failed: " + err);
        } else {
            getMaxTipsID();
        }
    });
}

Tips.prototype.publish = function (req, res) {

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

Tips.prototype.get = function (req, res) {
    var index = req.param('index');
    if (!index)
        index = 0;

    getTips(index, res, sendResult);
}

function getMaxTipsID() {
    var sql = "select tipsID from nanao.tips where type=1 group by tipsID desc limit 1";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err)
            return;

        if (!rows || rows.length == 0 || !rows[0].tipsID)
            return;

        maxTipsID = rows[0].tipsID;
    });
}

function storeTipsInfo(chinese, english, type, lang) {

    var text = "{\"en\": \"" + english + "\", \"cn\": \"" + chinese + "\"}";
    var sql = "insert into nanao.tips(tips, type, time) values('" + text + "'," + type + ", NOW())";
    console.log(sql);
    dbmanager.query(sql, function (err, rows, fields) {
        if (err && err.code != "ER_DUP_ENTRY") {
            console.log("Store tips info failed: " + err);
        } else {
            getMaxTipsID();
        }
    });
}

function getTips(index, res, callback) {

    var sql = "select tips, tipsID from nanao.tips where type=1 group by tipsID desc limit 1";
    if (index == 0)
        sql = "select tips, tipsID from nanao.tips where type=0";

    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Select tips failed: " + err);

            callback(res, "");
            return;
        }

        if (!rows || rows.length == 0 || !rows[0].tips) {
            callback(res, "kTipsIsEmpty");
            return;
        }

        var idx = 0;
        var nextIndex = maxTipsID;
        if (index == 0) {
            nextIndex = maxTipsID - 1;
            idx = Math.floor(Math.random() * rows.length);
        }

        //console.log("index: " + index + ", idx: " + idx + ", maxTipsID: " + maxTipsID);

        if (index > 0 && index >= maxTipsID)
            callback(res, null, 0);
        else
            callback(res, rows[idx].tips, nextIndex);
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

module.exports = Tips;
