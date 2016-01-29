var formidable = require('formidable');
var fs = require('fs');
var config = require('./config.js');

var dbmanager = null;

var uploadFolder = "." + config.kRootDir + "/icons";
var urlPrefix = "/icons/";
var localRootDir = "." + config.kRootDir;

function Notification() {
}

Notification.prototype.init = function (dbm) {
    dbmanager = dbm;

    var sql = 'CREATE TABLE IF NOT EXISTS nanao.notification (\
        package VARCHAR(128),\
        version VARCHAR(128),\
        url VARCHAR(256) NOT NULL,\
        time VARCHAR(32),\
        PRIMARY KEY (package, version)\
    );';

    dbmanager.query(sql, function (err, rows, fields) {
        if (err)
            console.log("Create notification DB failed: " + err);
    });

	//console.log("uploadFolder: " + uploadFolder);
    fs.mkdir(uploadFolder, 0777, function (err) {
    });
}

Notification.prototype.upload = function (req, res) {

    var form = new formidable.IncomingForm();
    form.uploadDir = uploadFolder;
    form.keepExtensions = true;
    form.maxFields = 100;
    form.maxFieldsSize = 2 * 1024 * 1024;

    form.parse(req, function (err, fields, files) {

		try {
			if (!fields.package || !fields.version) {
				return sendResult(res, "kInvalidArgs", "");
			}

			if (!files.file && !files.data) {
			    console.log("upload failed: " + files);
			    return sendResult(res, "kInvalidArgs", "");
			}

			var fpath = files.file ? files.file.path : files.data.path;
			var fsize = files.file ? files.file.path : files.data.size;
			var fname = files.file ? files.file.path : files.data.name;

			var fext = fname.split('.').pop();
			var npath = fields.package + "_" + fields.version + "." + fext;

			try {

			    fs.rename(fpath, uploadFolder + "/" + npath, function (err) {
			        var url = urlPrefix + npath;

			        if (err) {
			            url = "/" + fpath;
				        console.log("rename failed: " + err);
			        }

			        url = url.replace(/\\/g, "/");
			        storeIconInfo(fields.package, fields.version, url);
			        return sendResult(res, "", url);
				});

			} catch (e) {
			    console.log(e);

			    return sendResult(res, "kInvalidArgs", "");
			}
		} catch (e) {
		    console.log("Notification.upload: ", e.stack);

		    return sendResult(res, "kInvalidArgs", "");
		}
    });
}

Notification.prototype.get = function (req, res) {
    var package = req.param('package');
    var version = req.param('version');

    if (!package && !version) {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var result = {};
            if (!fields.package || !fields.version) {
                return sendResult(res, "kInvalidArgs", "");
            }

            getURL(fields.package, fields.version, res, sendResult);
        });

        return;
    }

    if (!package || !version) {
        return sendResult(res, "kInvalidArgs", "");
    }

    getURL(package, version, res, sendResult);
}

function storeIconInfo(package, version, url) {

    var sql = "insert into nanao.notification(package, version, url, time) values('" + package + "', '" + version + "', '" + url + "', NOW())";
    dbmanager.query(sql, function (err, rows, fields) {
        if (err && err.code != "ER_DUP_ENTRY") {
            console.log("Store notification icon failed: " + err + ", " + sql);
        }
    });
}

function getURL(package, version, res, callback) {

    try {
        var sql = "select url from nanao.notification where package='" + package + "' and version='" + version + "'";
        dbmanager.query(sql, function (err, rows, fields) {
            if (err) {
                console.log("Select notification icon failed: " + err + ", " + sql);

                callback(res, "kNoSuchRecord", "");
                return;
            }

            if (!rows || rows.length == 0 || !rows[0].url) {
                callback(res, "kNoSuchRecord", "");
                return;
            }

            fs.exists(localRootDir + rows[0].url, function (exists) {
                if (exists) {
                    callback(res, "", rows[0].url);
                } else {
                    var sql = "delete from nanao.notification where package='" + package + "' and version='" + version + "'";
                    dbmanager.query(sql, function (err, rows, fields) {
                    });

                    callback(res, "kNoSuchRecord", "");
                }
            });
        });
    } catch (e) {
        console.log("Notification.getURL: ", e.stack);

        return sendResult(res, "kInvalidArgs", "");
    }
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

module.exports = Notification;
