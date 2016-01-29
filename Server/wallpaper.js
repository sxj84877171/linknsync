var formidable = require('formidable');
var fs = require('fs');
var config = require('./config.js');

var dbmanager = null;

var uploadFolder = "." + config.kRootDir + "/wallpapers";
var urlPrefix = "/wallpapers/";

function Wallpaper() {
}

Wallpaper.prototype.init = function (dbm) {
    dbmanager = dbm;

    var sql = 'CREATE TABLE IF NOT EXISTS nanao.wallpaper (\
        deviceID VARCHAR(128),\
        type VARCHAR(32),\
        url VARCHAR(256) NOT NULL,\
        time VARCHAR(32),\
        PRIMARY KEY (deviceID, type)\
    );';

    dbmanager.query(sql, function (err, rows, fields) {
        if (err)
            console.log("Create wallpaper DB failed: " + err);
    });

	//console.log("uploadFolder: " + uploadFolder);
    fs.mkdir(uploadFolder, 0777, function (err) {
    });
}

Wallpaper.prototype.upload = function (req, res) {

    var form = new formidable.IncomingForm();
    form.uploadDir = uploadFolder;
    form.keepExtensions = true;
    form.maxFields = 100;
    form.maxFieldsSize = 2 * 1024 * 1024;

    form.parse(req, function (err, fields, files) {

        if (!fields.did || !fields.type) {
            return sendResult(res, "kInvalidArgs", "");
        }

        if (!files.file && !files.data) {
            console.log("upload failed: " + files);
            return;
        }

        var fpath = files.file ? files.file.path : files.data.path;
        var fsize = files.file ? files.file.path : files.data.size;
        var fname = files.file ? files.file.path : files.data.name;

        var fext = fname.split('.').pop();
        ////var index = fpath.lastIndexOf('/') + 1;
        ////var file_name = old_path.substr(index);

        var npath = fields.did + "_" + fields.type + "." + fext;

        try {

            fs.rename(fpath, uploadFolder + "/" + npath, function (err) {
                if (err)
                    console.log("rename failed: " + err);
            });

        } catch (e) {
            console.log(e);
        }

        var url = urlPrefix + npath;
        storeIconInfo(fields.did, fields.type, url);
        return sendResult(res, "", url);
    });
}

Wallpaper.prototype.get = function (req, res) {
    var did = req.param('did');
    var type = req.param('type');

    if (!did && !type) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var result = {};
            if (!fields.did || !fields.type) {
                return sendResult(res, "kInvalidArgs", "");
            }

            getURL(fields.did, fields.type, res, sendResult);
        });

        return;
    }

    if (!did || !type) {
        return sendResult(res, "kInvalidArgs", "");
    }

    getURL(did, type, res, sendResult);
}

function storeIconInfo(did, type, url) {

    var sql = "insert into xphone.wallpaper(deviceID, type, url, time) values('" + did + "', '" + type + "', '" + url + "', NOW())";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err && err.code != "ER_DUP_ENTRY") {
            console.log("Store app icon failed: " + err);
        }
    });
}

function getURL(did, type, res, callback) {

    var sql = "select url from xphone.wallpaper where deviceID='" + did + "' and type='" + type + "'";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Store app icon failed: " + err);

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

module.exports = Wallpaper;
