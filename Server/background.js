var request = require('request');

var invoker = null;
var dbmanager = null;

function Background() {
}

Background.prototype.init = function (dbm, invkr) {
    dbmanager = dbm;
    invoker = invkr;
}

Background.prototype.getOnlinePeople = function (req, res) {
    if (invoker == null)
        return {};

    var info = {};
    invoker.getOnlinePeople(info);

    invoker.getUserStatistics(info, function () {
        res.send(JSON.stringify(info));
    });
}

module.exports = Background;
