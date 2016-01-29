var cluster = require('cluster');
var util = require('util');
var express = require('express');
var morgan = require('morgan');
var http = require('http');
var servestatic = require('serve-static');
var validator = require('validator');
var merge = require('merge');
var bodyParser = require('body-parser');

var Message = require('./message.js');
var DBManager = require('./dbmanager.js');
var HttpResponser = require('./http.js');

var config = require('./config.js');
var constants = require('./constants.js');

// var bodyParser = require('body-parser');
// var router = require('./router.js');

var clients = {};
var sources = {};
var paired = {};
var dbmanager = null;
var invoker = {};

var kConnecting = 0;
var kOpen = 1;
var kClosing = 2;
var kClosed = 3;
var debugMode = false;
var httpResponser = new HttpResponser();

// 暂时只启动一个线程,多个线程数据不能共享,以后再改. [2015-6-15]
var workers = 1; //process.env.WORKERS || require('os').cpus().length;

if (cluster.isMaster) {
    startMaster();
} else {
    startSlaver();
}

function startMaster() {
    console.log('start cluster with %s workers, ' + config.kVersion, workers);

    for (var i = 0; i < workers; ++i) {
        var worker = cluster.fork().process;
        console.log('worker %s started.', worker.pid);
    }

    cluster.on('exit', function (worker) {
        console.log('worker %s died. restart...', worker.process.pid);
        cluster.fork();
    });
}

function startSlaver() {
    console.log('start slave');

    dbmanager = new DBManager();
    dbmanager.init();

    dbmanager.on('error', function (err) {
        console.log('db error: ' + err);
    });

    var app = new express();

    //app.use(morgan('common'));
    //app.use('/api', router);

    httpResponser.init(app, dbmanager, invoker);
	
	//app.use(function (req, res, next) {
	//	//console.log(req.hostname + " " + req.originalUrl);
	//	
	//	next();
	//});

    app.use(servestatic(__dirname + config.kRootDir, { 'index': ['index.html'] }));

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json());

	
    var server = http.createServer(app);
    server.listen(80);

    var WebSocketServer = require('ws').Server;
    var wsserver = new WebSocketServer({ "server": server, "port": 8080 });

    if(process.argv[2] == "debug")
        debugMode = true;

    wsserver.on('connection', function (ws) {
        if (debugMode) {
            console.log((new Date()).toLocaleString() + " new connection: " + getAddressByWS(ws));
        }

        ws.on('message', function (message) {
            try {
				var msg = JSON.parse(message);
				if (debugMode) {
					if(msg.cmd != "kHeartbeat" && msg.cmd != "h") {
						console.log(message);
					}
				}

                onMessage(ws, msg);
            } catch (e) {
                console.log('** exception:', e.stack);

                // do not need to send this exception info to cient.
                //var response = new Message(0, 0, { e: e.message });
                //ws.send(response.toString());
            }
        });
        
        ws.on('close', function (msg) {
            try {
				if (debugMode) {
					console.log((new Date()).toLocaleString() + " received close event: " + (new Date()).getTime());
				}

				onClose(ws);
			} catch (e) {
                console.log('** exception:', e.stack);
            }
        });
    });

    // 服务器不再主动发送心跳包,而是由各客户端自己业务层去发.[2015-7-6]
    //setInterval(sendHeartbeatPacket, config.kHeartbeatInterval);
}

