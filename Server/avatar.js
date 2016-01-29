var formidable = require('formidable');
var fs = require('fs');
var config = require('./config.js');

var dbmanager = null;

var uploadFolder = "." + config.kRootDir + "/avatar";
var urlPrefix = "/avatar/";

var log4js = require('log4js');
var logger = log4js.getLogger('normal');

function Avatar() {
}

Avatar.prototype.init = function (dbm) {
    dbmanager = dbm;

    var sql = 'CREATE TABLE IF NOT EXISTS nanao.avatar (\
        deviceID VARCHAR(64),\
        contactID VARCHAR(32),\
        url VARCHAR(256) NOT NULL,\
        time VARCHAR(32),\
        PRIMARY KEY (deviceID, contactID)\
    );';

    dbmanager.query(sql, function (err, rows, fields) {
        if (err)
            console.log("Create avatar DB failed: " + err);
    });

	//console.log("uploadFolder: " + uploadFolder);
    fs.mkdir(uploadFolder, 0777, function (err) {
    });
}

Avatar.prototype.upload = function (req, res) {

    var form = new formidable.IncomingForm();
    form.uploadDir = uploadFolder;
    form.keepExtensions = true;
    form.maxFields = 100;
    form.maxFieldsSize = 2 * 1024 * 1024;

    try {
        form.parse(req, function (err, fields, files) {

            if (!fields.deviceID || !fields.contactID) {
                return sendResult(res, "kInvalidArgs", "");
            }

            if (!files.file && !files.data) {
                console.log("upload failed: " + files);
                return;
            }

            var fpath = files.file ? files.file.path : files.data.path;
            var fsize = files.file ? files.file.size : files.data.size;
            var fname = files.file ? files.file.name : files.data.name;
            var fext = fname.split('.').pop();

            var npath = fields.deviceID + "_" + fields.contactID + "." + fext;

            try {

                fs.rename(fpath, uploadFolder + "/" + npath, function (err) {
                    if (err)
                        console.log("rename failed: " + err);
                });

            } catch (e) {
                console.log(e);
            }

            var url = urlPrefix + npath;
            storeIconInfo(fields.deviceID, fields.contactID, url);
            return sendResult(res, "", url);
        });
    } catch (e) {

    }
}

Avatar.prototype.get = function (req, res) {
    var deviceID = req.param('deviceID');
    var contactID = req.param('contactID');

    if (!deviceID && !contactID) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var result = {};
            if (!fields.deviceID || !fields.contactID) {
                return sendResult(res, "kInvalidArgs", "");
            }

            getURL(fields.deviceID, fields.contactID, res, sendResult);
        });

        return;
    }

    if (!deviceID || !contactID) {
        return sendResult(res, "kInvalidArgs", "");
    }

    getURL(deviceID, contactID, res, sendResult);
}

function storeIconInfo(deviceID, contactID, url) {

    var sql = "insert into nanao.avatar(deviceID, contactID, url, time) values('" + deviceID + "', '" + contactID + "', '" + url + "', NOW())";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err && err.code != "ER_DUP_ENTRY") {
            console.log("Store avatar failed: " + err + ", " + sql);
        }
    });
}

function getURL(deviceID, contactID, res, callback) {

    var sql = "select url from nanao.avatar where deviceID='" + deviceID + "' and contactID='" + contactID + "'";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Select avatar info failed: " + err + ", " + sql);

            callback(res, "kNoSuchRecord", "");
            return;
        }

        if (!rows || rows.length == 0 || !rows[0].url) {
            callback(res, "kNoSuchRecord", "");
            return;
        }

        callback(res, "", rows[0].url);
    });
}

function sendResult(res, error, url) {
    var result = {};

    if (url && url.length > 0)
        result.url = url;
    else
        error = "kInvalidURL";

    if(error && error.length > 0)
        result.error = error;

    res.send(JSON.stringify(result));
}

module.exports = Avatar;
