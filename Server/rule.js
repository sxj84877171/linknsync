var formidable = require('formidable');
var fs = require('fs');
var config = require('./config.js');

var dbmanager = null;

var uploadFolder = "." + config.kRootDir + "/rule";
var urlPrefix = "/rule/";

function Rule() {
}

Rule.prototype.init = function (dbm, invoker) {
    dbmanager = dbm;

    var sql = 'CREATE TABLE IF NOT EXISTS nanao.rule (\
        type VARCHAR(32) NOT NULL,\
        version VARCHAR(32) NOT NULL,\
        url VARCHAR(256) NOT NULL,\
        time VARCHAR(32),\
        PRIMARY KEY (type)\
    );';

    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Create rule DB failed: " + err);
            return;
        }

        // 插入针对可操作通知的规则
        sql = "insert into nanao.rule(type, version, url, time) values('op', '1.0', '/rule/operation.json', NOW())";
        dbmanager.query(sql, function (err, rows, fields) {
            // do nothing
        });

        // 插入控制显示通知的规则
        sql = "insert into nanao.rule(type, version, url, time) values('show', '1.0', '/rule/show.json', NOW())";
        dbmanager.query(sql, function (err, rows, fields) {
            // do nothing
        });
    });

	//console.log("uploadFolder: " + uploadFolder);
    fs.mkdir(uploadFolder, 0777, function (err) {
    });
}

Rule.prototype.update = function (req, res) {
    var type = req.param('type');
    var version = req.param('v');

    if (!type && !version) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var result = {};
            if (!fields.type || !fields.v) {
                return sendResult(res, "kInvalidPostArgs", "");
            }

            updateVersion(fields.type, fields.v, res, sendResult);
        });

        return;
    }

    if (!type || !version) {
        return sendResult(res, "kInvalidArgs", "");
    }

    updateVersion(type, version, res, sendResult);
}

function updateVersion(type, version, res) {
    var sql = "update nanao.rule set version='" + version + "' where type='" + type + "'";

    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            callback(res, "Update rule version failed");
            return;
        }

        sendResult(res, "Succeeded", "", version);
    });
}

Rule.prototype.get = function (req, res) {
    var type = req.param('type');
    var version = req.param('v');

    if (!type && !version) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var result = {};
            if (!fields.type || !fields.v) {
                return sendResult(res, "kInvalidPostArgs", "");
            }

            getURL(fields.type, fields.v, res, sendResult);
        });

        return;
    }

    if (!type || !version) {
        return sendResult(res, "kInvalidArgs", "");
    }

    getURL(type, version, res, sendResult);
}

function getURL(type, version, res, callback) {

    var sql = "select version, url from nanao.rule where type='" + type + "'";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Select rule url failed: " + err);

            callback(res, "kNoSuchRecord", "");
            return;
        }

        if (!rows || rows.length == 0 || !rows[0].url) {
            callback(res, "kNoSuchRecord", "");
            return;
        }
        
        if (rows[0].version > version)
            callback(res, "", rows[0].url, rows[0].version);
        else
            callback(res, "", "");
    });
}

function sendResult(res, error, url, version) {
    var result = {};

    if (url && url.length > 0)
        result.url = url;

    if (error && error.length > 0)
        result.error = error;

    if (version && version.length > 0)
        result.version = version;

    res.send(JSON.stringify(result));
}

module.exports = Rule;
