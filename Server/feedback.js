var formidable = require('formidable');
var fs = require('fs');
var config = require('./config.js');
var log4js = require('log4js');
var logger = log4js.getLogger('normal');

var dbmanager = null;

var uploadFolder = "." + config.kRootDir + "/feedback";
var urlPrefix = "/feedback/";

function Feedback() {
}

Feedback.prototype.init = function (dbm) {
    dbmanager = dbm;

    var sql = 'CREATE TABLE IF NOT EXISTS nanao.feedback (\
        id int(11) NOT NULL AUTO_INCREMENT,\
        username VARCHAR(64),\
        content VARCHAR(256),\
		devicetype VARCHAR(10) NOT NULL,\
		reason_connectfail VARCHAR(10),\
		reason_badperformance VARCHAR(10),\
		reason_crash VARCHAR(10),\
		reason_fewfeature VARCHAR(10),\
		reason_delay VARCHAR(10),\
		reason_nonotification VARCHAR(10),\
		reason_harduse VARCHAR(10),\
		logPath VARCHAR(256),\
        time TIMESTAMP DEFAULT NOW(),\
        PRIMARY KEY (id)\
    );';

    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            if(logger) logger.error("Create feedback DB failed: " + err);
        } else {
        }
    });
	
	//console.log("uploadFolder: " + uploadFolder);
    fs.mkdir(uploadFolder, 0777, function (err) {
    });
}

Feedback.prototype.publish = function (req, res) {

	var devicetype = null;
	var reasons = {};
	reasons.reason_connectfail = "0";
	reasons.reason_badperformance = "0";
	reasons.reason_crash = "0";
	reasons.reason_fewfeature = "0";
	reasons.reason_delay = "0";
	reasons.reason_nonotification = "0";
	reasons.reason_harduse = "0";

	var form = new formidable.IncomingForm();
	form.uploadDir = uploadFolder;
	form.keepExtensions = true;
	form.maxFields = 100;
	form.maxFieldsSize = 2 * 1024 * 1024;

	form.parse(req, function (err, fields, files) {
	    var result = {};

	    if (!fields.devicetype) {
	        return sendResult(res);
	    }

	    devicetype = fields.devicetype;
	    if (fields.connfail) {
	        reasons.reason_connectfail = fields.connfail;
	    }
	    if (fields.badperformance) {
	        reasons.reason_badperformance = fields.badperformance;
	    }
	    if (fields.crash) {
	        reasons.reason_crash = fields.crash;
	    }
	    if (fields.fewfeatures) {
	        reasons.reason_fewfeature = fields.fewfeatures;
	    }
	    if (fields.delay) {
	        reasons.reason_delay = fields.delay;
	    }
	    if (fields.nonotification) {
	        reasons.reason_nonotification = fields.nonotification;
	    }
	    if (fields.hardtouse) {
	        reasons.reason_harduse = fields.hardtouse;
	    }

	    var logPath = "";
	    if (!files.file && !files.data) {
	        storeInfo(res, fields.username, fields.content, logPath, devicetype, reasons);
	        return;
	    }

	    var fpath = files.file ? files.file.path : files.data.path;
	    var fsize = files.file ? files.file.size : files.data.size;
	    var fname = files.file ? files.file.name : files.data.name;

	    try {
	        var nname = fname;
	        if (fields.username) {
	            nname = fields.username + "_" + fname;
	        }

	        fs.rename(fpath, uploadFolder + "/" + nname, function (err) {
	            if (err) {
	                logPath = "/" + fpath;
	                console.log(uploadFolder + "/" + nname + " -> rename failed: " + err);
	            } else {
	                logPath = urlPrefix + nname;
	            }

	            logPath = logPath.replace(/\\/g, "/");
	            storeInfo(res, fields.username, fields.content, logPath, devicetype, reasons);
	        });
	    } catch (e) {
	        if(logger)  logger.error('** exception:', e.stack);

	        sendResult(res);
	    }
	});
}

Feedback.prototype.get = function (req, res) {
    var index = req.param('index');
    var count = req.param('count');
    if (!index)
        index = 0;

    if (!count || Number(count) == 0)
        count = 100;

    getInfo(index, count, res, sendResult);
}

function storeInfo(res, username, content, logPath, devicetype, reasons) {

    if (!logPath) {
        logPath = "";
    }

    if (!username) {
        username = "";
    }
	
    var sql = "insert into nanao.feedback(username, content, logPath, devicetype, reason_connectfail, reason_badperformance, reason_crash, reason_fewfeature, reason_delay, reason_nonotification,reason_harduse) ";
    sql += "values('" + username + "', '" + content + "', '" + logPath + "', '" + devicetype + "', '" + 
										reasons.reason_connectfail + "', '" + reasons.reason_badperformance + "', '" + 
										reasons.reason_crash + "', '" + reasons.reason_fewfeature + "', '" + 
										reasons.reason_delay + "', '" + reasons.reason_nonotification + "', '" + reasons.reason_harduse + "')";

    if(logger)  logger.info("sql: " + sql);

    dbmanager.query(sql, function (err, rows, fields) {
        if (err && err.code != "ER_DUP_ENTRY") {
            if(logger)  logger.error("Store feedback info failed: " + err);
        } else {
            sendResult(res);
        }
    });
}

function getInfo(index, count, res, callback) {

    var cnt = "(select count(*) from nanao.feedback) as cnt";
    var sql = "select logPath, username, content, " + cnt + " from nanao.feedback order by id desc limit " + index + "," + count;

    dbmanager.query(sql, function (err, rows, fields) {
        if (err) {
            console.log("Select feedback failed: " + err);

            callback(res, "");
            return;
        }
		
        if (!rows || rows.length == 0) {
            callback(res, "kEmpty");
            return;
        }

        var count = rows[0].cnt;
        var contents = [];
        for (var i in rows) {
            var content = {};
            content.username = rows[i].username;
            content.content = rows[i].content;
            content.url = rows[i].logPath;

            contents.push(content);
        }

        callback(res, contents, count);
    });
}

function sendResult(res, contents, count) {
    var result = {};

    result.cmd = "kFeedback";
    result.data = {};
    try {
        if (contents) {
            result.data.count = count;
            result.data.sms = contents;
        }
    } catch (e) {
        result.cmd = "kInvalidFeedback";
    }

    res.send(JSON.stringify(result));
}

module.exports = Feedback;
