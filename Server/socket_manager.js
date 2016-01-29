
var log4js = require('log4js');
var logger = log4js.getLogger('normal');
var SOCKET_ROLE = {
	pc : "c",
	phone: "a"
}

var SOCKET_STATUS = {
	kConnecting : 0,
	kOpen : 1,
	kClosing : 2,
	kClosed : 3
}

function SocketManager() {
	/*
	sockets存储websocket对象，并且该对象扩展的属性有
	role: a/c
	pairedSocket: [ws1,ws2...]	//与其配对的websocket, role为a则为手机跟server的websocket,反之亦然。
	localAddr:xxx				//客户端地址，当设备在同一个局域网时，用来走tcp链接用
	deviceid:					//客户端唯一标示码
	public_ip:					//公网ip,用来判断是否同一个局域网
	dbid:						//手机端数据库id, role为a时有意义
	name:						//手机设备名，role为a时有意义
	*/
    this.sockets = [];
	//已配对的连接，key为token，value为{ status: 'kPaired' }
	this.pairedSockets = {};
	
	this.closeHandle = null;
}

SocketManager.prototype.add = function (ws) {
	try{
		this.sockets.push(ws);
	}
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
}

SocketManager.prototype.remove = function (ws) {
    try{
		var wsInfo = this.findSocketByObject(ws);
		if(wsInfo.index >= 0){
			//解除配对关系
			this.unpaired(wsInfo.ws);
			this.sockets.splice(wsInfo.index, 1);
		}
	}
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
}

//pc, phone两端连服务器的socket进行配对绑定
SocketManager.prototype.paired = function(token, wsLeft, wsRight){
	try{
		if(wsLeft && wsRight){
			if(wsLeft.pairedSocket){
					wsLeft.pairedSocket.push(wsRight);
			} else {
				wsLeft.pairedSocket = [];
				wsLeft.pairedSocket.push(wsRight);
			}
			
			if(wsRight.pairedSocket){
					wsRight.pairedSocket.push(wsLeft);
			} else {
				wsRight.pairedSocket = [];
				wsRight.pairedSocket.push(wsLeft);
			}
			this.pairedSockets[token] = { status: 'kPaired' };
		}
	} 
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
}

//解除pc, phone两端连服务器的socket的配对关系
SocketManager.prototype.unpaired = function(ws){
	try{
		if(ws && ws.pairedSocket){
			for(var i=0; i<ws.pairedSocket.length; i++){
				var pairedWs = ws.pairedSocket[i];
				if(pairedWs && pairedWs.pairedSocket){
					for(var j=0; j<pairedWs.pairedSocket.length; j++){
						if(pairedWs.pairedSocket[j] == ws){
							pairedWs.pairedSocket.splice(j, 1);
							break;
						}
					}
				}
			}
			ws.pairedSocket = [];
		}
	} 
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
}

//使用websocket对象来查找
SocketManager.prototype.findSocketByObject = function (ws) {
	var wsInfo = {};
	try{
		var index = this.sockets.indexOf(ws);
		wsInfo.index = index;
		wsInfo.ws = null;
		if(index != -1){
			wsInfo.ws = this.sockets[index];
		}
	}
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
	finally{
		return wsInfo;
	}
}

//使用token字符串来查找, 由于1个手机支持多个客户端，所以通过token查找会找到多个socket
SocketManager.prototype.findSocketByToken = function (token, role) {
	var wsList = [];
	try{
		//for in性能慢，会遍历原型连上的属性
		for(var i = 0, l = this.sockets.length; i < l; i++) {
			var wsInfo = {};
			wsInfo.index = -1;
			wsInfo.ws = null;
			var ws = this.sockets[i];
			
			if(ws && ws.token && ws.role && ws.token == token && ws.role == role){
				wsInfo.index = i;
				wsInfo.ws = this.sockets[i];
				wsList.push(wsInfo);
			}
		}
	}
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
	finally{
		return wsList;
	}
}

//获取pc，手机端连上服务器的连接数量
SocketManager.prototype.getConnectionCounts = function () {
	var count = {"pc" : 0, "phone" : 0, "paired" : 0};
	try{
		for(var i=0; i<this.sockets.length; i++){
			if(this.sockets[i]){
				var role = this.sockets[i].role;
				if(role == SOCKET_ROLE.pc){
					count.pc++;
				} else if(role == SOCKET_ROLE.phone) {
					count.phone++;
				}
			}
		}
	}
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
	
	return count;
}

//获取已配对的连接数量
SocketManager.prototype.getPairedCounts = function () {
	try{
		var count = 0;
		for (var token in this.pairedSockets) {
			++count;
		}
		return count;
	}
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
}

//删除配对统计
SocketManager.prototype.deletePaired = function(token){
	try{
		delete this.pairedSockets[token];
	}
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
}

//定时检查各个socket是否有效
SocketManager.prototype.checkSocketsAlive = function(){
	try{
		if(logger) logger.info("checkSocketsAlive ");
		var tm = new Date().getTime();
		var invalidSocket = [];
		for(var i=0; i<this.sockets.length; i++){
			var socket = this.sockets[i];
			if(logger) logger.info("socket info:token:%s role:%s，statue:%s: idle time:%dmin", socket.token, socket.role,  socket.readyState, (tm - socket.heartbeat)/60000);
			if(!socket || socket.readyState != SOCKET_STATUS.kOpen ){
				invalidSocket.push(socket);
			}
			
			//超过3分钟没收到新数据包，也断开该socket
			if(socket.heartbeat && tm - socket.heartbeat > 1000 * 60 * 3){
				invalidSocket.push(socket);
			}
		}
		
		for(var i=0; i<invalidSocket.length; i++){
			if(logger) logger.warn("socket invalid, so close it, token:" + invalidSocket[i].token);
			
			if(this.closeHandle){
				this.closeHandle(invalidSocket[i]);
			}
			invalidSocket[i].close(1000);
		}
		
		if (this.timeout) { clearTimeout(this.timeout); }
		var This = this;
		this.timeout = setTimeout(function(){
			This.checkSocketsAlive();
		}, 1000*60);
	}
	catch (e){
		if(logger)  logger.error('** exception:', e.stack);
	}
}

module.exports = SocketManager;
module.exports.SOCKET_ROLE = SOCKET_ROLE;
module.exports.SOCKET_STATUS = SOCKET_STATUS;
