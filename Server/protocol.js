//////////////////////////////////////////////////////////////////////////////////////twilio/Nexmo/plivo/voxeo/Asterisk
// packet:
{
    "v": "1.1",			// version
    "type": "request",	// packet type, request or response.
    "id": "0",			// id.
    "to": "c"			// target device, c means send to pc, a means send to android, s means send to server.
    "token": "00ac9484-30a7-4e05-b566-8066647175c8",	// use this token pair with pc and android.
	"cmd": "kCmd",		// command, using k with the prefix. [Notes: This field may be empty].
	"err": "",			// error code. [Notes: This field may be empty].
	"desc": "",			// error description. [Notes: This field may be empty].
	"total": "200",		// the total number of messages.
	"index": "0",		// the index of message.
	"cmprs": "1",		// the data compressed or not.
	"cid": "",			// client id.
    "data": {			// [Notes: This field may be empty].
		
    },
}

// Notes: the data node maybe an object, an array or empty.

// Above the LINKit packet format, all packets must abide by this agreement.
// Base on the above standard protocol, the following packages maybe write shorthand. For example, only wirte cmd and data field.

///////////////////////////////////////////////////////////////////////////////////////
// 1. when web page get all message(contacts, messages, notification) done, will send this command.
"cmd": "kFinished",

// 2. get message failed, will send this command:
"cmd": "kGetContactsFailed",
"cmd": "kGetSMSFailed",
"cmd": "kSynchronized",
"cmd": "KGetNotificationFailed",
"cmd": "KGetPhoneInformationFailed",
"desc": "get contacts failed. (this is optional)",

// 3. get all notification
"cmd": "kGetAllNotification",

// 4. SMS - All messages will be divided into a plurality of packets
"data": [
	{
		"index": "",
		"total": "",
		"name": "Alex",
		"number":"10086",
		"incontact":"0"
		"msg": [],
	},
	{
		"index": "199",
		"total": "200",
		"name": "Alex",
		"number":"15993405845",
		"incontact":"1"
		"msg": [
			{"id":"2211","message":"11","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":1,"time":"1415616003491"},
			{"id":"2210","message":"CXGPRSTC","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":2,"time":"1415615978976"}
		],
	},
	{
		"index": "",
		"total": "",
		"incontact":"0"
		"msg": [
			{"from":"10086","id":"2211","message":"11","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":1,"time":"1415616003491","to":[""]},
			{"from":"","id":"2210","message":"CXGPRSTC","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":2,"time":"1415615978976","to":["10086"]}
		],
	}
	{
		"msg": [
			{"from":"10086","id":"2211","message":"11","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":1,"time":"1415616003491","to":[""]},
			{"from":"","id":"2210","message":"CXGPRSTC","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":2,"time":"1415615978976","to":["10086"]}
		],
	}
]

// delete messages
"data": [
	{
		"number":"10086",
		"msg": ["1415616003491", "1415615978976"]
	},
	{
		"number":"10086",
		"msg": ["1415616003491", "1415615978976"]
	}
],

// phone call
"cmd": "kGetCallHistory"
"cmd": "kNewCall"
"data": [
	{
		"index": "199",
		"total": "200",
		"name": "Alex",
		"number":"15993405845",
		"incontact":"1"
		"msg": [
			{"id":"2211","message":"11","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":1,"time":"1415616003491"},
			{"id":"2210","message":"CXGPRSTC","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":2,"time":"1415615978976"}
		],
	},
]

// facebook
"cmd": "kNewFacebookMsg"
"cmd": "kSendFacebookMsg"
"data": [
	{
		"name": "alex.lu.161",
		"number": "alex.lu.161@chat.facebook.com",
		"incontact":"2",
		"icon":"/icon/linkit.png",
		"msg": [
			{"id":"2211","message":"11","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":1,"time":"1415616003491"},
		],
	},
]

// delete call history
"cmd": "kDeleteCallHistory"
"data": [
	{
		"number":"10086",
		"msg": ["1415616003491", "1415615978976"]
	},
	{
		"number":"10086",
		"msg": ["1415616003491", "1415615978976"]
	}
],

// response of kGetAllNotification
"data": [
	{
		"id": "1",
		"packageName": "com.lenovo.linkit",
		"icon":"/icon/linkit.png",
		"appName": "LINKit",
		"time":"2014.09.02",
		"type": "sys",
		"title": "",
		"desc": "",
		"SMS": "true/false",
	},
	{
		"id": "1",
		"packageName": "com.lenovo.linkit",
		"icon":"/icon/linkit.png",
		"appName": "LINKit",
		"time":"2014.09.02",
		"title": "",
		"desc": "",
	},
],

// 5. new notification
"cmd": "kNewNotification",
"compressed": "0",
"data": [
	{
		"id": "1",
		"packageName": "com.lenovo.linkit",
		"icon":"/icon/linkit.png",
		"appName": "LINKit",
		"time":"2014.09.02",
		"type": "sys",
		"desc": "",
	},
	{
		"id": "1",
		"packageName": "com.lenovo.linkit",
		"icon":"/icon/linkit.png",
		"appName": "LINKit",
		"time":"2014.09.02",
		"type": "sys",
		"desc": "",
	},
],

