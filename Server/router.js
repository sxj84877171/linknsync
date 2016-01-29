var util = require('util');
var express = require('express');
var DBManager = require('./dbmanager.js');

var dbmanager = new DBManager();
dbmanager.init({
  host: 'localhost',
  user: argv.u,
  password: argv.p
});

var sources = {};
var clients = {};
var pairs = {};

var ERROR_SUCCEESS = 0;
var ERROR_SERVER = 1;
var ERROR_NO_MOBILE_PAIRED = 3;
var ERROR_NOT_IN_SAME_LAN = 4;
var ERROR_NO_THE_ID = 5;
var ERROR_PAIRED_ALREADY = 6;
var ERROR_SOURCE_INVALID = 7;
var ERROR_SOURCE_URL_INVALID = 8;

var router = express.Router();

router.get(/^\/source\/(\w+)?$/, function(req, res) {
  // force connection close
  res.set('Connection', 'close');

  var token = req.params[0];
  if (token) {
    var address = util.format('%s:%s', req.ip, req.connection.remotePort);

    clients[token] = req.connection;
    req.connection.on('close', function() {
      delete clients[token];
    });

    var source = sources[token];
    if (source) {
      dbmanager.addClient({ token: token, address: address }, function(clientid) {
        res.send(sources[token]);
      });
    }
  } else {
    res.status(400).end();
  }
});

router.post('/source', function(req, res) {
  if (req.body.token) {
    var address = util.format('%s:%s', req.ip, req.connection.remotePort);

    sources[token] = req.body;
    sources[token].public = address;
    req.connection.on('close', function() {
      delete sources[token];
    });

    if (pairs[token]) {
      res.send(ERROR_PAIRED_ALREADY);
    } else {
      dbmanager.addDevice()
      dbmanager.addSource()
      res.send(ERROR_SUCCEESS);
    }
  } else {
    res.status(400).end();
  }
});

router.post('/pair', function(req, res) {
  var token = req.body.token;
  if (token) {
    var pair = {};
    pair.source = sources[token];
    pair.client = clients[token];
    pairs[token] = pair;

    dbmanager.addPair()
  } else {
    res.status(400).end();
  }
});

module.exports = router;
