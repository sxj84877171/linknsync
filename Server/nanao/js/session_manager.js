/**
 * Created by JERRY on 12/23/2014.
 */

//define top level namespace
var LINKit_SessionManager;
if(!LINKit_SessionManager) LINKit_SessionManager = {};

//define interface namespace
LINKit_SessionManager.interfaces = {};
//define concrete class namespace
LINKit_SessionManager.impelement = {};

function inherit(p){
    if(p == null){
        throw TypeError();          //p is a object, but can not be null
    }
    if(Object.create){
        return Object.create(p);    //if Object.create function existed, use it directly.
    }

    var t = typeof p;
    if(t != 'object' && t != 'function'){
        throw TypeError();
    }

    function f() {};
    f.prototype = p;
    return new f();
}

function abstractmenthod() {throw new Error('abstract method');}

LINKit_SessionManager.interfaces.ISessionListener = function(){throw new Error("can't instantiate abstract class")};
LINKit_SessionManager.interfaces.ISession = function(){throw new Error("can't instantiate abstract class")};

//ISessionListener interface:
//ISessionListener used to monitor the state of session between web client and server including connection, data transmission etc.
LINKit_SessionManager.interfaces.ISessionListener.prototype.onOpen = abstractmenthod;
LINKit_SessionManager.interfaces.ISessionListener.prototype.onMessage = abstractmenthod;
LINKit_SessionManager.interfaces.ISessionListener.prototype.onError = abstractmenthod;
LINKit_SessionManager.interfaces.ISessionListener.prototype.onClose = abstractmenthod;
LINKit_SessionManager.interfaces.ISessionListener.prototype.onPaired = abstractmenthod;//手机，pc配对成功


//ISession interface:
//ISession defines the basic method of session.
LINKit_SessionManager.interfaces.ISession.prototype.init = abstractmenthod;
LINKit_SessionManager.interfaces.ISession.prototype.connect = abstractmenthod;
LINKit_SessionManager.interfaces.ISession.prototype.reconnect = abstractmenthod;
LINKit_SessionManager.interfaces.ISession.prototype.close = abstractmenthod;
LINKit_SessionManager.interfaces.ISession.prototype.send = abstractmenthod;
LINKit_SessionManager.interfaces.ISession.prototype.tipsURL = abstractmenthod;

LINKit_SessionManager.impelement.SessionLister = function() {};
LINKit_SessionManager.impelement.CWebsocketSession = function() {};
LINKit_SessionManager.impelement.CCouchBaseSession = function() {};

//SessionLister: the concrete class of ISessionListener.
//User need to extend SessionLister in their code to implement the abstract method of ISessionListener.
LINKit_SessionManager.impelement.SessionLister.prototype = inherit(LINKit_SessionManager.interfaces.ISessionListener.prototype);
LINKit_SessionManager.impelement.SessionLister.constructor = LINKit_SessionManager.impelement.SessionLister;

//CWebsocketSession: session implementation based on Web Socket.
LINKit_SessionManager.impelement.CWebsocketSession.prototype = inherit(LINKit_SessionManager.interfaces.ISession.prototype);
LINKit_SessionManager.impelement.CWebsocketSession.prototype = {
    constructor : LINKit_SessionManager.impelement.CWebsocketSession,

    init : function(sessionListener){
        this.sessionListener = sessionListener;
        this.ws = null;
        this.hostUrl = null;
    },

    connect : function(hostUrl){
        this.close();

        this.hostUrl = hostUrl;
        if ('WebSocket' in window) {
            this.ws = new WebSocket(this.hostUrl);
        } else if ('MozWebSocket' in window) {
            this.ws = new MozWebSocket(this.hostUrl);
        } else {
            throw new Error('WebSocket is not supported by this browser.');
        }

        if(this.sessionListener){
            this.ws.onopen = this.sessionListener.onOpen;
            this.ws.onmessage = this.sessionListener.onMessage;
            this.ws.onclose = this.sessionListener.onClose;
            this.ws.onerror = this.sessionListener.onError;
        }
    },

    reconnect : function(times){
        if (this.ws != null) {
            this.ws.close();
        }
        this.ws = null;
        this.connect(this.hostUrl);
    },

    close : function(code){
        if (this.ws != null) {
            if(typeof(this.ws.close) == "function"){
                try{
                    this.ws.close(code ? code : 1000);
                }catch(err){
                    throw new Error(err);
                }
            }
            this.ws = null;
        }
    },

    send: function(stringVal){
        if(this.ws){
            this.ws.send(stringVal);
        } else {
            throw new Error('WebSocket is not instanced');
        }
    },
	
	tipsURL: function(){
		return "/tips/query";
	}
}