// 6. delete notification
"cmd": "kDeleteNotification",
"data": ["1", "2"],

// 7. confirm notification
"cmd": "kCfrmNtfcn",
"data": ["1", "2"],

// 8. notification rebuilt
"cmd": "kNtfcnRblt",
"data": ["1", "2"],

// Phone Info
"data":{"currentTime":1415769844766,"deviceid":"863583026661307","mobileName":"MI 2S","phoneNumber":"15989418192","sdkVersion":"16"}

// get contact's avatar
"cmd": "kGetContactAvatar",

// response
"data": [
	{ "number": "138000000", "avatar": "/avatar/fkdfkdjfd.png" },
	{ "number": "138000001", "avatar": "/avatar/fkdfkdjfd.png" },
]

// will send this command to PC when pc disconnected.
"cmd": "kPCDisconnected"

// will send this command to android when android disconnected.
"cmd": "kPhoneDisconnected"

"cmd":"kNewTips",
"data":{
	"index":17,
	"tips":{"en":"Welcome to use LINKit.22222222","cn":"欢迎使用LINKit.2222222"}
}

"cmd": "kNoSMSPermissions"
"cmd": "kSMSPermissions"

"cmd": "kDeviceChanged"

"cmd": "kGetSMSMaxID"
"data": {
	"maxid": 100
}

(定时发)虚拟机端发送latest id的命令包：
{
	"latestRecord":0,
	"cmd":"kSendSmsDbList",
	"cmprs":"0",
	"id":"0",
	"v":"1.1",
	"to":"a",
	"token":"f81d239e-76b9-4782-be83-f071f04d313a",
	"type":"response",
	"index":0
}

虚拟机端发送取所有通知命令包：
{
	"cmd":"kGetAllNotification",
	"id":"0",
	"v":"1.1",
	"to":"a",
	"token":"f81d239e-76b9-4782-be83-f071f04d313a",
	"type":"request",
	"index":0
}

虚拟机端发送取桌面背景命令包：
{
	"cid":"717475734014121",
	"cmd":"kBackgroundImgReqMsg",
	"id":"0",
	"v":"1.1",
	"to":"a",
	"token":"f81d239e-76b9-4782-be83-f071f04d313a",
	"type":"request",
	"index":0
}

虚拟机端发送自己联系人命令包：
{
	"data":[],
	"db":"db_contact",
	"latestRecord":0,
	"cmd":"kSendContactDbList",
	"cmprs":"0",
	"id":"0",
	"v":"1.1",
	"to":"a",
	"token":"f81d239e-76b9-4782-be83-f071f04d313a",
	"type":"response",
	"index":0
}

手机端回复虚拟机端短信包：
 {
	"data": [
	{
		"number":"10086",
		"msg":[
		{
			"time":"1423725983341","message":"尊敬的客户：您发送的指令有误，您可尝试手机登录wap.gd.10086.cn进行业务查询办理，还可本机免费拨打1008611话费查询干线、1008612流量服务干线、1008613优惠干线，随时了解话费、流量和优惠资讯。中国移动","number":"10086","person":0,
			"previd":0,
			"id":1,
			"maxid":0,
			"incontact":false,
			"status":1,
			"thread_id":0,
			"read":true,
			"key":"1423725983341",
			"op":1
		}],
	"index":0,
	"incontact":0,"thread_id":0,"total":0}],
	"cmd":"kSendMessages","cmprs":"0","id":"0","v":"1.1","to":"c","token":"f81d239e-76b9-4782-be83-f071f04d313a","total":"11","type":"request","index":0}
			
手机端发送所有通知
{"data":[{"desc":"管理 REACHit","notificationID":68641,"iconId":2130837564,"icon":"/icons/com.lenovo.reachit_1.png","id":"68641103580472048","packageName":"com.lenovo.reachit","type":"sys","title":"REACHit","time":1430382939357},{"desc":"习近平今日主持召开政治局会议，审议通过《京津冀协同发展规划纲要》等；财政部未来6年将投42亿元支持。","notificationID":2000000,"iconId":2130839218,"icon":"/icons/com.netease.newsreader.activity_394.png","id":"200000040041224748","packageName":"com.netease.newsreader.activity","type":"user","title":"京津冀协同发展纲要审议通过","time":1430382429697},{"desc":"中宣部等公布新闻敲诈案件处理情况：21世纪网停办，理财周报被吊销出版许可证，21世纪经济报道被责令整顿。详情>>","notificationID":2000001,"iconId":2130839218,"icon":"/icons/com.netease.newsreader.activity_394.png","id":"200000140041224748","packageName"

手机端发送联系人：
{"total":"3","to":"c","id":"0","v":"1.1","index":0,"cmd":"kGetAllContacts","cmprs":"0","token":"f81d239e-76b9-4782-be83-f071f04d313a","data":[{"phonenumbers":"13579251113","person":1,"hasphoto":false,"hasmessage":0,"photoid":0,"name":"陈芳"}],"type":"response"}

手机端登录后发给PC帐号信息
cmd: kAccountInfo
data: { "type": "", uid: "user id", "usrnm": "username", "nknm": "nickname" }

cmd: kCfrmAcntIf
