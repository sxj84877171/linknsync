function AndroidVM(){
};

function fillFolderItem(id, level, name) {
	var folder = {
		"id": id,
		"level": level,
		"type": "folder", //type: folder, app
		"name": name,
		"imgurl": "",
		"downloadurl": "",
		"children": []
	};
	
	return folder;
}

function fillAppItem(id, level, name, packagename, img, url) {
	var app = {
		"id": id,
		"level": level,
		"type": "app", //type: folder, app
		"name": name,
		"packagename": packagename,
		"imgurl": img,
		"downloadurl": url,
		"children": []
	};
	
	return app;
}

function fillHideItem(packagename, id, name) {
	var item = {
		"id": id,
		"type": "app",
		"name": name,
		"packagename": packagename
	};
	
	return item;
}

AndroidVM.prototype.getAPPList = function(req, res){
	var applist = {};
	applist.code = 1;
	applist.msg = "app list";
	applist.list = [];
	applist.hidelist = [];
	
    // 我的应用
	var myapps = fillFolderItem(1, 0, "我的应用");
	
	// QQ
	var app = fillAppItem(1001,
							1,
							"QQ",
							"com.tencent.mobileqq",
							"http://thelinkit.com/vm/qq.png",
							"http://dd.myapp.com/16891/B5304B1B3A040D12FAD1FB74AB6AD366.apk?fsname=com.tencent.mobileqq_5.5.1_236.apk&asr=8eff");
	myapps.children.push(app);
	
	// QQ音乐
	app = fillAppItem(1002,
						1,
						"QQ音乐",
						"com.tencent.qqmusic",
						"http://thelinkit.com/vm/qqmusic.png",
						"http://dd.myapp.com/16891/881ED0BA055B7B12F47CB8ACE246D9F1.apk?fsname=com.tencent.qqmusic_5.1.1.0_216.apk&asr=8eff");
	myapps.children.push(app);

	// Evernote
	app = fillAppItem(1003,
						1,
						"Evernote",
						"com.evernote",
						"http://thelinkit.com/vm/evernote.png",
						"http://dd.myapp.com/16891/75554FE4BA01FAEA86BEEF6B7915B67E.apk?fsname=com.evernote_7.0.2_1070230.apk&asr=8eff");
	myapps.children.push(app);

	// 同花顺
	app = fillAppItem(1004,
						1,
						"同花顺",
						"com.hexin.plat.android",
						"http://thelinkit.com/vm/sequence.png",
						"http://dd.myapp.com/16891/63404E9B9618031A04511731A0CD67ED.apk?fsname=com.hexin.plat.android_V8.94.01_3500.apk&asr=8eff");
	myapps.children.push(app);

	// 腾讯视频
	app = fillAppItem(1005,
						1,
						"腾讯视频",
						"com.tencent.qqlive",
						"http://thelinkit.com/vm/qqvideo.png",
						"http://113.105.73.150/dd.myapp.com/16891/B08BEDF4B998C6B581D4A307FA3E8EF7.apk?mkey=553f6e341466342f&f=2434&fsname=com.tencent.qqlive_3.9.6.6991_6991.apk&asr=8eff&p=.apk");
	myapps.children.push(app);

	// iReader
	app = fillAppItem(1006,
						1,
						"iReader",
						"com.chaozh.iReaderFree",
						"http://thelinkit.com/vm/iReader.png",
						"http://121.15.220.153/dd.myapp.com/16891/A31A7E53B16159B36C1B07F5F5F32F1B.apk?mkey=553f6e181466342f&f=950e&fsname=com.chaozh.iReaderFree_4.1.0_412.apk&asr=8eff&p=.apk");
	myapps.children.push(app);

	// 京东
	app = fillAppItem(1007,
						1,
						"京东",
						"com.jingdong.app.mall",
						"http://thelinkit.com/vm/jd.png",
						"http://121.15.220.150/dd.myapp.com/16891/0123AF988B1694A3D75B81A64FF2DAD0.apk?mkey=553f6ff41466342f&f=a10e&fsname=com.jingdong.app.mall_4.1.1_17507.apk&asr=8eff&p=.apk");
	myapps.children.push(app);
	
    // 插入我的应用
	applist.list.push(myapps);

    // 我的游戏
	var mygmaes = fillFolderItem(2, 0, "我的游戏");
	
    // 植物大战僵尸2
	var app = fillAppItem(2001,
							1,
							"植物大战僵尸",
							"com.popcap.pvz2cthdwdj",
							"http://thelinkit.com/vm/plant.png",
							"http://113.107.56.90/m.wdjcdn.com/apk.wdjcdn.com/f/ba/109c3dad73355bce6f90d919b1ddbbaf.apk");
	mygmaes.children.push(app);
	
    // 天天消星星
	app = fillAppItem(2002,
						1,
						"天天消星星",
						"com.telegame.samegame",
						"http://thelinkit.com/vm/stars.png",
						"http://fast.yingyonghui.com/26e9e4a3ac2cc45274e54aaa7e399180/5541b226/apk/2663476/com.telegame.samegame.1427256003395.apk");
	mygmaes.children.push(app);

    // 插入我的游戏
	applist.list.push(mygmaes);

    // 插入直接安装在桌面上的应用

    // 想手机
	app = fillAppItem(3001,
                    0,
                    "想手机",
                    "com.lenovo.xphonevm.searchphone",
                    "http://thelinkit.com/vm/sp.png",
                    "http://thelinkit.com/xp/SearchPhone.apk");
	applist.list.push(app);

    // 乐商店
	app = fillAppItem(3002,
                0,
                "乐商店",
                "com.lenovo.leos.appstore",
                "http://thelinkit.com/vm/lestore.png",
                "http://apk.lenovomm.com/201504291557/5b7b94015f4cc53fb829ce049b76e3f2/dlserver/fileman/apk/downloadlenovostore/com.lenovo.leos.appstore_70020_12346_1429619425616.apk?v=5&clientid=");
	applist.list.push(app);

	//var item1 = {};
	//item1.id = 1;
	//item1.level = 0;
	//item1.type = "folder"; //type: folder, app
	//item1.name = "我的游戏";
	//item1.imgurl = "";
	//item1.downloadurl = "";
	//item1.children = [];
	
	//var app1 = {};
	//app1.id = 1001;
	//app1.level = 1;
	//app1.type = "app"; //type: folder, app
	//app1.name = "部落冲突";
	//app1.packagename="com.supercell.clashofclans";
	//app1.imgurl = "http://thelinkit.com/vm/coc.png";
	//app1.downloadurl = "http://resget.91.com/Soft/Controller.ashx?action=download&tpl=1&id=41409454";
	//app1.children = [];
	
	//var app2 = {};
	//app2.id = 1002;
	//app2.level = 1;
	//app2.type = "app"; //type: folder, app
	//app2.name = "Flappy Bird";
	//app2.packagename="com.qiyou.goodluckbird";
	//app2.imgurl = "http://thelinkit.com/vm/Flappy_bird.png";
	//app2.downloadurl = "http://gdown.baidu.com/data/wisegame/be42f0176db6dd35/FlappyBird2_1.apk";
	//app2.children = [];
	
	//item1.children.push(app1);
	//item1.children.push(app2);
	
	//var item2 = {};
	//item2.id = 1003;
	//item2.level = 0;
	//item2.type = "app"; //type: folder, app
	//item2.name = "酷我音乐";
	//item2.packagename="cn.kuwo.player";
	//item2.imgurl = "http://thelinkit.com/vm/cuwo.png";
	//item2.downloadurl = "http://down.shouji.kuwo.cn/star/mobile/KuwoPlayerV3_6.7.4.0_kw.apk";
	//item2.children = [];
	
	//var item3 = {};
	//item3.id = 1004;
	//item3.level = 0;
	//item3.type = "app"; //type: folder, app
	//item3.name = "想手机";
	//item3.packagename="com.lenovo.xphonevm.searchphone";
	//item3.imgurl = "http://thelinkit.com/vm/sp.png";
	//item3.downloadurl = "http://thelinkit.com/xp/SearchPhone.apk";
	//item3.children = [];
	
	//applist.list.push(item1);
	//applist.list.push(item2);
	//applist.list.push(item3);
	
	//var hideItem1 = {};
	//hideItem1.id = 2001;
	//hideItem1.type = "app";
	//hideItem1.name = "酷我音乐";
	//hideItem1.packagename ="cn.kuwo.player";
	//applist.hidelist.push(hideItem1);
	
	var hideItem2 = {};
	hideItem2.packagename ="com.lenovo.xphonevm.searchphone";
	applist.hidelist.push(hideItem2);
	
	var hideItem3 = {};
	hideItem3.packagename ="com.lenovo.leos.appstore";
	applist.hidelist.push(hideItem3);

    res.send(JSON.stringify(applist));
}

module.exports = AndroidVM;