function sendHeartbeatPacket() {
	try {
		var tm = new Date().getTime();

		for (var token in clients) {
			var clnts = clients[token];
			for (var i in clnts) {
				var info = clnts[i];
				if (!info.ws || !info.ws.heartbeat) {

					if (debugMode) {
						console.log("heartbeat");
					}

					continue;
				}

				if (tm - info.ws.heartbeat < config.kHeartbeatInterval) {
					continue;
				}

				if (info.ws.readyState != kOpen) {
					if (debugMode) {
						console.log((new Date()).toLocaleString() + " Heartbeat, invalid client state: " + info.ws.readyState + ", token: " + info.ws.token);
					}

					continue;
				}

				info.ws.heartbeat = tm;
				info.ws.send(new Message(null, null, null, 'kHeartbeat').toString());
			}
		}

		for (var token in sources) {
			var info = sources[token];
			if (!info.ws || !info.ws.heartbeat)
				continue;

			if (tm - info.ws.heartbeat < config.kHeartbeatInterval)
				continue;

			if (info.ws.readyState != kOpen) {
				if (debugMode) {
					console.log((new Date()).toLocaleString() + " Heartbeat, invalid source state: " + info.ws.readyState + ", token: " + info.ws.token);
				}

				continue;
			}
			
			info.ws.heartbeat = tm;
			info.ws.send(new Message(null, null, null, 'kHeartbeat').toString());
		}
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function findSocketAndGetInfo(ws, target) {
	try {
		// 先从sources里找,看是否是手机发送过来的.
		for (var tkn in sources) {
		    if (sources[tkn].ws == ws) {

		        if (typeof (target.token) == "undefined") {
		            target.token = tkn;
		        }

		        if (typeof (target.to) == "undefined") {
		            target.to = 'c';
		        }

				return;
			}
		}

		// 然后从clients里查找,看是否是PC发过来的.
		for (var tkn in clients) {
			var clnts = clients[tkn];
			for (var i in clnts) {
			    if (clnts[i].ws == ws) {

				    if (typeof (target.to) == "undefined") {
				        target.to = 'a';
				    }

				    if (typeof (target.token) == "undefined") {
				        target.token = tkn;
				    }

					return;
				}
			}
		}
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function onMessage(ws, message) {
	try {
		var target = {};
		target.to = message.to;
		target.token = message.token;
		
		// 如果message里没有token,则尝试用ws从现在的socket列表里找到它,并用现在的token, 否则认为此ws是没有配对过的socket,丢掉它. [2015-7-6]
		if (typeof (target.token) == "undefined" || typeof (target.to) == "undefined") {
			findSocketAndGetInfo(ws, target);
		}

		// 判断token是否有效
		if (typeof (target.token) == "undefined") {
			return;
		}

		// 将token里带的-去掉,因为有-的话不能当对象数组的键值.
		target.token = target.token.replace(/-/g, '');
		if (!ws.addr) {
			var addr = getAddressByWS(ws);
			ws.addr = addr;
		}

		// 发送的目标无效,说明发送的是无效消息.
		if (typeof (target.to) == "undefined") {
			if (debugMode) {
				console.log((new Date()).toLocaleString() + " invalid message, 'to' is invalid: " + JSON.stringify(message));
			}

			return;
		}

		// 判断此ws是否之前被标记为已删除.
		if (ws.deleted) {
			if (debugMode) {
				console.log((new Date()).toLocaleString() + " invlaid socket, this socket has deleted.");
			}

			return;
		}

		ws.heartbeat = (new Date()).getTime();

		switch (target.to) {
			case 's':
				onPair(target.token, message, ws);
				break;

			case 'c':
				onRelayToPC(target.token, message, ws);
				break;

			case 'a':
				onRelayToAndroid(target.token, message, ws);
				break;

			default:
				console.log((new Date()).toLocaleString() + ' invalid to field');
				break;
		}

		if (!ws.token) {
			ws.token = target.token;
		}
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

invoker.onLogin = function (uid, username, token, type) {
	try {
		if (debugMode) {
			console.log(type + " " + username);
		}
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

invoker.getUserStatistics = function (info, callback) {
	try {
		httpResponser.getUserStatistics(info, callback);
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

invoker.getOnlinePeople = function (info) {
	try {
		info.online = 0;
		for (var token in paired) {
			++info.online;
		}

		info.sources = 0;
		for (var token in sources) {
			++info.sources;
		}

		info.clients = 0;
		for (var token in clients) {
			++info.clients;
		}
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function onPair(token, message, ws) {
	try {
	    if (!message.type) {
	        message.type = 'request';
		}

		switch (message.type) {
			case 'request':
				if (!message.cmd) {
					console.log((new Date()).toLocaleString() + " invalid command");
					break;
				}
				
				switch (message.cmd) {
					case 'kPostclient':
						onReceivedPCMessage(token, message, ws);
						break;
						
					case 'kPostsource':
						onReceivedAndroidMessage(token, message, ws);
						break;
						
				    case 'b': // heartbeat
				        var heartbeat = {};
				        heartbeat.cmd = 'b';
				        ws.send(JSON.stringify(heartbeat));
				        break;

					case 'kHeartbeat':
						break;

					default:
						console.log((new Date()).toLocaleString() + " invalid command: " + message.cmd);
						break;
				}
				break;

			case 'response':
				// RIGHT NOW, NO REQUEST ISSUED FROM SERVER
				break;
		}
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function checkWebSocketAlive(token, message, ws, checkAliveCallback, newWSocket) {
	try {
		if (ws.checkAlive)
			return false;

		if (debugMode) {
			console.log("-> check socket is alive...");
		}

		ws.wsocket = newWSocket;
		ws.checkAlive = true;
		ws.message = message;
		ws.checkAliveCallback = checkAliveCallback;
		ws.timeout = setTimeout(function () {
			ws.message = null;
			ws.wsocket = null;
			ws.checkAliveCallback = null;

			clearTimeout(ws.timeout);
			delete ws.timeout;

			checkAliveCallback(token, message, newWSocket);
		}, 1000);

		ws.send(new Message(null, null, null, 'kHeartbeat').toString());
		return true;
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function inSameLAN(clientInfo, sourceInfo) {
	try {
		if (clientInfo.public_ip != sourceInfo.public_ip)
			return false;
		
		return true;
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function onReceivedPCMessage(token, message, ws) {
	try {
		ws.role = 'c';
		
		if (message.cid && !ws.cid)
			ws.cid = message.cid;

		if(typeof(message.data) == "undefined") {
			message.data = {};
		}
		
		var info = {
			"ws": ws,
			"token": token,
			"public": ws.addr,
			"public_ip": ws._socket.remoteAddress,
			"local_addr": message.data.addr
		};

		if (debugMode) {
			console.log((new Date()).toLocaleString() + " -- pc addr: " + ws.addr + ", " + JSON.stringify(message));
		}

		//console.log((new Date()).toLocaleString() + " -- pc delay:" + ((new Date()).getTime() - message.curtime) + ", token: " + token + ", len: " + token.length + ", addr: " + ws.addr);

		// support multi clients. [2015-3-12]
		//// if this token already exist, then check the previous socket is still alive.
		//if (clients[token] && clients[token].ws && !clients[token].ws.disconnected) {

		//    if (checkWebSocketAlive(token, message, clients[token].ws, onReceivedPCMessage, ws))
		//        return;

		//    console.log("** received pc message, but token is in use:" + token);

		//    ws.token = "";
		//    ws.send(new Message(message.id, 'response', 'c', 'kConflict').toString());
		//    ws.timeout = setTimeout(function () {
		//        console.log("close client conflict socket");
		//        ws.close(1000);
		//    }, config.kTimeoutToCloseSocketWhenTokenInUse);

		//    return;
		//}

		if (!clients[token]) {
			clients[token] = [];
		}

		// 判断当前ws是否已经在数组里, 如果已经在, 就不再执行插入了.
		if (!findClient(clients[token], ws)) {
			clients[token].push(info);
		} else {
			if (debugMode) {
				console.log((new Date()).toLocaleString() + " Second post client: " + ws.addr);
			}
		}

		if (debugMode && clients[token].length > 1)
			console.log((new Date()).toLocaleString() + " client count: " + clients[token].length);

		if (sources[token]) {
			if (sources[token].ws.timeout) {
				clearTimeout(sources[token].ws.timeout);
				delete sources[token].ws.timeout;
			}

			if (debugMode) {
				console.log((new Date()).toLocaleString() + " -- client pair succeeded: " + sources[token].public_ip + ", " + info.public_ip);
			}

			//判断外网ip是否一致，一致表示两设备在同一个局域网内
			var clientdata = { "deviceid": sources[token].deviceid, "dbid": sources[token].dbid, "name": sources[token].name };
			var sourcedata = { "cid": ws.cid };
			if (inSameLAN(sources[token], info)) {
				clientdata.addr = sources[token].local_addr;
				
				sourcedata.addr = info.local_addr;
			}
			
			if (sources[token].ws.readyState != kOpen) {
			    if (debugMode) {
			        console.log((new Date()).toLocaleString() + " ----------------- onReceivedPCMessage, invalid source socket state: " + sources[token].ws.readyState + ", token: " + sources[token].ws.token);
			    }

				return;
			}

			ws.send(new Message(message.id, 'response', 'c', 'kPaired', clientdata).toString());
			sources[token].ws.send(new Message(message.id, 'response', 'c', 'kPaired', sourcedata).toString());
			paired[token] = { status: 'kPaired' };
		} else if(debugMode) {
			console.log((new Date()).toLocaleString() + " -- pair fialed: no source info");
		}

		//dbmanager.addClient(info, function (err, id) {
		//    if (err) {
		//        //throw new Error(err);
		//    }

		//    clients[token].id = id;

		//    if (!paired[token]) {
		//        console.log("add pc client, but no pairing");
		//        return;
		//    }

		//    dbmanager.addPair(id, sources[token].id, function (err, pid) {
		//        if (err) {
		//            console.log(err);
		//            //throw new Error('error inserting paired');
		//        }

		//        paired[token].id = pid;
		//    });
		//});
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function onReceivedAndroidMessage(token, message, ws) {
	try {
		ws.role = 'a';
		
		if (debugMode) {
			console.log((new Date()).toLocaleString() + " -+ android addr: " + ws.addr + ", " + JSON.stringify(message));
		}

		//console.log((new Date()).toLocaleString() + " -+ android token: " + token + ", len: " + token.length + ", addr: " + ws.addr);

		if(typeof(message.data) == "undefined") {
			message.data = {};
		}

		var address = getAddressByWS(ws);
		var info = {
			"ws": ws,
			"token": token,
			"public": address,
			"public_ip": ws._socket.remoteAddress,
			"local_addr": message.data.addr,
			"deviceid": message.data.deviceid,
			"dbid": message.data.dbid,
			"name": message.data.name
		};

		var deviceChanged = false;

		// if this token already exist, then check the previous socket is still alive.
		if (sources[token] && sources[token].ws) {

			if (sources[token].ws == ws) {
				if (debugMode) {
					console.log((new Date()).toLocaleString() + " Second post source: " + ws.addr);
				}

				return;
			}

			//// 检查WebSocket的原理是, 给它发送一个心跳包, 如果此socket已经断开, 那只要一发送就会收到断开事件.
			//if (checkWebSocketAlive(token, message, sources[token].ws, onReceivedAndroidMessage, ws))
			//    return;

			//console.log("** received android message, but token is in use:" + token);
			//ws.token = "";
			//ws.send(new Message(message.id, 'response', 'a', 'kConflict').toString());
			//ws.timeout = setTimeout(function () {
			//    console.log("close android conflict socket");
			//    ws.close(1000);
			//}, config.kTimeoutToCloseSocketWhenTokenInUse);

			if (sources[token].ws.readyState != kOpen) {
				if (debugMode) {
					console.log((new Date()).toLocaleString() + " +++++++++++++ onReceivedAndroidMessage, invalid source state: " + sources[token].ws.readyState + ", token: " + sources[token].ws.token);
				}
			} else {
				// 第二个设备连上来后, 给之前的socket发送一个冲突的命令. 同时修改配对信息.
				deviceChanged = true;
				sources[token].ws.send(new Message(message.id, 'response', 'a', 'kConflict').toString());
				sources[token].ws.deleted = true;

				if (debugMode) {
					console.log((new Date()).toLocaleString() + " device changed");
				}
			}
		}

		if (token != ws.token && sources[ws.token]) {
			if (debugMode) {
				console((new Date()).toLocaleString() + " --- android repair");
			}

			delete sources[ws.token];
		}

		if(sources[token])
			delete sources[token];

		sources[token] = info;

		if (clients[token] && clients[token].length != 0) {
			if (deviceChanged) {
				sendMessageToClient(clients[token], new Message(null, 'request', null, 'kDeviceChanged'));
			}
			
			var clientdata = { "deviceid": info.deviceid, "dbid": info.dbid, "name": info.name };
			var sourcedata = sendMessageToClient(clients[token], new Message(message.id, 'response', 'c', 'kPaired', clientdata), info);
			ws.send(new Message(message.id, 'response', 'a', 'kPaired', sourcedata).toString());
			paired[token] = { status: 'kPaired' };

			if (debugMode) {
				console.log((new Date()).toLocaleString() + " -+ android pair succeeded: " + sourcedata.addr + ", " + info.public_ip);
			}
		} else if(debugMode) {
			console.log((new Date()).toLocaleString() + " -+ pair fialed: no client info");
		}

		//if (!message.data.device) {
		//    //console.log("no device info, no need to store.");
		//    return;
		//}

		//if (!message.data.device.imei) {
		//    //console.log("no imei info, no need to store.");
		//    return;
		//}

		//dbmanager.getDeviceID(message.data.device, function (err, id) {
		//    if (err) {
		//        console.log(err);
		//        throw new Error('error getting device id');
		//    }

		//    if (!id) {
		//        console.log("invalid id");
		//        return;
		//    }

		//    sources[token].deviceid = id;
		//    dbmanager.addSource(sources[token], function (err, sid) {
		//        if (err) {
		//            console.log(err);
		//            throw new Error('error inserting source');
		//        }

		//        if (!sid) {
		//            console.log("invalid sid");
		//            return;
		//        }

		//        sources[token].id = sid;

		//        if (!paired[token]) {
		//            console.log("android, unparied");
		//            return;
		//        }

		//        dbmanager.addPair(clients[token].id, sid, function (err, pid) {
		//            if (err) {
		//                console.log(err);
		//                throw new Error('error inserting paired');
		//            }
					
		//            paired[token].id = pid;
		//        });
		//    });
		//});
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function findClient(clnts, ws) {
	try{
		for (var i in clnts) {
			if (clnts[i].ws == ws)
				return true;
		}

		return false;
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function sendMessageToClient(clnts, msg, sourceInfo) {
	try{
		var sourcedata = {};

		if (!clnts || !msg)
			return sourcedata;

		sourcedata.cid = "";

		for (var i in clnts) {
			if (clnts[i].ws) {
				if (clnts[i].ws.readyState == kOpen) {
					//判断外网ip是否一致，一致表示两设备在同一个局域网内
					if (sourceInfo && sourceInfo.public_ip == clnts[i].public_ip) {

						if (typeof (clnts[i].local_addr) != "undefined" && clnts[i].local_addr.length > 0) {
							sourcedata.addr += clnts[i].local_addr + ";";
						}

						if (typeof (msg.data) == "undefined") {
							msg.data = {};
							msg.data.addr = "";
						}

						msg.data.addr = sourceInfo.local_addr;
					}

					if (typeof (clnts[i].ws.cid) != "undefined") {
						sourcedata.cid = sourcedata.cid + clnts[i].ws.cid + ",";
					}

					clnts[i].ws.send(JSON.stringify(msg));
				} else if(debugMode) {
					console.log((new Date()).toLocaleString() + " sendMessageToClient, invalid source state: " + clnts[i].ws.readyState + ", token: " + clnts[i].ws.token);
				}
			}
		}

		return sourcedata;
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function onRelayToPC(token, message, ws) {
	try{
		if (paired[token] && clients[token]) {

			var clnts = clients[token];
			if (message.cid && message.cid.length > 0) {
				for (var i in clnts) {
					if (clnts[i].ws && message.cid == clnts[i].ws.cid) {
						if (clnts[i].ws.readyState == kOpen) {
							clnts[i].ws.send(JSON.stringify(message));
						} else if(debugMode) {
							console.log((new Date()).toLocaleString() + " onRelayToPC, invalid source state: " + clnts[i].ws.readyState + ", token: " + clnts[i].ws.token);
						}

						return;
					}
				}
			}

			sendMessageToClient(clients[token], message);
		} else if(debugMode) {
			console.log((new Date()).toLocaleString() + " relay to pc failed: " + JSON.stringify(message));

			//onClose(ws);
		}
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function onRelayToAndroid(token, message, ws) {
	try{
		if (paired[token] && sources[token]) {
			if (sources[token].ws.readyState == kOpen) {
				sources[token].ws.send(JSON.stringify(message));
			} else if(debugMode) {
				console.log((new Date()).toLocaleString() + " onRelayToAndroid, invalid source state: " + sources[token].ws.readyState + ", token: " + sources[token].ws.token);
			}
		} else if(debugMode) {
			console.log((new Date()).toLocaleString() + " relay to android failed: " + JSON.stringify(message));

			//onClose(ws);
		}
	} catch (e) {
		console.log('** exception:', e.stack);
	}
}

function onClose(ws) {
	try{
		if (debugMode) {
			console.log((new Date()).toLocaleString() + " onClose, role: " + ws.role + ", token: " + ws.token + ", addr: " + ws.addr);
		}

		if (ws.timeout) {
			clearTimeout(ws.timeout);
			delete ws.timeout;
		}

		var token = ws.token;
		if (!token)
			return;

		if (ws.deleted)
			return;

		//if (paired[token]) {
		//    delete paired[token];
		//}

		switch (ws.role) {
			case 'a':
				{
					delete paired[token];
					delete sources[token];

					try {
						if (clients[token]) {
							sendMessageToClient(clients[token], new Message('0', 'request', 'c', 'kPhoneDisconnected'));
						}
					} catch (e) {

					}

					break;
				}

			case 'c':
				{
					//delete clients[token];
					if(clients[token]){
						for (var i = 0; i < clients[token].length; ++i) {
							var info = clients[token][i];
							if (info.ws == ws) {
								clients[token].splice(i, 1);
								break;
							}
						}

						var allDisconnected = false;
						if (clients[token] && clients[token].length == 0){
							delete paired[token];
							delete clients[token];
							allDisconnected = true;
                            
							if (debugMode) {
								console.log((new Date()).toLocaleString() + " delete client token:" + token);
							}
						}

						if (allDisconnected && !ws.checkAlive && sources[token] != null && sources[token].ws != undefined && sources[token].ws != null) {
							if (sources[token].ws.readyState == kOpen) {
								sources[token].ws.send(new Message('0', 'request', 'a', 'kPCDisconnected').toString());
							} else if(debugMode) {
								console.log((new Date()).toLocaleString() + " onClose, invalid source state: " + sources[token].ws.readyState + ", token: " + sources[token].ws.token);
							}

							//sources[token].ws.timeout = setTimeout(function () {
							//    console.log("timeout, close socket: " + sources[token].ws.token);
							//    sources[token].ws.close(1000);
							//    delete sources[token];
							//}, config.kTimeoutToCloseAndroidSocketIfPCSocketClosed);
						}
					}

					break;
				}
		}

		if (ws.checkAlive) {
			ws.checkAlive = false;
			if (!ws.checkAliveCallback || !ws.message || !ws.wsocket)
				return;

			if (debugMode) {
				console.log("check alive callback.");
			}

			ws.disconnected = true;
			ws.checkAliveCallback(ws.token, ws.message, ws.wsocket);
		} 
	}catch (e) {
		console.log('** exception:', e.stack);
	}
}

function getAddressByWS(ws) {
	try{
		return util.format('%s:%s', ws._socket.remoteAddress, ws._socket.remotePort);
    } catch (e) {
		console.log('** exception:', e.stack);
	}
}

process.on('uncaughtException', function (err) {
	try{
		console.log(' uncaughtException:', err.message)
		console.log(err.stack)
		console.log("global uncaughtException")
		process.exit(1)
    } catch (e) {
		console.log('** exception:', e.stack);
	}
})
