var cluster = require('cluster');
var util = require('util');
var express = require('express');
var log4js = require('log4js');

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
var SocketManager = require('./socket_manager.js');

// var bodyParser = require('body-parser');
// var router = require('./router.js');

var dbmanager = null;
var invoker = {};

var logger = initLogger();
var httpResponser = new HttpResponser();
var socketManager = new SocketManager();

// 暂时只启动一个线程,多个线程数据不能共享,以后再改. [2015-6-15]
var workers = 1; //process.env.WORKERS || require('os').cpus().length;

if (cluster.isMaster) {
    startMaster();
} else {
    startSlaver();
}

function initLogger(){
	try{
		log4js.configure({
			appenders:[
			{
				type:'dateFile', 
				filename:'./logs/log',
				layout:{type:'basic'},
				pattern:'_yyyy-MM-dd',
				alwaysIncludePattern:true,
				maxLogSize: 1024,
				backups:5,
				category:'normal'
			}
			]
		});
		
		var log = log4js.getLogger('normal');
		
		if(process.argv[2] != "debug" && log){
			log.setLevel('ERROR');
		}
		
		return log;
	} catch(e){
		console.log('** exception:', e.stack);
	}
}

function startMaster() {
    if(logger) logger.info('start cluster with %s workers, ' + config.kVersion, workers);

    for (var i = 0; i < workers; ++i) {
        var worker = cluster.fork().process;
        if(logger) logger.info('worker %s started.', worker.pid);
    }

    cluster.on('exit', function (worker) {
        if(logger) logger.info('worker %s died. restart...', worker.process.pid);
        cluster.fork();
    });
}