//CCouchBaseSession: session implementation based on REST API of couchbase.
LINKit_SessionManager.impelement.CCouchBaseSession.prototype = inherit(LINKit_SessionManager.interfaces.ISession.prototype);
LINKit_SessionManager.impelement.CCouchBaseSession.prototype = {
    constructor : LINKit_SessionManager.impelement.CCouchBaseSession,

    init : function(sessionListener){
        this.sessionListener = sessionListener;
        this.hostUrl = null;
        this.onopen = null;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
        this.changeLastSeq = 0;

        this.dataChannel = null;
        this.cmdChannel = null;
    },

    connect : function(hostUrl, qrcode, lenovoid){
        this.close();

        this.hostUrl = hostUrl;

        if(this.sessionListener){
            this.onopen = this.sessionListener.onOpen;
            this.onmessage = this.sessionListener.onMessage;
            this.onclose = this.sessionListener.onClose;
            this.onerror = this.sessionListener.onError;
            this.onpaired = this.sessionListener.onPaired;
        }

		this.onopen();
        //手机扫描二维码后，会以二维码创建握手channel,获取握手channel,然后得到数据channel和命令channel
		if(qrcode){
			this.getDataChannel(qrcode);
		}
		if(lenovoid){
			this.getDataChannel("lenovoid" + lenovoid);
		}
    },

    reconnect : function(times){

    },

    close : function(code){

    },

    send: function(stringVal){
		var data = {
			'pkg' : stringVal,
            'channels': this.cmdChannel,
            'created_at': 'pc'
		}
        this.createDocument(data, function(ret){
		});
    },
	
	tipsURL: function(){
		return "/couch_tips/query";
	},

    //private function
    monitorChanges : function(since, channels, callback){
        var url = "/_changes";
        var c = "?";
        if(since){
            url = url + c + "since=" + since;
            c = "&";
        }
        if(channels){
            url = url + c + "channels=" + channels;
            c = "&";
        }
		//url = url + c + "limit=2";
		$.ajax({
				type: "get",
				url: url,
				success:callback,
				error:function(){
				},
				cache:false});
    },

    monitorDB : function(channels){
		var This = this;
        this.monitorChanges(This.changeLastSeq, channels, function(result){
            if(result && result.length){
				var jsonResult = JSON.parse(result);
				var changes = jsonResult.results;
				This.changeLastSeq = jsonResult.last_seq;
				
				if(changes && changes.length > 0){
					This.translateData(changes, 0);
				}
				/*for(var row in changes) {
					var data = changes[row];

					This.getDocument(data.id, function(record){
						var rcd = JSON.parse(record);
						var event = {};
						event.data = rcd.package;
						This.onmessage(event);
					})
				};*/
			}
			setTimeout(function(){This.monitorDB(channels)}, 1000);
        });
    },
	
	//发送数据到应用层
	translateData : function(changes, index){
		if(changes && changes.length > 0 && changes.length > index){
			var data = changes[index];
			var This = this;
			this.getDocument(data.id, function(record){
							var rcd = JSON.parse(record);
							var event = {};
							event.data = rcd.pkg;
							This.onmessage(event);
							This.translateData(changes, index+1);
						});
		}
	},

    getDataChannel: function(handshakeChannel){
		var This = this;
		
		if(!This.dataChannel){
			this.getDocument(handshakeChannel, function(result){
				var ret = JSON.parse(result);
				This.dataChannel = ret.datachannel;
				if(This.dataChannel){
					This.cmdChannel = ret.cmdchannel;

					This.onpaired();
					This.monitorDB(This.dataChannel);
					This.clearDataChannel(handshakeChannel);
				} else{
					setTimeout(function () {This.getDataChannel(handshakeChannel)}, 500);
				}
			})
		} else {
			This.clearDataChannel(handshakeChannel);
		}
    },
	
	//清空握手channel的status, dataChannel属性，以便web刷新重新获取数据
	clearDataChannel : function(handshakeChannel){
		var content = {
					"status" : 0,
					"datachannel": null
				};
		this.updateDocument(handshakeChannel, content, function(result){
				});
	},
	
	updateDocument : function(docID, data, callback){
		//先查询该doc是否存在，存在则获取doc的最新修改版本rev,用它作为键值来修改doc
		var This = this;
		this.getDocument(docID, function(result){
			var ret = JSON.parse(result);
			if(ret._rev){
				for(var p in data){
					ret[p] = data[p];
				}
				var url_doc = "/_newdoc?id=" + docID + "&data="+ JSON.stringify(ret) + "&rev=" + ret._rev;
				$.ajax({
					type: "get",
					url: url_doc,
					success:callback,
					error:function(){
					},
					cache:false});
			}
		});
	},

    //创建doc,不指定doc id,由couchbase自动生成id
    createDocument : function (data, callback) {
        var url_doc = "/_newdoc?data="+ JSON.stringify(data);
		$.ajax({
				type: "get",
				url: url_doc,
				success:callback,
				error:function(){
				},
				cache:false});
    },

    getDocument: function(docID, callback){
        var url_doc = "/_doc?id=" + docID;
		$.ajax({
				type: "get",
				url: url_doc,
				success:callback,
				error:function(){
				},
				cache:false});
    }
}

var SESSION_TYPE = {
    ST_WEBSOCKET:0,
    ST_HTTP:1,
    ST_COUCHBASE:2
};

LINKit_SessionManager.impelement.createSession = function(session_type){
    var session = null;
    switch (session_type){
        case SESSION_TYPE.ST_WEBSOCKET:
            session = new LINKit_SessionManager.impelement.CWebsocketSession();
            break;
        case SESSION_TYPE.ST_COUCHBASE:
            session = new LINKit_SessionManager.impelement.CCouchBaseSession();
            break;
        default :
            break;
    }
    return session;
}


if(typeof module!=="undefined"&&module!=null)
{
    module.exports = LINKit_SessionManager;
}