function startSlaver() {
    if(logger) logger.info('start slave');

    dbmanager = new DBManager();
    dbmanager.init();

    dbmanager.on('error', function (err) {
        if(logger) logger.error('db error: ' + err);
    });

    var app = new express();

    //app.use(morgan('common'));
    //app.use('/api', router);

    httpResponser.init(app, dbmanager, invoker);

    app.use(servestatic(__dirname + config.kRootDir, { 'index': ['index.html'] }));

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json());

    var server = http.createServer(app);
    server.listen(80);

    var WebSocketServer = require('ws').Server;
    var wsserver = new WebSocketServer({ "server": server, "port": 8080 });

	socketManager.closeHandle = onClose;
	socketManager.checkSocketsAlive();

    wsserver.on('connection', function (ws) {
        if(logger) logger.info(" new connection: " + getAddressByWS(ws) + " socket status:" + ws.readyState);

        ws.on('message', function (message) {
            try {
				var msg = JSON.parse(message);
				if(logger) {
					if(msg.cmd != "kHeartbeat" && msg.cmd != "h") {
						logger.info("on message: " + message);
					}
				}

                onMessage(ws, msg);
            } catch (e) {
                if(logger) logger.error('** exception:', e.stack);

                // do not need to send this exception info to cient.
                //var response = new Message(0, 0, { e: e.message });
                //ws.send(response.toString());
            }
        });
        
        ws.on('close', function (msg) {
            try {
				if(logger) logger.info(" received close event: " + (new Date()).getTime()); 

				onClose(ws);
			} catch (e) {
                if(logger) logger.error('** exception:', e.stack);
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

					if(logger) logger.info("heartbeat");

					continue;
				}

				if (tm - info.ws.heartbeat < config.kHeartbeatInterval) {
					continue;
				}

				if (info.ws.readyState != SocketManager.SOCKET_SATUS.kOpen) {
					if(logger) logger.info(" Heartbeat, invalid client state: " + info.ws.readyState + ", token: " + info.ws.token);

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

			if (info.ws.readyState != SocketManager.SOCKET_SATUS.kOpen) {
				if(logger) logger.warn(" Heartbeat, invalid source state: " + info.ws.readyState + ", token: " + info.ws.token);

				continue;
			}
			
			info.ws.heartbeat = tm;
			info.ws.send(new Message(null, null, null, 'kHeartbeat').toString());
		}
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

function onMessage(ws, message) {
	try {
		var target = {};
		target.to = message.to;
		target.token = message.token;
		
		//只有配对的命令，数据包里带有token，其他时候直接取配对时ws缓存的token值
		if(typeof (target.token) == "undefined"){
			target.token = ws.token;
		}
		if(typeof (target.to) == "undefined"){
			if(ws.role == SocketManager.SOCKET_ROLE.phone){target.to = SocketManager.SOCKET_ROLE.pc;} 
			if(ws.role == SocketManager.SOCKET_ROLE.pc){target.to = SocketManager.SOCKET_ROLE.phone;} 
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
			if(logger) logger.warn(" invalid message, 'to' is invalid: " + JSON.stringify(message));

			return;
		}

		// 判断此ws是否之前被标记为已删除.
		if (ws.deleted) {
			if(logger) logger.warn(" invlaid socket, this socket has deleted.");

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
				if(logger) logger.warn(' invalid to field');
				break;
		}

		if (!ws.token) {
			ws.token = target.token;
		}
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

invoker.onLogin = function (uid, username, token, type) {
	try {
		if(logger) logger.info(type + " " + username);
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

invoker.getUserStatistics = function (info, callback) {
	try {
		httpResponser.getUserStatistics(info, callback);
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

invoker.getOnlinePeople = function (info) {
	try {
		info.online = socketManager.getPairedCounts();
		var count = socketManager.getConnectionCounts();
		info.sources = count.phone;
		info.clients = count.pc;
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
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
					if(logger) logger.warn(" invalid command");
					break;
				}
				
				switch (message.cmd) {
					case 'kPostclient':
						onReceivedPCPairMessage(token, message, ws);
						break;
						
					case 'kPostsource':
						onReceivedAndroidPairMessage(token, message, ws);
						break;
						
				    case 'b': // heartbeat
				        var heartbeat = {};
				        heartbeat.cmd = 'b';
				        ws.send(JSON.stringify(heartbeat));
				        break;

					case 'kHeartbeat':
						break;

					default:
						if(logger) logger.warn(" invalid command: " + message.cmd);
						break;
				}
				break;

			case 'response':
				// RIGHT NOW, NO REQUEST ISSUED FROM SERVER
				break;
		}
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

function inSameLAN(clientInfo, sourceInfo) {
	try {
		if (clientInfo.publicIP != sourceInfo.publicIP)
			return false;
		
		return true;
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

function onReceivedPCPairMessage(token, message, ws) {
	try {
		if(logger) logger.info("onReceivedPCPairMessage: token " + token);
		ws.role = SocketManager.SOCKET_ROLE.pc;
		
		if (message.cid && !ws.deviceid)
			ws.deviceid = message.cid;

		if(typeof(message.data) == "undefined") {
			message.data = {};
		}
		ws.token = token;
		ws.localAddr = message.data.addr;
		ws.publicIP = ws._socket.remoteAddress;
		
		if(logger) logger.info(" -- pc addr: " + ws.addr + ", " + JSON.stringify(message));

		// 判断当前ws是否已经在数组里, 如果已经在, 就不再执行插入了.
		var wsInfo = socketManager.findSocketByObject(ws);
		if(wsInfo && wsInfo.ws){
			if(logger) logger.warn(" Second post client: " + ws.addr);
		} else {
			socketManager.add(ws);
		}

		//通过token查找手机端是否有连上服务器的socket, 有则进行配对操作
		var sourceWsList = socketManager.findSocketByToken(token, SocketManager.SOCKET_ROLE.phone);
		if(sourceWsList.length > 0){
			var sourceWsInfo = sourceWsList[0];
			var sourceWs = sourceWsInfo.ws;
			if(sourceWs){
				
				socketManager.paired(token, ws, sourceWs);
				
				if(logger && sourceWs.pairedSocket.length > 1){
					logger.info(" client count: " + sourceWs.pairedSocket.length);
				}
				if(logger) logger.info("client pair succeeded: " + sourceWs.publicIP + ", " + ws.publicIP);

				//判断外网ip是否一致，一致表示两设备在同一个局域网内
				var clientdata = { "deviceid": sourceWs.deviceid, "dbid": sourceWs.dbid, "name": sourceWs.name };
				var sourcedata = { "cid": ws.deviceid };
				if (inSameLAN(sourceWs, ws)) {
					clientdata.addr = sourceWs.localAddr;
					sourcedata.addr = ws.localAddr;
				}
				
				if (sourceWs.readyState != SocketManager.SOCKET_STATUS.kOpen) {
					if(logger) logger.info(" onReceivedPCPairMessage, invalid source socket state: " + sourceWs.readyState + ", token: " + sourceWs.token);

					return;
				}

				ws.send(new Message(message.id, 'response', 'c', 'kPaired', clientdata).toString());
				sourceWs.send(new Message(message.id, 'response', 'c', 'kPaired', sourcedata).toString());
			}
		} else {
			if(logger) logger.warn("pair fialed: no source info");
		}
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

function onReceivedAndroidPairMessage(token, message, ws) {
	try {
		if(logger) {
			logger.info("onReceivedAndroidPairMessage: token " + token);
			logger.info(" -+ android addr: " + ws.addr);
		}
		ws.role = SocketManager.SOCKET_ROLE.phone;

		//if(logger) logger.info(" -+ android token: " + token + ", len: " + token.length + ", addr: " + ws.addr);

		if(typeof(message.data) == "undefined") {
			message.data = {};
		}

		var address = getAddressByWS(ws);
		ws.token = token;
		ws.publicIP = ws._socket.remoteAddress;
		ws.localAddr = message.data.addr;
		ws.deviceid = message.data.deviceid;
		ws.dbid = message.data.dbid;
		ws.name = message.data.name;

		var deviceChanged = false;

		// if this token already exist, then check the previous socket is still alive.
		var wsList = socketManager.findSocketByToken(token, SocketManager.SOCKET_ROLE.phone);
		if (wsList && wsList.length > 0) {
			var sourceWsInfo = wsList[0];
			var sourceWs = sourceWsInfo.ws;
			if(sourceWs){
				if(sourceWs == ws){
					if(logger) logger.warn(" Second post source: " + ws.addr);
					return;
				}
				
				if (sourceWs.readyState != SocketManager.SOCKET_STATUS.kOpen) {
					if(logger) logger.warn("onReceivedAndroidMessage, invalid source state: " + sourceWs.readyState + ", token: " + sourceWs.token);
				} else {
					// 第二个设备连上来后, 给之前的socket发送一个冲突的命令. 同时修改配对信息.
					deviceChanged = true;
					//将最后连接设备的dbid发给被踢的设备，被踢的设备通过该值判断是否本机踢本机
					var deviceInfo = {dbid : ws.dbid};
					sourceWs.send(new Message(message.id, 'response', 'a', 'kConflict', deviceInfo).toString());
					sourceWs.deleted = true;

					if(logger) logger.warn(" device changed");
				}
			}
			//手机端同一个token只能有一份数据，存在则清除旧数据
			socketManager.remove(sourceWs);
		}

		//同一个socket，发了两次配对命令，而且token还不一样的情况
		if (token != ws.token) {
			wsList = socketManager.findSocketByToken(ws.token, SocketManager.SOCKET_ROLE.phone);
			if (wsList && wsList.length > 0) {
				if(logger) logger.warn(" --- android repair");

				var sourceWsInfo = wsList[0];
				var sourceWs = sourceWsInfo.ws;
				socketManager.remove(sourceWs);
			}
		}

		socketManager.add(ws);

		wsList = socketManager.findSocketByToken(token, SocketManager.SOCKET_ROLE.pc);
		if (wsList && wsList.length > 0) {
			if (deviceChanged) {
				sendMessageToClients(wsList, new Message(null, 'request', null, 'kDeviceChanged'));
			}
			
			var clientdata = { "deviceid": ws.deviceid, "dbid": ws.dbid, "name": ws.name };
			var sourcedata = sendMessageToClients(wsList, new Message(message.id, 'response', 'c', 'kPaired', clientdata), ws);
			ws.send(new Message(message.id, 'response', 'a', 'kPaired', sourcedata).toString());
			
			for(var i=0; i<wsList.length; i++){
				socketManager.paired(token, ws, wsList[i].ws);
			}
			if(logger) logger.info(" -+ android pair succeeded: " + sourcedata.addr + ", " + ws.publicIP);
		} else if(logger) {
			logger.warn(" -+ pair fialed: no client info");
		}
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

function sendMessageToClients(clnts, msg, sourceInfo) {
	try{
		var sourcedata = {};

		if (!clnts || !msg)
			return sourcedata;

		sourcedata.addr = "";
		sourcedata.cid = "";

		for (var i in clnts) {
			if (clnts[i].ws) {
				var ret = sendMessageToClient(clnts[i].ws, msg, sourceInfo);
				sourcedata.addr += ret.addr;
				sourcedata.cid += ret.cid;
			}
		}
		
		return sourcedata;
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

function sendMessageToClient(ws, msg, sourceInfo) {
	try{
		var sourcedata = {"addr":"", "cid":""};
		if(!ws) return sourcedata;
		if (ws.readyState == SocketManager.SOCKET_STATUS.kOpen) {
			//判断外网ip是否一致，一致表示两设备在同一个局域网内
			if (sourceInfo && sourceInfo.publicIP == ws.publicIP) {

				if (typeof (ws.localAddr) != "undefined" && ws.localAddr.length > 0) {
					sourcedata.addr = ws.localAddr + ";";
				}

				if (typeof (msg.data) == "undefined") {
					msg.data = {};
					msg.data.addr = "";
				}

				msg.data.addr = sourceInfo.localAddr;
			}

			if (typeof (ws.deviceid) != "undefined") {
				sourcedata.cid = sourcedata.cid + ws.deviceid + ",";
			}

			//if(logger) logger.info("sendMessageToClient: " + JSON.stringify(msg));
			ws.send(JSON.stringify(msg));
		}else if(logger) {
			logger.warn(" sendMessageToClients, invalid source state: " + ws.readyState + ", token: " + ws.token);
		}
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	} finally {
		return sourcedata;
	}
}

function onRelayToPC(token, message, ws) {
	try{
		if (ws && ws.pairedSocket && ws.pairedSocket.length > 0) {
			if(logger) logger.info("onRelayToPC, pc client count:" + ws.pairedSocket.length);
			if (message.cid && message.cid.length > 0) {
				for (var i in ws.pairedSocket) {
					var clientWs = ws.pairedSocket[i];
					//如果手机端发过来的数据，带有客户端id,则指定发给该客户端，不群发给所有同token的客户端
					if (clientWs && message.cid == clientWs.deviceid) {
						sendMessageToClient(clientWs, message);

						return;
					}
				}
			}

			for(var i=0; i<ws.pairedSocket.length; i++){
				sendMessageToClient(ws.pairedSocket[i], message);
			}
		} else if(logger) {
			logger.warn(" relay to pc failed: " + JSON.stringify(message));

			//onClose(ws);
		}
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

function onRelayToAndroid(token, message, ws) {
	try{
		if (ws && ws.pairedSocket && ws.pairedSocket.length > 0) {
			if(ws.pairedSocket[0]){
				var androidWs = ws.pairedSocket[0];
				if (androidWs.readyState == SocketManager.SOCKET_STATUS.kOpen) {
					androidWs.send(JSON.stringify(message));
				} else if(logger) {
					logger.warn(" onRelayToAndroid, invalid source state: " + androidWs.readyState + ", token: " + androidWs.token);
				}
			}
		} else if(logger) {
			logger.warn(" relay to android failed: " + JSON.stringify(message));

			//onClose(ws);
		}
	} catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

function onClose(ws) {
	try{
		if(logger) logger.info(" onClose, role: " + ws.role + ", token: " + ws.token + ", addr: " + ws.addr);

		var token = ws.token;
		if (!token)
			return;

		//if (ws.deleted)
		//	return;

		switch (ws.role) {
			case 'a':
				{
					try {
						if (ws.pairedSocket) {
							for(var i=0; i<ws.pairedSocket.length; i++){
								sendMessageToClient(ws.pairedSocket[i], new Message('0', 'request', 'c', 'kPhoneDisconnected'));
							}
						}
						socketManager.deletePaired(token);
						socketManager.remove(ws);
					} catch (e) {

					}

					break;
				}

			case 'c':
				{
					var wsList = socketManager.findSocketByToken(token, SocketManager.SOCKET_ROLE.pc);
					var sourceWs = null;
					if(wsList){
						for (var i = 0; i < wsList.length; ++i) {
							if (wsList[i].ws == ws) {
								if(ws.pairedSocket && ws.pairedSocket.length > 0){
									sourceWs = ws.pairedSocket[0];
								}
								socketManager.remove(ws);
								wsList.splice(i, 1);
								break;
							}
						}

						var allDisconnected = false;
						if (wsList && wsList.length == 0){
							socketManager.deletePaired(token);
							allDisconnected = true;
                            
							if(logger) logger.info(" delete client token:" + token);
						}

						if (allDisconnected && sourceWs) {
							if (sourceWs.readyState == SocketManager.SOCKET_STATUS.kOpen) {
								sourceWs.send(new Message('0', 'request', 'a', 'kPCDisconnected').toString());
							} else if(logger) {
								logger.warn(" onClose, invalid source state: " + sourceWs.readyState + ", token: " + sourceWs.token);
							}
						}
					}

					break;
				}
		}
	}catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

function getAddressByWS(ws) {
	try{
		return util.format('%s:%s', ws._socket.remoteAddress, ws._socket.remotePort);
    } catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
}

process.on('uncaughtException', function (err) {
	try{
		if(logger){
			logger.error(' uncaughtException:', err.message)
			logger.error(err.stack)
			logger.error("global uncaughtException")
		}
		process.exit(1)
    } catch (e) {
		if(logger) logger.error('** exception:', e.stack);
	}
})
