//var disConnect      = null;
var contactBox		= null;
var messagePanel	= null;
var contactPanel	= null;
var callPanel		= null;
var notificationPanel = null;
var blessingPanel	= null;
var loginPanel		= null;

var navigationBar	= null;
var sessionLister	= null;
var connectManager	= null;
var contactManager	= null;
var mainUI			= null;
var notificationManager = null;
var clientID		= null;

$(function(){	
	change_language();
	
	clientID = getToken();
	
	// 格式化日期函数，方便以后调用
	Date.prototype.format = function(format) {
		var o = {
			"M+" : this.getMonth() + 1, //month
			"d+" : this.getDate(), //day
			"h+" : this.getHours(), //hour
			"m+" : this.getMinutes(), //minute
			"s+" : this.getSeconds(), //second
			"q+" : Math.floor((this.getMonth() + 3) / 3), //quarter
			"S" : this.getMilliseconds() //millisecond
		};
		if (/(y+)/.test(format))
			format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
		if (new RegExp("(" + k + ")").test(format))
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
		return format;
	};
	/*
	Array.prototype.isIn = function(e)  
	{  
		for(i=0;i<this.length && this[i]!=e;i++);  
		return !(i==this.length);  
	};
	
	Array.prototype.remove = function(dx) 
	{ 
		if(isNaN(dx)||dx>this.length){return false;} 
		for(var i=0,n=0;i<this.length;i++) 
		{ 
			if(this[i]!=this[dx]) 
			{ 
				this[n++]=this[i] 
			} 
		} 
		this.length-=1 
	}; */

	//添加字符串是否匹配函数
	RegExp.prototype.isMatch = function(string) {
		this.lastIndex = 0;
		return this.test(string);
	};
	//添加字符串去空格函数
	String.prototype.sTrim = function() {
		return this.replace(new RegExp("\\s+", 'g'), "");
		//.replace(new RegExp("-", 'g'),"");
	};
	
	String.prototype.encodeHtml = function(){
        return this.replace(/"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g,
                      function($0){
                          var c = $0.charCodeAt(0), r = ["&#"];
                          c = (c == 0x20) ? 0xA0 : c;
                          r.push(c); 
						  r.push(";");
                          return r.join("");
                      });
	};
		
	String.prototype.decodeHtml = function(){
		var HTML_DECODE = {
				"&lt;" : "<",
				"&gt;" : ">",
				"&amp;" : "&",
				"&nbsp;": " ",
				"&quot;": "\"",
				"&copy;": ""
				// Add more
			};
		return this.replace(/&\w+;|&#(\d+);/g,
					  function($0, $1){
						  var c = HTML_DECODE[$0];
						  if(c == undefined){
							  // Maybe is Entity Number
							  if(!isNaN($1)){
								  c = String.fromCharCode(($1 == 160) ? 32:$1);
							  }else{
								  c = $0;
							  }
						  }
						  return c;
					  });
	};
	

	$.convert = function(input, mode) {
		emoji.text_mode = mode == 'text';
		if (mode == 'plain') {
			emoji.replace_mode = 'unified';
		}

		if (mode == 'css') {
			emoji.replace_mode = 'css';
		}
		return emoji.replace_colons(input);
	};
	
	$.replaceUnified = function(input) {
		emoji.init_colons();
		emoji.text_mode = false;
		emoji.replace_mode = 'css';
		return emoji.replace_unified(input);
	/*	return input;*/
	};

	$.alert = function(text) {
		return vex.dialog.alert(text);
	};

	$.confirm = function(text) {
		return vex.dialog.confirm(text);
	};
	
	$.confirmYN = function(text){
		
		vex.dialog.buttons.YES.text = lang == null ? "是" : lang.linkit.yes;
		vex.dialog.buttons.NO.text = lang == null ? "否" : lang.linkit.no;
		return vex.dialog.confirm(text);
	}

	$.prompt = function(text) {
		return vex.dialog.prompt(options);
	};

	$.open = function(text) {
		return vex.dialog.open(text);
	};
	
	//获取名字的第一个字符，中文取拼音第一个字母
	$.getNameFirstChar = function(name){
		//Chinese to Pinyin
		var pinyin = Pinyin.getFullChars(name);
		
		var firstChar = pinyin.length>0 ? pinyin[0] : '';
		firstChar = firstChar.toUpperCase();
		if(firstChar != null && (firstChar == '+' || (firstChar >=0 && firstChar <= 9))){
			//the phonenumber string which begin with (0~9, +) char will be appended to end.
			var z = 'z';
			var zCode = z.charCodeAt(0);
			var firstCharCode = firstChar.charCodeAt(0) + zCode;
			firstChar = String.fromCharCode(firstCharCode);
		}
		return firstChar;
	}
	
	function MyLog(/*...*/){
		if(typeof(window.external) != "undefined" && typeof(window.external.PC) == "undefined")
		{
			var str = "";
			for(var i=0; i<arguments.length; i++){
				str += arguments[i];
			}
			console.log(str);
		}
	}
	
	function getStyle(obj, attr)
	{
		return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, false)[attr];
	}
	
	function TimeTest(){
		this.sendQRCode = 0 ;
		this.getAllContacts = 0;
		this.getAllMessage = 0;
	}
	
	function Disconnect()
	{
		this.$myheader_box_1 = $('#myheader_box_1');
		this.$reconnect = $('#myheader_box_1 .reconnect')
		this.$reconnect_phone = $('#myheader_box_3 .reconnect')
		this.$myheader_box_2 = $('#myheader_box_2');
		this.$myheader_box_3 = $('#myheader_box_3');
		this.$backhome = $('.backhome');
		this.$myheader = $('#myheader');
		this.$html_normal = $('.html_normal');
		this.$body_normal = $('.body_normal');
		this.oTimer = null;
		//this.showDisconnectWindow();
		this.stopPropagation();
	}
	
	Disconnect.prototype.phoneDisconnect = function()
	{
		this.$myheader.removeClass('myheader');
		this.$body_normal.removeClass('body_normal');
		this.$html_normal.removeClass('html_normal');
		this.$html_normal.addClass('html_offline');
		this.$body_normal.addClass('body_offline');
		this.$myheader.addClass('myheader_offline');
		this.$myheader_box_3.show();
		this.$reconnect_phone.click(function(){
			window.location.reload(true);
		});
	}
	
	Disconnect.prototype.pcDisconnect = function()
	{
		var This = this;
		this.$myheader.removeClass('myheader');
		this.$body_normal.removeClass('body_normal');
		this.$html_normal.removeClass('html_normal');
		this.$html_normal.addClass('html_offline');
		this.$body_normal.addClass('body_offline');
		this.$myheader.addClass('myheader_offline');
		this.$myheader_box_1.show();
		this.$reconnect.unbind('click');
		this.$reconnect.click(function(){
			This.hide(This.$myheader_box_1);
			This.$myheader_box_2.fadeIn();
			setTimeout(function(){
				This.$myheader_box_2.fadeOut();
			},2000);
			connectManager.connect();
		});
	}
	
	Disconnect.prototype.hide = function(obj)
	{
		this.$myheader.removeClass('myheader_offline');
		this.$body_normal.removeClass('body_offline');
		this.$html_normal.removeClass('html_offline');
		this.$html_normal.addClass('html_normal');
		this.$body_normal.addClass('body_normal');
		this.$myheader.addClass('myheader');
		obj.hide();	
	}
	Disconnect.prototype.dismissPanel = function(obj)
	{
		this.$myheader_box_1.fadeOut();
		this.$myheader_box_2.fadeOut();
		this.$myheader_box_3.fadeOut();
	}
	Disconnect.prototype.stopPropagation = function()
	{
		$("#myheader_box_3 .backhome a").click(function(event) {
			event.stopPropagation();
		});
		$("#myheader_box_1 .backhome a").click(function(event) {
			event.stopPropagation();
		});
	}
	Disconnect.prototype.showDisconnectWindow = function(obj)
	{
		var This = this;
		this.$myheader.click(function(){
			if($(this).hasClass('myheader_offline'))
			{
				This.$myheader_box_3.show();
			}
			else
			{
				This.$myheader_box_2.show();
			}
			return false;
		});
	}
	var timeTest = new TimeTest();
	function ContactBox(){
		this.is_contact_box_show = false;
	};

	/*********NavigationBar class begin**********/
	function NavigationBar(){};

	NavigationBar.prototype.init = function(){
		this.myheader = $('#myheader');
		this.tab_sms = $('#tab_sms');
		this.tab_contact = $('#tab_contact');
		this.tab_call = $('#tab_call');
		this.tab_notice = $('#tab_notice');
		this.tab_sheep = $('#tab_sheep');
		this.link_connect = $('#link_connect');
		this.tab_feedback = $('#tab_feedback');
		this.feedback_box = $('.feedback_box');
		this.feedback_box_content = $('.feedback_box_content');
		this.feedBack_content_msg = $('.feedBack_content_msg');
		this.feedback_cancel = $('.feedback_btn .feedback_cancel');
		this.feedback_canfirm = $('.feedback_btn .feedback_canfirm');
		this.success_box = $('.success_box');
		this.success_box_canfirm = $('.success_box_canfirm');
		
		this.bTrue = true;
		
		
		this.tab_sms.addClass('tab_sms_selected');
		
		this.currentTab = LINKit_CONST.PANEL_TYPE.LOGIN;
		this.currentPanel = null;
		this.panelArray = [];
		//this.barItemClickHandle();
		this.switchPanel(this.currentTab);
		
		this.msgUnread = $('.tab_sms .unread');
		this.ntfUnread = $('.tab_notice .unread');
		
		this.msgUnread.hide();
		this.ntfUnread.hide();
		this.tabClick();
		this.cancelBubbleForFreedBack();
		this.sentFreedBack();
		this.cancelFreedBack();
		
	}

	NavigationBar.prototype.addPanel = function(/*...*/){
		for(var i=0; i<arguments.length; i++){
			this.panelArray.push(arguments[i]);
		}
	}

	NavigationBar.prototype.clear = function(){
		this.ntfUnread.hide();
		this.msgUnread.html('');
		for(var i in this.panelArray){
			this.panelArray[i].clear();
		}
	}

	NavigationBar.prototype.barItemClickHandle = function(){
		this.myheader.click(function(){navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.LOGIN);});
		this.tab_sms.click(function(){navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.MESSAGE);});
		this.tab_contact.click(function(){navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.CONTACT); });
		this.tab_call.click(function(){navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.CALL); });
		this.tab_notice.click(function(){navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.NOTIFICATION); });
		this.tab_sheep.click(function(){navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.BLESSING); });
	}
	
	NavigationBar.prototype.switchPanel = function(panelType){
		this.tab_sms.removeClass('tab_sms_selected');
		this.tab_contact.removeClass('tab_contact_selected');
		this.tab_call.removeClass('tab_call_selected');
		this.tab_notice.removeClass('tab_notice_selected');
		this.tab_sheep.removeClass('tab_sheep_selected');
		
		switch(panelType){
			case LINKit_CONST.PANEL_TYPE.MESSAGE:
				this.tab_sms.addClass('tab_sms_selected');
				break;
			case LINKit_CONST.PANEL_TYPE.CONTACT:
				this.tab_contact.addClass('tab_contact_selected');
				break;
			case LINKit_CONST.PANEL_TYPE.CALL:
				this.tab_call.addClass('tab_call_selected');
				break;
			case LINKit_CONST.PANEL_TYPE.NOTIFICATION:
				this.tab_notice.addClass('tab_notice_selected');
				break;
			case LINKit_CONST.PANEL_TYPE.BLESSING:
				this.tab_sheep.addClass('tab_sheep_selected');
				this.tab_sheep.find('.new').hide();
				break;
		}
		this.currentPanel = this.findPanel(panelType);
		if(this.currentPanel){
			for(var i in this.panelArray){
				this.panelArray[i].hide();
			}
			this.currentTab = panelType;
			this.currentPanel.show();
		}
	}
	
	NavigationBar.prototype.panelType = function(){
		return this.currentTab;
	}

	NavigationBar.prototype.findPanel = function(panelType){
		for(var i in this.panelArray){
			if(this.panelArray[i].panelType == panelType){
				return this.panelArray[i];
			}
		}
		return null;
	}

	//dataChangeType: LINKit_CONST.DATA_CHANGE
	NavigationBar.prototype.refresh = function(dataChangeType, contact){
		if(dataChangeType == LINKit_CONST.DATA_CHANGE.NEW_CONTACT || dataChangeType == LINKit_CONST.DATA_CHANGE.UPDATE_CONTACT || dataChangeType == LINKit_CONST.DATA_CHANGE.NEW_MESSAGE || dataChangeType == LINKit_CONST.DATA_CHANGE.UPDATE_MESSAGE)
		{
			if(contactManager.getAllUnreadCount() == 0)
			{
				this.msgUnread.hide();
			}
			else
			{
				this.msgUnread.show();
				this.msgUnread.html(contactManager.getAllUnreadCount());
			}
		}
		else if(dataChangeType == LINKit_CONST.DATA_CHANGE.UPDATE_NOTIFICATION)
		{
			if(notificationManager.getCount() == 0)
			{
				this.ntfUnread.hide();
			}
			else
			{
				this.ntfUnread.show();
				this.ntfUnread.html(notificationManager.getCount());
			}
		}
		for(var i in this.panelArray){
			this.panelArray[i].refresh(dataChangeType, contact);
		}
	}
	
	NavigationBar.prototype.tabClick = function(){
		var This = this;
		this.tab_feedback.click(function(event){
			if(This.bTrue)
			{
				This.showFeedbackPanel();
			}
			else
			{
				This.hideFeedbackPanel();
			}
			
			event.stopPropagation();
		});
	}
	
	NavigationBar.prototype.showFeedbackPanel = function(){
			this.tab_feedback.addClass('tab_feedback_selected');
			this.hideSuccessBox();
			this.feedback_box.show();
			this.feedback_box_content.show();
			this.bTrue = false;
	}
	
	NavigationBar.prototype.hideFeedbackPanel = function(){
			this.tab_feedback.removeClass('tab_feedback_selected');
			this.feedBack_content_msg.val('');
			this.feedback_box.hide();
			this.bTrue = true;
	}

	NavigationBar.prototype.cancelBubbleForFreedBack = function(event){
			this.feedback_box.click(function(event){
				event.stopPropagation();
			});
	}
	
	NavigationBar.prototype.sentFreedBack = function(event){
			var This = this;
			this.feedback_canfirm.click(function(event){
				var content = This.feedBack_content_msg.val();
				if(content == '')
				{
					var str = lang == null ? "请输入内容  " : lang.linkit.Message_isnull;
					$.alert(str);
					return;
				}
				$.ajax({
					type: 'post',
					url: '/feedback/publish',
					data: {
						content: content
					},
					success: function(result) {
							try {
								var packet = JSON.parse(result);
								if(packet.cmd == 'kFeedback') {
									This.feedBack_content_msg.val('');
									This.feedback_box_content.hide();
									This.showSuccessBox();
									
								} else {
									alert('Failed' + result);
								}
							} catch(e) {
							}
						},
					error: function() {
					}
				});

				event.stopPropagation();
			});
	}
	NavigationBar.prototype.showSuccessBox = function(event){
		var This = this;
		this.success_box.show();
		this.success_box_canfirm.click(function(){
			This.hideFeedbackPanel();
		})
	}
	
	NavigationBar.prototype.hideSuccessBox = function(event){
		this.success_box.hide();
	}
	
	NavigationBar.prototype.cancelFreedBack = function(event){
		var This = this;
		this.feedback_cancel.click(function(event){
			This.hideFeedbackPanel();
			event.stopPropagation();
		});
	}
	
	NavigationBar.prototype.showState = function(state){
		if(state == LINKit_CONST.CONNECT_STATE.NOT_CONNECTED)
		{
			this.myheader.removeClass().addClass('myheader');
		}
		else if(state == LINKit_CONST.CONNECT_STATE.CONNECTED)
		{
			this.myheader.removeClass().addClass("myheader_all");
		}
		
	}

	/**********NavigationBar class end**********/

	function IPanel(){};
	IPanel.prototype.show = abstractmenthod;
	IPanel.prototype.hide = abstractmenthod;
	IPanel.prototype.refresh = abstractmenthod;
	IPanel.prototype.clear = abstractmenthod;

	/**********MessagePanel class begin**********/
	function MessagePanel(){
		this.panelType = LINKit_CONST.PANEL_TYPE.MESSAGE;
	};
	MessagePanel.prototype = inherit(IPanel.prototype);
	MessagePanel.constructor = MessagePanel;
	MessagePanel.prototype.init = function(){
		this.panel = $('.link_sms');
		this.panelLeft = $('.link_sms .left');
		this.panelRight = $('.link_sms .right');

		//left element
		this.messageSessionList = $('#session_list');
		this.searchIcon		= $(".link_sms .left .search_box .search_icon");
		this.Search			= $(".link_sms .left .search_input");
		this.clearSearch	= $(".link_sms .left .search_clear");

		//right element
		this.sessionPanel	= $(".link_sms .right .session_panel");
		this.chatListPanel	= $(".link_sms .right .session_panel .list");
		
		this.sms_callit		= $('#sms_callit');
		this.sms_menu		= $('sms_menu');
		this.loadingProgress= $('#search_box_sms .Message_loading');
		this.index = 0;

		//session列表中当前选中的item
		this.selectedItem = null ;
		// 保存当前的联系人信息
		this.contact = {};
		// 保存消息面板中，选中的消息
		this.msgs = new Array();
		
		this.bCanChangeMessagePanel = false;

		this.newMessageEvent();
		this.searchEvent();
		this.clearSearchEvent();
		this.initMenuPanel();
		this.initSend();
		this.emojiClick();
		this.callEvent();
		this.callRecordsEvent();
		this.recordsInit();	
	}

	MessagePanel.prototype.show = function(){
		var $right = $('#link_sms .right');
		this.panel.show();
		this.defaultClick();
		if($right.size() >= 2)
		{
			$right.each(function(index, element){
				$(this).hide();
			});
			$right.first().show();
		}
		else
		{
			$right.show();
		}
}

	MessagePanel.prototype.hide = function(){
		this.panel.hide();
	}

	MessagePanel.prototype.clear = function(){
		this.messageSessionList.children(".item").remove();
		this.clearChatPanel();
		$("#session_name").text('');
		$('.number_list > .input_box').val("");
	}

	//dataChangeType: LINKit_CONST.DATA_CHANGE
	MessagePanel.prototype.refresh = function(dataChangeType, contact){
		switch (dataChangeType){
			case LINKit_CONST.DATA_CHANGE.NEW_CONTACT:
				this.createSessionItem(contact);
				this.updateSessionItem(contact);
				this.updateAvatar(contact);
				break;
			case LINKit_CONST.DATA_CHANGE.UPDATE_CONTACT:
				this.updateAvatar(contact);
				break;
			case LINKit_CONST.DATA_CHANGE.NEW_MESSAGE:
				this.createSessionItem(contact);
				this.updateSessionItem(contact);
				break;
			case LINKit_CONST.DATA_CHANGE.UPDATE_MESSAGE:
				this.updateSessionItem(contact);
				break;
		}
	}
	MessagePanel.prototype.callEvent = function() {
		$('#sms_callit').click(function(){
			callPanel.makeACall(messagePanel.contact.phonenumber, messagePanel.contact.name);
		});
	}
	MessagePanel.prototype.callRecordsEvent = function() {
		var This = this;
		$('#sms_menu').click(function(){
			$('#sms_menu_list').show();
			return false;
		});
	}
	MessagePanel.prototype.recordsInit = function() {
		var This = this;
		$('#sms_menu_list').click(function(){
			var obj = $('#sms_menu_list').find('.is_show_call');
			var str1 = lang == null ? "显示通话记录" : lang.linkit.show_call_history;
			var str2 = lang == null ? "隐藏通话记录" : lang.linkit.hide_call_history;
			if(obj.html() == str1)
			{
				This.showCallRecords();
				$(this).hide();
				obj.html(str2);
			}
			else
			{
				This.hideCallRecords();
				$(this).hide();
				obj.html(str1);
			}
			return false;
		});
		
	}
	MessagePanel.prototype.showCallRecords = function() {
		var $items = $('.list > .item');
		$items.each(function(index, element){
			if($(this).attr('type') == LINKit_CONST.MESSAGE_STATUS.IN_CALL)
			{
				 $(this).show();
			}
			else if($(this).attr('type') == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL)
			{
				 $(this).show();
			}
			else if($(this).attr('type') == LINKit_CONST.MESSAGE_STATUS.OUT_CALL)
			{
				 $(this).show();
			}	
		});	
	}
	MessagePanel.prototype.hideCallRecords = function() {
		var $items = $('.list > .item');
		$items.each(function(index, element){
			if($(this).attr('type') == LINKit_CONST.MESSAGE_STATUS.IN_CALL)
			{
				 $(this).hide();
			}
			else if($(this).attr('type') == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL)
			{
				 $(this).hide();
			}
			else if($(this).attr('type') == LINKit_CONST.MESSAGE_STATUS.OUT_CALL)
			{
				 $(this).hide();
			}	
		});
			
	}

	MessagePanel.prototype.newMessageEvent = function() {
		$("#link_sms_new_btn").click(function() {
			messagePanel.newSession();
			messagePanel.clearSessionSelected();
			$('#link_sms .title').hide();
			messagePanel.sms_callit.hide();
			messagePanel.sms_menu.hide();
		});
	}

	MessagePanel.prototype.searchEvent = function() {
		this.Search.keyup(function() {
			var text = messagePanel.Search.val();

			if(text.length > 0){
				messagePanel.searchIcon.hide();
				messagePanel.clearSearch.show();
			} else {
				messagePanel.clearSearch.hide();
				messagePanel.searchIcon.show();
			}

			messagePanel.search(text);
		});
	}

	MessagePanel.prototype.clearSearchEvent = function() {
		messagePanel.clearSearch.click(function(event) {
			messagePanel.Search.val("");
			messagePanel.clearSearch.hide();
			messagePanel.searchIcon.show();
			messagePanel.search("");
			event.stopPropagation();
		});
	}

	MessagePanel.prototype.addMessagePanel = function(){
		if(this.panel.find('.right').size() == 0){
			this.panel.append(this.panelRight);
			if(this.bCanChangeMessagePanel)
			{
				if(navigationBar.panelType() != LINKit_CONST.PANEL_TYPE.MESSAGE){
					navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.MESSAGE);
					this.bCanChangeMessagePanel = false;
				}
			}
		}
	}

	MessagePanel.prototype.defaultClick = function() {
		messagePanel.addMessagePanel()
		var isClicked = false ;
		var dataList = messagePanel.messageSessionList;
		var itemName = messagePanel.selectedItem;
		var $children = dataList.children(".item");
		var j = 0 ;
		if(itemName != null && itemName != ""){
			for(j = 0 ; j < $children.length; j++){
				if($children.eq(j).attr("id") == itemName){
					$children.eq(j).trigger("click");
					isClicked = true;
					break;
				}
			}
		}
		if(!isClicked){
			$children.eq(0).trigger("click");
		}
	}

	MessagePanel.prototype.clearSessionSelected = function() {
		messagePanel.messageSessionList.children().removeClass("current");
	}

	MessagePanel.prototype.addSessionItem = function(item) {
		this.messageSessionList.append(item);
	}

	MessagePanel.prototype.getSessionItemID = function(phonenumber) {
		var number = phonenumber;
		number = number.replace(/[^\d]/g,'');
		number = number.replace(/[ ]/g,""); //替换所有空格
		var id = 'session_message_' + number;
		return id;
	}

	MessagePanel.prototype.createSessionItem = function(contact) {

		if(contact.msg == null || contact.msg.length == 0){
			return;
		}
		
		var bHaveSms = false;
		for(var i = 0; i < contact.msg.length; i++)
		{
			if(contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.RECEIVE_MSG || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.SEND_MSG)
			{
				bHaveSms = true;
				break;
			}
		}
		if(!bHaveSms)
		{
			return;
		}

		var itemID = this.getSessionItemID(contact.phonenumber);
		var $sessionExist = $("#"+itemID);
		if($sessionExist.length != 0){
			return;
		}

		var name = contact.name ? contact.name : contact.phonenumber;

		var $session_item = $("<div class='item' id='" + itemID + "'></div>");
		var $content = $("<div class='item_content'></div>");
		var $loadingBar = $("<div class='loading_bar'></div>");
		var $headerLayout = $("<div class='header_layout'></div>");
		var $textLayout = $("<div class='text_layout'></div>");

		var $headerImg = $("<div class='header'></div>");
		var $headerBorder = $("<div class='header_border'></div>");
		var $unread = $("<div class='unread'>" + contact.unreadCount + "</div>");
		var $FaceBookHeader = $('<div class="message_icon"></div>');

		var headerImgPath = "url('" + ".//images//tab//myheader_0.png" + "')";
		$headerImg.css({'background-image' : headerImgPath});
		$headerLayout.append($headerImg);
		$headerLayout.append($headerBorder);
		$headerLayout.append($unread);
		if(LINKit_CONST.CONTACT_TYPE.FACEBOOK == contact.incontact)
		{
			$headerLayout.append($FaceBookHeader);
			
			if(typeof(contact.avatar) == 'undefined' || contact.avatar == null || contact.avatar.length <= 0){
				connectManager.getFacebookContactAvatar();
			}
			
		}

		var $name = $("<div class='name'>" +name+ "</div>");
		var $latest = $("<div class='latest'>" + $.replaceUnified(contact.content.encodeHtml()) + "</div>");
		$textLayout.append($name);
		$textLayout.append($latest);

		$session_item.attr("time", contact.time);

		$content.append($headerLayout);
		$content.append($textLayout);
		$content.append($loadingBar);
		$session_item.append($content);
		$unread.hide();

		if(connectManager.getVisableFunction()){
			var $deleteSession = $("<div class='delete_session needws'></div>");
			var $deleteImage = $("<a href='javascript:;' class='sess_del_img'></a>");
			$deleteSession.append($deleteImage);
			$content.append($deleteSession);
			$deleteSession.hide();

			$deleteSession.bind("click",function(){
				if($deleteSession.hasClass('disconnect')){
					$.confirmYN({
						message : (lang == null ? "您确定要删除这个会话吗？" : lang.linkit.delete_session),
						callback : function(value) {
							if (value) {
								var data = [];
								data[0] = contactManager.createMessageJson(contact.msg, contact.phonenumber);

								var pack = connectManager.getHeader(data);
								contactManager.removeMessage(data[0]);
								pack.cmd = "kDeleteMessages";
								connectManager.sendCmdAndRespone(pack,null);
							}
						}
					});
				}
			});

			$session_item.hover( function(){
				$deleteSession.show();
				$(this).find(".text_layout").css({'width':'170px'});
				$deleteSession.css({'margin-top':'0px'});
			},function(){
				$deleteSession.hide();
				$(this).find(".text_layout") .css({'width':'210px'});
				$deleteSession.css({'margin-top':'-60px'});
			});
		}

		$session_item.bind("click", function() {
			if (contact.msg != null && contact.unreadCount >= 1) {
				contactManager.updateContact(contact, LINKit_CONST.CONTACT_PROPERTY.UNREAD);
				$unread.hide();
				$name.removeClass("bold_name");
				messagePanel.updateSMSs(contact);
			}
			$('#link_sms .title').show();
			messagePanel.sms_callit.show();
			messagePanel.sms_menu.show();
			messagePanel.selectedItem = itemID;
			messagePanel.clearSessionSelected();
			$session_item.addClass("current");
			if($(this).find('.loading_bar').css('display') == 'none')
			{
				messagePanel.hideLoading();
				messagePanel.showSession(contact);
			}
			else
			{
				messagePanel.clearChatPanel();
				messagePanel.showLoading();
			}
		});

		this.addSessionItem($session_item);
	}

	MessagePanel.prototype.updateSessionItem = function(contact) {
		var itemID = this.getSessionItemID(contact.phonenumber);
		var $session = $("#"+itemID);
		if($session.length > 0){
			var $name = $session.find(".name");
			var $unread = $session.find(".unread");
			var $latest = $session.find(".latest");
			var $header = $session.find(".header");

			if($header != null && contact.avatar != null && contact.avatar.length > 0){
				$header.css({'background-image' : contact.avatar});
			}

			if(contact.msg != null && contact.msg.length > 0){
				$latest.html($.replaceUnified(contact.content.encodeHtml()));
				if (contact.unreadCount < 1) {
					$unread.hide();
					//$latest.css({"color":"#606060"});
					$name.removeClass("bold_name");
				}else{
					$unread.html(contact.unreadCount);
					$unread.show();
					//$latest.css({"color":"#202020"});
					$name.addClass("bold_name");
				}
				$session.attr("time", contact.time);
				if(contact.phonenumber != null && contact.phonenumber.length > 0 && contact.phonenumber == this.contact.phonenumber){
					this.updateSession(contact);
				}

				var $children = this.messageSessionList.children(".item");
				for(var i = 0 ; i < $children.length; i++){
					var item = $children.eq(i);
					if($session.attr("time") > item.attr("time")){
						$session.insertBefore(item);
						break;
					}
				}
				//显示加载进度
				var loadingBar = $session.find('.loading_bar');
				if(contact.total > 0 && contact.index < contact.total){
					loadingBar.show();
					var width = $session.width() - (contact.index / contact.total) * $session.width();

					var left = (contact.index / contact.total) * $session.width();
					loadingBar.css({'margin-left':left, 'width':width});
				} else {
					loadingBar.hide();
					if(this.selectedItem == null){
						this.selectedItem = itemID;
					}
					if(this.selectedItem == itemID)
					{
						messagePanel.hideLoading();
						messagePanel.showSession(contact);
					}
				}
			} else {
				var $nextSession = $session.next();
				$session.remove();
				if($nextSession == null || $nextSession.length == 0){
					$nextSession = messagePanel.messageSessionList.children(".item").eq(0);
				}
				$nextSession.trigger("click");
			}
		}
	}
	
	MessagePanel.prototype.showLoadingProgress = function(){
		this.loadingProgress.show();
	}
	
	MessagePanel.prototype.showMessageLoadingSpeed = function(loadingRate) {
		var LoadContent = $('#search_box_sms .message_Loading_content');
		LoadContent.css('width',285*loadingRate);
		if(parseInt(LoadContent.css('width')) == 285)
		{
			LoadContent.css('width',0);
			this.loadingProgress.hide();
		}
	}
	MessagePanel.prototype.updateSMSs = function(contact) {
		var arr = new Array();
		for (var i = 0; i < contact.msg.length; i++) {
			if (contact.msg[i].read == false) {
				contact.msg[i].read = true;
				arr.push(contact.msg[i]);
			}
		}

		var data = [];
		var option = {"read":""};
		data[0] = contactManager.createMessageJson(arr, contact.phonenumber, option);

		var pack = connectManager.getHeader(data);
		contactManager.updateMessage(pack);
		pack.cmd = "kUpdateMessages";
		connectManager.sendCmdAndRespone(pack,function(ret){
			
		});
	}

	MessagePanel.prototype.showChatPanel = function(){
		this.sessionPanel.show();
	}

	MessagePanel.prototype.clearChatPanel = function() {
		this.chatListPanel.children().remove();
	}

	MessagePanel.prototype.clickMenu = function(msg){
		var i = 0 ;
		for(i = 0 ; i < messagePanel.msgs.length ; i++)
		{
			if(messagePanel.msgs[i] == msg){
				break;
			}
		}
		if(i == messagePanel.msgs.length){
			messagePanel.msgs.push(msg);
		}else{
			messagePanel.msgs.splice(i,1);
		}
		if(messagePanel.msgs.length == messagePanel.contact.msg.length)
		{
			$('.right .menu_content > .select').addClass('unselect_all');
			$('.right .menu_content > .select').removeClass('select_all');
		}else{
			$('.right .menu_content > .select').addClass('select_all');
			$('.right .menu_content > .select').removeClass('unselect_all');
		}
		if(messagePanel.msgs.length > 0){
			this.showMenu();
		}else{
			this.hideMenu();
		}
	}


	//显示菜单栏
	MessagePanel.prototype.showMenu = function(){
		$(".right .menu").show();
		$(".right .menu").animate({'margin-top': 0}, 100);
	}

	//隐藏菜单栏
	MessagePanel.prototype.hideMenu = function(){
		$(".right .menu").animate({'margin-top': "-60px"},100, function(){$(".menu").hide();});
		//$(".menu").hide();
	}

	MessagePanel.prototype.hideNewSMSHeader = function(){
		$('.right .number_list').hide();
	}

	//显示新建消息 输入框
	MessagePanel.prototype.showNewSMSHeader = function(){
		$('.number_list').show();
	}
	MessagePanel.prototype.showSession = function(contact){
		if(LINKit_CONST.CONTACT_TYPE.FACEBOOK == contact.incontact)
		{
			$('#message_icon_right').show();
			this.sms_callit.hide();
		}
		else
		{
			$('#message_icon_right').hide();
			this.sms_callit.show();
		}
		$('#sms_menu_list').find('.is_show_call').html(lang == null ? "显示通话记录" : lang.linkit.show_call_history);
		if($('.right .loading').size()==0 || $('.right .loading').css('display') == 'none'){
			this.showChatPanel();
			this.hideMenu();
			this.hideNewSMSHeader();
			$("#session_name").show();
			if(this.contact != null && this.contact.phonenumber == contact.phonenumber){
				this.updateSession(contact);
			}else{
				this.clearChatPanel();
				this.msgs = new Array();
				this.contact = contact ;
				$('.right .menu_content > .select').addClass('select_all');
				$('.right .menu_content > .select').removeClass('unselect_all');
				var name = contact.name ? contact.name : contact.phonenumber;
				$("#session_name").text(name);
				$('.input_editor > .content_msg').val('');
				$('.number_list > .input_box').val(contact.phonenumber);
				for(var i = 0 ; i < contact.msg.length; i++){
					var $uiItem = null;
					if(contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.RECEIVE_MSG
						/* || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.IN_CALL */
						/* || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL */){
						$uiItem = this.createLeftMessageUI(contact.msg[i],contact.avatar, contact.msg[i].status);
					}else if(contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.SEND_MSG
						/* || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.OUT_CALL */){
						$uiItem = this.createRightMessageUI(contact.msg[i], contact.msg[i].status);
					}
					if($uiItem){
						this.chatListPanel.append($uiItem);
					}
				}
				//隐藏通话记录
				//this.hideCallRecords();
				this.chatListPanel.append($('<div class="blank"></div>'));
				$(".right .list").scrollTop($(".right .list")[0].scrollHeight);
				mainUI.autoresize();
			}
		}
	}

	//更新当前session
	//采用同时推进的顺序进行计算。
	//如果更新的session不是当前的session，则直接显示新的session
	//
	MessagePanel.prototype.updateSession = function(contact){
		if(this.contact != null && (contact.phonenumber == this.contact.phonenumber)){
			var i = 0 , j = 0 ;
			var items = $('.list > .item');
			for(; i < contact.msg.length && j< items.size();){
				if(items.eq(j).attr('time') == contact.msg[i].time){
					i++;
					j++;
				}else if(items.eq(j).attr('time') > contact.msg[i].time){
					var $uiItem = null ;
					if(contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.RECEIVE_MSG
						/* || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.IN_CALL */
						/* || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL */){
						$uiItem = this.createLeftMessageUI(contact.msg[i],contact.avatar);
					}else if(contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.SEND_MSG
						/* || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.OUT_CALL */){
						$uiItem = this.createRightMessageUI(contact.msg[i],contact.avatar);
					}
					if($uiItem){
						$uiItem.insertBefore(items.eq(j));
					}
					i++;
				}else if(items.eq(j).attr('time') < contact.msg[i].time){
					items.eq(j).remove();
					j++;
				}

			}
			for(;j<items.size();j++){
				items.eq(j).remove();
			}
			for(;i < contact.msg.length;i++){
				var $uiItem = null ;
				if(contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.RECEIVE_MSG
					/* || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.IN_CALL */
					/* || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL */){
					$uiItem = this.createLeftMessageUI(contact.msg[i]);
				}else if(contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.SEND_MSG
					/* || contact.msg[i].status == LINKit_CONST.MESSAGE_STATUS.OUT_CALL */){
					$uiItem = this.createRightMessageUI(contact.msg[i]);
				}
				if($uiItem){
					if($('.right .list > .blank').size() > 0){
						$uiItem.insertBefore($('.list > .blank'));
					}else{
						$('.list').append($uiItem);
					}
				}
			}
			if($('.right .list > .blank').size() <= 0){
				$('.list').append($('<div class="blank"></div>'));
			}
			this.contact = contact ;
			mainUI.autoresize();
		}else{
			this.showSession(contact);
		}
		$(".right .list").scrollTop($(".right .list")[0].scrollHeight);
		mainUI.autoresize();
	}

	MessagePanel.prototype.createLeftMessageUI = function(sms,avatar,type){
		var $item = $('<div class="item"></div>');
		var $headerLeft = $('<div class="header_left"></div>');
		$item.append($headerLeft);

		var $headerImage = $('<div class="user_header"></div>');
		var $headerFrame = $('<div class="board"></div>');
		if(avatar != null){
			$headerImage.css('background-image',avatar);
		}
		$headerLeft.append($headerImage);
		$headerLeft.append($headerFrame);

		var $messageBody = $('<div class="message_body_left"><i class="triangle_left"></i></div>');
		var $messagePanel = $('<div class="message_panel"></div>');
		var $messageContent = $('<div class="message_text_left">');
		var $messageText = $('<span class="massage_text"></span>');
		if(sms.status == LINKit_CONST.MESSAGE_STATUS.IN_CALL){
			var $messageCall = $('<span class="massage_call message_call_in"></span>');
			$messageCall.html(lang == null ? "来电" : lang.linkit.in_call);
			$messageContent.append($messageCall);
		} else if(sms.status == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL){
			var $messageCall = $('<span class="massage_call message_call_miss"></span>');
			$messageCall.html(lang == null ? "未接电话" : lang.linkit.missed_call);
			$messageContent.append($messageCall);
		}

		$messageContent.append($messageText);

		var $time = $('<div class="time"></div>');
		var $choose = $(' <div class="click"></div>');
		$messagePanel.append($messageContent);
		$messagePanel.append($time);
		$messagePanel.append($choose);
		if(typeof(sms.message) != "undefined")
		{
			var messageStr = sms.message.encodeHtml();
		}
		$messageText.html($.replaceUnified(messageStr));
		$messageBody.append($messagePanel);

		if(sms.sendstatus == undefined || sms.sendstatus == null || sms.time != null){
			var date = new Date();
			date.setTime(sms.time);
			$time.html(date.format('yyyy-MM-dd hh:mm'));
		}else {
			if (sms.sendstatus === 1) {
				$time.html(lang == null ? '发送中...' : lang.linkit.sending);
			} else if (sms.sendstatus === 2) {
				$time.html(lang == null ? '发送失败' : lang.linkit.send_failed);
			}
		}
		$item.append($messageBody);
		$item.bind("click",function(){
			messagePanel.clickMenu(sms);
			$item.toggleClass("item_click");
		});
		$item.attr('time',sms.time);
		$item.attr('type',type);
		return $item;
	}

	MessagePanel.prototype.createRightMessageUI = function(sms,type){
		var $item = $('<div class="item"></div>');
		var $headerRight = $('<div class="header_right"></div>');
		$item.append($headerRight);

		var $headerImage = $('<div class="user_header"></div>');
		var $headerFrame = $('<div class="board"></div>');
		$headerRight.append($headerImage);
		$headerRight.append($headerFrame);

		var $messageBody = $('<div class="message_body_right"><i class="triangle_right"></i></div>');
		var $messagePanel = $('<div class="message_panel"></div>');
		var $messageContent = $('<div class="message_text_right">');
		var $messageText = $('<span class="massage_text"></span>');
		if(sms.status == LINKit_CONST.MESSAGE_STATUS.OUT_CALL){
			var $messageCall = $('<span class="massage_call message_call_out"></span>');
			$messageCall.html(lang == null ? "外拨电话  " : lang.linkit.out_call);
			$messageContent.append($messageCall);
		}
		$messageContent.append($messageText);

		var $time = $('<div class="time"></div>');
		var $choose = $(' <div class="click"></div>');
		$messagePanel.append($messageContent);
		$messagePanel.append($time);
		$messagePanel.append($choose);
		var messageStr = sms.message.encodeHtml();
		$messageText.html($.replaceUnified(messageStr));
		$messageBody.append($messagePanel);

		if(sms.sendstatus == undefined || sms.sendstatus == null){
			var date = new Date();
			date.setTime(sms.time);
			$time.html(date.format('yyyy-MM-dd hh:mm'));
		}else {
			if (sms.sendstatus === 1) {
				$time.html(lang == null ? '发送中...' : lang.linkit.sending);
			} else if (sms.sendstatus === 2) {
				$time.html(lang == null ? '发送失败' : lang.linkit.send_failed);
			}
		}
		$item.append($messageBody);
		$item.bind("click",function(){
			messagePanel.clickMenu(sms);
			$item.toggleClass("item_click");
		});
		$item.attr('time',sms.time);
		$item.attr('type',type);
		return $item;
	}

	MessagePanel.prototype.updateAvatar = function(contact){
		//update session contact avatar
		var itemID = this.getSessionItemID(contact.phonenumber);
		var $sessionExist = $("#"+itemID);
		if($sessionExist.length > 0){
			$header = $sessionExist.find(".header");
			if($header){
				$header.css('background-image',contact.avatar);
			}
		}
		
		//update right panel contact avatar
		if(this.contact != null && this.contact.phonenumber == contact.phonenumber){
			$('.right .list > .item > .header_left > .user_header').css('background-image',contact.avatar);
		}
	}

	MessagePanel.prototype.search = function(text){
		var contactArr = contactManager.searchByMessage(text);;
		var dataList = messagePanel.messageSessionList;

		if(dataList != null){
			var $children = dataList.children(".item");
			$children.hide();
			if(contactArr != null && contactArr.length > 0){
				for(var i = 0 ; i < contactArr.length; i++){
					var itemID = this.getSessionItemID(contactArr[i].phonenumber);
					$("#"+itemID).show();
				}
			}
		}
	}

	MessagePanel.prototype.newSession = function(contact){
		this.showChatPanel();
		this.clearChatPanel();
		$('.right .number_list > .input_box').val('');
		this.showNewSMSHeader();
		$("#session_name").hide();
		$('#link_contact .right .title').show();
		$('.right .number_list > .contact_list_panel').hide();
		if(contact != null){
			if(contact.msg != null && contact.msg.length > 0 ){
				this.showSession(contact);
			}
			if(contact.name != null && contact.name != ""){
				$('.right .number_list > .input_box').val(contact.name);
				$("#session_name").text(contact.name);
				$("#session_name").show();
				$('.number_list').hide();
			}else if(contact.phonenumber != null){
				$('.right .number_list > .input_box').val(contact.phonenumber);
				$("#session_name").show();
				$('.number_list').hide();
				$("#session_name").text(contact.phonenumber);
			}
			if(contact.draft != null){
				$('.right .input_editor > .content_msg').val(contact.draft);
			}
		}
		mainUI.autoresize();
		this.hideMenu();
	}

	MessagePanel.prototype.initMenuPanel = function()
	{
		$('.right .menu_content > .delete').bind('click',function(){
			if($('.right .menu_content > .delete').hasClass('disconnect')){

			}else{
				$.confirmYN({
					message : (lang == null ? "确定删除这些短信吗？" : lang.linkit.delete_message),
					callback : function(value) {
						if (value) {
							if(messagePanel.msgs.length  > 0 ){
								var data = new Array();
								data[0] = contactManager.createMessageJson(messagePanel.msgs, messagePanel.contact.phonenumber);
								var pack = connectManager.getHeader(data);
								contactManager.removeMessage(data[0]);
								pack.cmd = "kDeleteMessages";
								connectManager.sendCmdAndRespone(pack,null);
								$('.list > .item_click').remove();
							}
						}
					}
				});
			}

		});

		$('.right .menu_content > .forward').bind('click',function(){
			$('#link_sms .title').hide();
			var contact = {};
			contact.draft = "" ;
			for(var i = 0 ; i < messagePanel.msgs.length ;i++){
				contact.draft += messagePanel.msgs[i].message + "    ";
				messagePanel.newSession(contact);
			}

		});
		var $select = $('.right .menu_content > .select');
		var $item = $('#link_sms .item');
		$select.bind('click',function(){
			if(messagePanel.contact.msg.length != messagePanel.msgs.length){
				$('.list > .item').addClass('item_click');
				messagePanel.msgs = messagePanel.contact.msg ;
				$item.each(function(index, element){
					if($(element).css('display') == 'block')
					{
						if($(element).attr('type') != LINKit_CONST.MESSAGE_TYPE.SMS )
						{
							$('#link_sms .forward').hide();
						}	
					}
				});

			}else{
				$('.list > .item').removeClass('item_click');
				messagePanel.msgs = new Array();
			}
			$select.toggleClass('select_all');
			$select.toggleClass('unselect_all');
		});
	}

	MessagePanel.prototype.initSend = function(){
		var This = this;
		$('.input_editor > .btn').bind('click',function(){
			This.bCanChangeMessagePanel = true;
			messagePanel.sendMessage();
		});
		
		$('.input_editor > .content_msg').keydown(function(event){
			/* if(event.keyCode == 13)
			{
				This.bCanChangeMessagePanel = true;
				messagePanel.sendMessage();
				return false;
			} */
			if(event.keyCode == 13 && event.ctrlKey)
			{
				this.value += "\r\n"; 
			}
			else if(event.keyCode == 13 && (!event.shiftKey && !event.ctrlKey))
			{
				This.bCanChangeMessagePanel = true;
				messagePanel.sendMessage();
				return false;
			}
		});

		this.contactBox = $('.right .number_list > .input_box');
		var $contactBox = this.contactBox ;
		$contactBox.keyup(function(event) {
			event = event || window.event ;
			if(event.keyCode === 40){
				return ;
			}
			var str = $contactBox.val();
			if(str != null && str.sTrim() != ""){
				var strs = str.split(';');
				var front = "";
				for(var k = 0 ; k <strs.length - 1; k++){
					front += strs[k] + ';' ;
				}
				str = strs[strs.length - 1];
				if(str != null && str.sTrim() != ""){
					var cs = contactManager.searchContact(str);
					$('#select_search_input_contact').children().remove();
					for(var i = 0 ; i <cs.length ; i++){
						var tmpStr = "" ;
						if(cs[i].name != null && cs[i].name != ''){
							tmpStr = cs[i].name + '&nbsp;&nbsp;(' +  cs[i].phonenumber + ')' ;
						}else{
							tmpStr = cs[i].phonenumber ;
						}
						var $option = $('<div class="option">'+ tmpStr +'</div>');
						$option.attr('key',(cs[i].name == null || cs[i].name == '') ? cs[i].phonenumber : cs[i].name);
						$option.hover(function(){
							$contactBox.val(front + $(this).attr('key'));
						},function(){
							if($(this).attr('key1') != 'true'){
								$contactBox.val(front + str);
								$contactBox[0].focus();
							}
						});
						$option.bind('click',function(){
							$contactBox.val(front + $(this).attr('key') + ";");
							$(this).attr('key1','true');
							$('#search_input_contact_panel').hide();
						});
						$('#select_search_input_contact').append($option);
					}

					$('#search_input_contact_panel').css('left' ,$contactBox.offset().left);
					$('#search_input_contact_panel').css('top' ,$contactBox.offset().top + $contactBox.height() + parseInt($contactBox.css('border-bottom-width')||0) + 2) ;

					if(cs.length > 0){
						if(cs.length > 10){
							$('#search_input_contact_panel').height($option.height() * 10);
						}else{
							$('#search_input_contact_panel').height($option.height() * cs.length);
						}
						$('#search_input_contact_panel').show();
					}else{
						$('#search_input_contact_panel').hide();
					}
				}else{
					$('#search_input_contact_panel').hide();
				}
			}else{
				$('#search_input_contact_panel').hide();
			}
		});
	}

	//选择联系人面板，确定后调用的方法
	MessagePanel.prototype.initInputContact = function(contacts){
		var phonenumberString = $('.right .number_list > .input_box').val();
		var results = new Array();
		var i = 0 ,j = 0;
		//根据输入框中的名字，如果进行刷选
		if(phonenumberString != null && phonenumberString != ''){
			var temps = phonenumberString.split(';');
			for(i = 0 ; i < temps.length ; i++){
				// 检测当前值是否是号码
				if(new RegExp("^(\\+)?(\\d|\\s)+$").isMatch(temps[i])){
					var c = contactManager.findContactByNumber(temps[i]);
					//如果该号码存在联系人中，则检查是否存在新的选择联系人中，如果是进行保存，如果不是删除
					if(c != null){
						if(contacts != null && contacts.length > 0){
							for(j = 0 ; j < contacts.length; j++){
								if(c.phonenumber == contacts[j]){
									results.push((c.name == null||c.name == "") ? c.phonenumber :c.name);
									break;
								}
							}
						}

					}else{//不存在联系人中，则为陌生人号码，直接加入
						results.push(temps[i]);
					}
				}else{//不是纯号码，是联系人名字，则根据名字查找
					var c = contactManager.findContactByName(temps[i]);
					if(c != null){//存在联系人中，在新的选择框中是否存在，存在则加入，不存在则删除
						if(contacts != null && contacts.length > 0){
							for(j = 0 ; j < contacts.length; j++){
								if(c.phonenumber == contacts[j]){
									results.push((c.name == null||c.name == "") ? c.phonenumber :c.name);
									break;
								}
							}
						}//else  如果不存在，则用户书写错误，直接删除。
					}
				}
			}
		}
		for(i = 0 ; i < contacts.length; i++){
			for(j = 0; j < results.length; j++){
				if(results[j] == contacts[i].name || results[j]== contacts[i].phonenumber){
					break;
				}
			}
			if(j == results.length){
				results.push((contacts[i].name == null||contacts[i].name == "") ? contacts[i].phonenumber : contacts[i].name);
			}
		}

		//把新的结果写入输入框
		var res = "";
		for(i = 0 ; i < results.length ;i ++){
			res += results[i] + ";" ;
		}
		$('.right .number_list > .input_box').val(res);
	}

	MessagePanel.prototype.readerContactFromInputbox = function(){
		var phonenumberString = $('.number_list > .input_box').val();
		var results = new Array();
		if(phonenumberString != null && phonenumberString != ''){
			var temps = phonenumberString.split(';');
			for(i = 0 ; i < temps.length ; i++){
				// 检测当前值是否是号码
				if(new RegExp("^(\\+)?(\\d|\\s)+$").isMatch(temps[i]) || temps[i].indexOf('@chat.facebook.com') != -1){
					var c = contactManager.findContactByNumber(temps[i]);
					if(c != null){
						results.push(c);
					}else{
						results.push({phonenumber:temps[i]});
					}
				}else{
					var c = contactManager.findContactByName(temps[i]);
					if(c != null){//存在联系人中，在新的选择框中是否存在，存在则加入，不存在则删除
						results.push(c);
					}
				}
			}
		}
		return results ;
	}

	MessagePanel.prototype.emojiClick = function() {
		$(".right .emoji_warp").fadeOut();
		$('.right .emoji').click(function(event) {
			if (!messagePanel.emojiVisible) {
				$(".emoji_warp").fadeIn();
				messagePanel.emojiVisible = true;
			} else {
				$(".emoji_warp").fadeOut();
				messagePanel.emojiVisible = false;
			}
			event.stopPropagation();
		});

		$('.right .emoji_warp').click(function(event) {
			if ($(event.target).is('a')) {
				$('.right .input_editor > .content_msg').val($('.right .input_editor > .content_msg').val() + $(event.target).attr('title'));
				$(".emoji_warp").fadeOut();
				messagePanel.emojiVisible = false;
			}
		});
	}

	MessagePanel.prototype.sendMessage = function() {
		var msg = $.convert($('.right .input_editor > .content_msg').val(), 'plain');
		msg = $.convert($(".right .input_editor > .content_msg").val(), 'plain');

		if (msg == null || msg == "") {
			var str = lang == null ? "请输入内容  " : lang.linkit.Message_isnull;
			$.alert(str);
			return;
		}

		var cs = [];
		cs = messagePanel.readerContactFromInputbox();
		if (cs == null || cs.length < 1) {
			var str = lang == null ? "请输入电话号码  " : lang.linkit.Dail_input_phonenumber;
			return;
		}
		var ns = new Array();
		var contactType = LINKit_CONST.CONTACT_TYPE.NORMAL;
		for (var t = 0; t < cs.length; t++) {
			if (cs[t].phonenumber.sTrim() != "") {
				ns.push(cs[t].phonenumber);
				contactType = cs[t].incontact;
				var message = {};
				message.status = LINKit_CONST.MESSAGE_STATUS.SEND_MSG;
				message.sendstatus = 1;
				message.message = msg;
				message.phonenumber = cs[t].phonenumber;
				var date = new Date();
				message.time = date.getTime();
				contactManager.addMessage(message);
				contactManager.addSendingMessage(message);
			}
		}

		messagePanel.sendSMS(ns, contactType, msg,function(ret){
			MyLog(ret);
			messagePanel.showSession(messagePanel.contact);
		});
		$('.right .input_editor > .content_msg').val('');
		messagePanel.selectedItem = this.getSessionItemID(cs[0].phonenumber);
		messagePanel.defaultClick();
		this.updateHeaderPanel(cs,message);
	}

	MessagePanel.prototype.updateHeaderPanel = function(cs,msg){
		if(cs != null && cs.length > 1){
			this.hideMenu();
			this.hideNewSMSHeader();
			$('.right .menu_content > .select').addClass('select_all');
			$('.right .menu_content > .select').removeClass('unselect_all');
			var name = "";
			for(var i = 0 ; i < cs.length - 1 ;i++){
				name += (cs[i].name ? cs[i].name : cs[i].phonenumber) + ",";
			}
			name += cs[i].name ? cs[i].name : cs[i].phonenumber;
			$("#session_name").text(name);
			$("#session_name").show();
			if(msg != null){
				var $uiItem = this.createRightMessageUI(msg);
				if($('.list > .blank').length > 0 ){
					$uiItem.insertBefore($('.list > .blank'));
				}else{
					$('.list').append($uiItem);
				}
			}
		}
	}

	MessagePanel.prototype.sendSMS = function(numbers, cantactType, messageContent,func) {
		var data = [];
		var message = {};
		message.message = messageContent;
		var msgArr = [message];
		var option = {"message":""};
		for(var i in numbers){
			data[i] = contactManager.createMessageJson(msgArr, numbers[i], option);
		}
		var pack = connectManager.getHeader(data);

		pack.cmd = LINKit_CONST.CONTACT_TYPE.FACEBOOK == cantactType ? "kSendFacebookMsg" : "kSendMessages";
		
		connectManager.sendCmdAndRespone(pack,func);
	}
	
	MessagePanel.prototype.dismissPanel = function(obj)
	{
		$('#search_input_contact_panel').hide();
		$('#sms_menu_list').fadeOut();
		if (messagePanel.emojiVisible) {
			$(".emoji_warp").fadeOut();
			messagePanel.emojiVisible = false;
		}
	}


	MessagePanel.prototype.showLoading = function(){
		$('.link_sms .loading').show();
		mainUI.autoresize();
	}

	MessagePanel.prototype.hideLoading = function(){
		$('.link_sms .loading').hide();
	}
	
	MessagePanel.prototype.sendBlessMsg = function(blessMsgJson){
		//1. trigle new msg click;
		$("#link_sms_new_btn").trigger("click");
		//2. blessMsgJson init message edit;
		$('.right .input_editor > .content_msg').val(blessMsgJson.content);
	}
	/**********MessagePanel class end**********/

	/**********ContactPanel class begin**********/
	function ContactPanel(){
		this.panelType = LINKit_CONST.PANEL_TYPE.CONTACT;
	};
	ContactPanel.prototype = inherit(IPanel.prototype);
	ContactPanel.constructor = ContactPanel;
	ContactPanel.prototype.init = function(){
		this.panel = $('.link_contact');
		this.panelLeft = $('.link_contact .left');
		this.panelRight = $('.link_contact .right');

		this.messagePanelRight = $('.link_sms .right');

		this.contactList = $('#contact_list');
		this.searchIcon		= $(".link_contact .left .search_box .search_icon");
		this.Search			= $(".link_contact .left .search_input");
		this.clearSearch	= $(".link_contact .left .search_clear");

		this.contactPanel = $(".link_contact .right > .contact_panel");
		this.contactSinglePanel = $(".link_contact .right > .contact_panel > .contact");
		this.contactListPanel = $(".link_contact .right > .contact_panel > .contact_list");
		this.contactLastLogList = $(".link_contact .right > .contact_panel > .contact > .last > .last_list");

		//列表中当前选中的item
		this.selectedItem = null ;
		//当前选中的联系人
		this.contact = null;

		//初始化事件响应
		this.searchEvent();
		this.clearSearchEvent();
		this.sendMessageEvent();
		this.callEvent();
	}
	ContactPanel.prototype.show = function(){
		this.panel.show();
		this.defaultClick();
	}

	ContactPanel.prototype.hide = function(){
		this.panel.hide();
	}

	ContactPanel.prototype.clear = function(){
		this.contactList.children(".item").remove();
	}

	//dataChangeType: LINKit_CONST.DATA_CHANGE
	ContactPanel.prototype.refresh = function(dataChangeType, contact){
		switch (dataChangeType){
			case LINKit_CONST.DATA_CHANGE.NEW_CONTACT:
				this.createContactListItemUI(contact);
				this.updateContactListItemUI(contact);
				break;
			case LINKit_CONST.DATA_CHANGE.UPDATE_CONTACT:
				this.updateContactListItemUI(contact);
				break;
			case LINKit_CONST.DATA_CHANGE.NEW_MESSAGE:
				break;
			case LINKit_CONST.DATA_CHANGE.UPDATE_MESSAGE:
				break;
		}
	}

	ContactPanel.prototype.searchEvent = function() {
		this.Search.keyup(function() {
			var text = contactPanel.Search.val();

			if(text.length > 0){
				contactPanel.searchIcon.hide();
				contactPanel.clearSearch.show();
			} else {
				contactPanel.clearSearch.hide();
				contactPanel.searchIcon.show();
			}

			contactPanel.search(text);
		});
	}

	ContactPanel.prototype.clearSearchEvent = function() {
		contactPanel.clearSearch.click(function(event) {
			contactPanel.Search.val("");
			contactPanel.clearSearch.hide();
			contactPanel.searchIcon.show();
			contactPanel.search("");
			event.stopPropagation();
		});
	}
	ContactPanel.prototype.callEvent = function() {
		$('.contact_callit').click(function(event) {
			callPanel.makeACall(contactPanel.contact.phonenumber, contactPanel.contact.name);
		})
	}
	
	ContactPanel.prototype.showMessagePanel = function(contact){
		this.panelRight.hide();
		this.panel.append(this.messagePanelRight);
		messagePanel.newSession(contact);
	}

	ContactPanel.prototype.sendMessageEvent = function(){
		$('.send_sms').bind('click',function(){
			contactPanel.showMessagePanel(contactPanel.contact);
			var $right = $('#link_contact .right');
			if($right.size() >= 2)
			{
				$right.each(function(index, element){
					$(this).hide();
				});
				$right.last().show();
			}
			else
			{
				$right.show();
			}
			});
	}

	ContactPanel.prototype.defaultClick = function() {
		messagePanel.addMessagePanel();
		this.panelRight.show();

		var isClicked = false ;
		var dataList = contactPanel.contactList
		var itemName = contactPanel.selectedItem;
		var $children = dataList.children(".item");
		var j = 0 ;
		if(itemName != null && itemName != ""){
			for(j = 0 ; j < $children.length; j++){
				if($children.eq(j).attr("id") == itemName){
					$children.eq(j).trigger("click");
					isClicked = true;
					break;
				}
			}
		}
		if(!isClicked){
			$children.eq(0).trigger("click");
		}
	}

	ContactPanel.prototype.search = function(text){
		var contactArr = contactManager.searchContact(text);
		var dataList = contactPanel.contactList;

		if(dataList != null){
			var $children = dataList.children(".item");
			$children.hide();
			if(contactArr != null && contactArr.length > 0){
				for(var i = 0 ; i < contactArr.length; i++){
					var itemID = this.getContactListItemID(contactArr[i].phonenumber);
					$("#"+itemID).show();
				}
			}
		}
	}

	ContactPanel.prototype.clearContactListSelected = function() {
		contactPanel.contactList.children().removeClass("current");
	}

	ContactPanel.prototype.clearLastLog = function() {
		this.contactLastLogList.children().remove();
	}

	ContactPanel.prototype.getContactListItemID = function(phonenumber) {
		var number = phonenumber;
		number = number.replace(/[^\d]/g,'');
		number = number.replace(/[ ]/g,""); //替换所有空格
		var id = 'contact_item_' + number;
		return id;
	}

	ContactPanel.prototype.addContactItem = function(item) {
		this.contactList.append(item);
	}

	ContactPanel.prototype.createContactListItemUI = function(contact) {
		if(contact == null || contact.incontact == LINKit_CONST.CONTACT_TYPE.UNKNOWN){
			return;
		}

		var itemID = this.getContactListItemID(contact.phonenumber);
		var $sessionExist = $("#"+itemID);
		if($sessionExist.length != 0){
			return;
		}

		var name = contact.name ? contact.name : contact.phonenumber;

		var $contact_item = $("<div class='item' id='" + itemID + "'></div>");
		var $content = $("<div class='item_content'></div>");
		var $headerLayout = $("<div class='header_layout'></div>");
		var $textLayout = $("<div class='text_layout'></div>");

		var $headerImg = $("<div class='header'></div>");
		var $headerBorder = $("<div class='header_border'></div>");

		var headerImgPath = "url('" + ".//images//tab//myheader_0.png" + "')";
		if(contact.avatar != null && contact.avatar.length > 0){
			headerImgPath = contact.avatar;
		}
		$headerImg.css({'background-image' : headerImgPath});

		$headerLayout.append($headerImg);
		$headerLayout.append($headerBorder);

		var $name = $("<div class='name contact_name'>" +name+ "</div>");
		$textLayout.append($name);

		$content.append($headerLayout);
		$content.append($textLayout);
		$contact_item.append($content);

		$contact_item.attr("NameFirstChar", $.getNameFirstChar(name));

		$contact_item.bind("click", function() {
			messagePanel.addMessagePanel();
			contactPanel.panelRight.show();
			contactPanel.selectedItem = itemID ;
			contactPanel.contact = contact;
			contactPanel.clearContactListSelected();

			$contact_item.addClass("current");

			contactPanel.showContact(contact);
		});

		this.addContactItem($contact_item);
	}

	ContactPanel.prototype.updateContactListItemUI = function(contact) {
		var itemID = this.getContactListItemID(contact.phonenumber);
		var $item = $("#"+itemID);
		if($item.length > 0){
			if(contact.avatar != null && contact.avatar.length > 0){
				$item.find('.header').css({'background-image' : contact.avatar});
			}
			var $children = this.contactList.children(".item");
			for(var i = 0 ; i < $children.length; i++){
				var $itemSrc = $children.eq(i);
				var L1 = $itemSrc.attr("NameFirstChar");
				var L2 = $item.attr("NameFirstChar");
				if($itemSrc.attr("NameFirstChar") > $item.attr("NameFirstChar")){
					$item.insertBefore($itemSrc);
					break;
				}
			}
		}
	}

	//只显示单个联系人信息面板
	//供内部调用
	ContactPanel.prototype.showContact = function(contact){
		if($('.loading').css('display') == 'none'){
			this.contactSinglePanel.show();
			this.contact = contact ;

			//设置头像
			if(contact.avatar != null){
				$('.link_contact .contact_panel .contact .header_b').css('background',contact.avatar);
				$('.link_contact .contact_panel .contact .header_b').css('background-size','contain');
			}else{
				$('.link_contact .contact_panel .contact .header_b').css('background','url(../images/header_big.png)');
				$('.link_contact .contact_panel .contact .header_b').css('background-size','contain');
			}
			$('.link_contact .contact_panel > .contact .contact_box').html(contact.name +"   "+ contact.phonenumber);

			//显示最新的5条历史记录
			var defaultCount = 5;
			var begin = contact.msg.length;
			var end = begin-defaultCount>0 ? begin-defaultCount : 0;
			this.clearLastLog();
			this.showLastLog(contact, begin-1, end);

			if(contact.msg.length > defaultCount){
				var $last_more = $('<div class="last_more"> </div>');
				var $last_more_text = $('<a id="last_moretxt"></a>');
				$last_more_text.html(lang == null ? "查看全部" : lang.linkit.dispaly_all);
				$last_more_text.click(function(){
					contactPanel.showLastLog(contact, end-1, 0)
					$last_more.remove();
				});

				$last_more.append($last_more_text);
				this.contactLastLogList.append($last_more);
			}

			mainUI.autoresize();
		}
	}

	ContactPanel.prototype.showLastLog = function(contact, begin, end){
		if(begin < 0 || end < 0) return;

		for(var i=begin; i>=end; i--){
			var message = contact.msg[i];
			var $last_item = $('<div class="last_item" id="last_item"></div>');
			var $last_item_icon = $('<div class="icon_sms "></div>');
			if(message.status == LINKit_CONST.MESSAGE_STATUS.IN_CALL){
				$last_item_icon.addClass('icon_call_in');
			} else if(message.status == LINKit_CONST.MESSAGE_STATUS.OUT_CALL){
				$last_item_icon.addClass('icon_call_out');
			} else if(message.status == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL){
				$last_item_icon.addClass('icon_call_miss');
			}

			var $last_item_message = $('<div class="lasttxt"></div>');
			var $last_item_time = $('<div class="lasttime"></div>');

			var messageStr = message.message.encodeHtml();
			$last_item_message.html($.replaceUnified(messageStr));

			if(message.time){
				var date = new Date();
				date.setTime(message.time);
				$last_item_time.html(date.format('yyyy-MM-dd hh:mm'));
			}

			$last_item.append($last_item_icon);
			$last_item.append($last_item_message);
			$last_item.append($last_item_time);

			this.contactLastLogList.append($last_item);
		}
	}

	/**********ContactPanel class end**********/

	function Call()
	{
		this.oCall_num_input = $('#call_num_input'); //电话输入框
		this.oBtn = $('.num_1'); //电话号码数字按钮
		this.oCallit = $('.callit'); //拨打电话按钮
		this.oCalling_b = $('.calling_b'); //拨打电话时界面
		this.oTo_small = $('.to_small'); //电话界面最小化按钮
		this.oTo_big = $('.to_big'); //最大化按钮
		this.oCalling_s = $('.calling_s'); //拨打电话最小化界面
		this.oName = $('.state_info .name'); //姓名
		this.oPhoneNum = $('.state_info .num'); //电话号码
		this.oTime = $('.state_info .time'); //通话时间
		
		this.oPhoneNumLit = $('.calling_s .name'); //最小化时姓名
		this.oTimeLit = $('.calling_s .time'); //最小化时通话时间
		this.oRingoff_b = $('#calling_b .ringoff'); //挂断按钮
		this.oRingoff_s = $('#calling_s .ringoff'); //挂断按钮
		this.oDail_list = $('.dail_list'); 
		
		//电话界面原始位置数据
		this.width = this.oCalling_b.width();
		this.height = this.oCalling_b.height();
		this.opacity = this.oCalling_b.css('opacity');
		this.left = '50%';
		this.top =  '50%';
		this.marginLeft = this.oCalling_b.css('marginLeft');
		this.marginTop = this.oCalling_b.css('marginTop');
		this.log_call = $('#call_log .log_call ');
		
		this.oTimer = null; //定时器，用于计算通话时间
		this.sHtml = ''; //储存电话号码的字符串
		
		this.token = null; //打电话token
	}
	
	Call.prototype.init = function(){
		//this.fnKeydown();
		this.fnKeyup();
		this.fnClickNum();
		this.fnDial();
		this.fnSmall();
		this.fnBig();
		this.initTwilio();
		this.fnClear();
	}
	Call.prototype.fnClear = function()
	{
		this.oDail_list.children().remove();
	}
	Call.prototype.fnCommonCall = function(phoneNumber, name)
	{
		this.fnHtml(this.oName, name);
		this.fnHtml(this.oPhoneNumLit, name);
		this.fnHtml(this.oPhoneNum, phoneNumber);
			
		this.oCalling_b.show();
		this.oCalling_s.hide();
		this.fnDrag('calling_b');
		this.fnGetTime(this.oTime, this.oTimeLit);
		this.oCalling_b.animate({width:this.width, height:this.height, top:this.top, left:this.left, opacity:this.opacity, marginTop:this.marginTop, marginLeft:this.marginLeft},'easeOutQuad');
			
		this.MakeACall(phoneNumber);
		this.fnHandCall();
	}
	Call.prototype.fnListCall= function(contact)
	{
		var This = this;
		this.log_call.click(function(){
			This.fnCommonCall(callPanel.contact.phonenumber, callPanel.contact.name);
			
		});
	}
	Call.prototype.fnClickNum = function()
	{
		var This = this;
		this.oBtn.each(function(index, element){
			$(this).click(function(){
				var cursorPos = This.oCall_num_input.selection().start;
				var oNum = $(this).find('.num');
				var str = This.sHtml.substr(0, cursorPos) + oNum.html() + This.sHtml.substr(cursorPos, This.sHtml.length);
				This.sHtml = str;
				This.oCall_num_input.val(This.sHtml);
				This.oCall_num_input.setSelection(cursorPos+1);
				This.search(This.sHtml );
			});
		});
	}
	
	Call.prototype.fnHtml = function(obj, sHtml)
	{
		obj.html(sHtml);
	}
	Call.prototype.fnDial = function()
	{
		var This = this;
		this.oCallit.click(function(){
			This.sHtml = This.oCall_num_input.val();
			if(This.sHtml.sTrim() == '')
			{
				var str = lang == null ? "请输入电话号码  " : lang.linkit.Dail_input_phonenumber;
				$.alert(str);	
				return;
			}
			var contact = contactManager.findContactByNumber(This.sHtml);
			var name = null;
			if(contact){
				name = contact.name;
			} else {
				name = This.sHtml;
			}
			

			This.fnHtml(This.oPhoneNum, This.sHtml);
			This.fnCommonCall(This.sHtml, name);

		});
	}
	
	Call.prototype.fnSmall = function()
	{
		var This= this;
		this.oTo_small.click(function(){
			This.oCalling_b.animate({width:0, height:0, top:0, left:$(window).width(), opacity:0, marginTop:0, marginLeft:0}, function(){
				This.oCalling_b.hide();
				This.oCalling_s.show();	
			});
		});
	}
	
	Call.prototype.fnBig = function()
	{
		var This= this;
		this.oTo_big.click(function(){
			This.oCalling_b.show();
			This.oCalling_s.hide();	
			This.oCalling_b.animate({width:This.width, height:This.height, top:This.top, left:This.left, opacity:This.opacity, marginTop:This.marginTop, marginLeft:This.marginLeft},'easeOutQuad');
		});
	}
	
	Call.prototype.fnKeyup = function()
	{
		var This = this;
		this.oCall_num_input.keyup(function(ev){
			This.sHtml = This.oCall_num_input.val();
			if(This.sHtml.length == 0)
			{
				This.fnClear();
			}
			else
			{
				This.search(This.sHtml );
			}
			
		});	
	}
	
	Call.prototype.fnKeydown = function()
	{
		var This = this;
		this.oCall_num_input.keydown(function(ev){
			if(ev.keyCode != 8 && (ev.keyCode < 48 || ev.keyCode > 57 || ev.keyCode != 187) )
			{
				return false;	
			};
		});	
	}
	Call.prototype.fnDrag = function(id)
	{
		var oDrag = new Drag(id);	
	}
	Call.prototype.fnGetTime = function(obj1,obj2)
	{
		var This = this;
		clearInterval(this.oTimer);
		var iNum1 = 0,
			iNum2 = 0,
			iNum3 = 0;
		fnSetTime();
		this.oTimer = setInterval(fnSetTime, 1000);
		function fnSetTime()
		{
			iNum1++;
			if(iNum1 == 60)
			{
				iNum1 = 0;
				iNum2++;
				if(iNum2 == 60)
				{
					iNum2 = 0;
					iNum3++;	
				}	
			}
			var str = This.toDouble(iNum3) + ':' + This.toDouble(iNum2) + ':' + This.toDouble(iNum1);
			obj1.html(str);
			obj2.html(str);
		}
	}
	Call.prototype.toDouble = function(num)
	{
		if(num < 10)
		{
			return '0' + num;	
		}
		else
		{
			return '' + num;	
		}
	}

	Call.prototype.search = function(text)
	{
		var contactArr = contactManager.searchContact(text);
		if(contactArr.length == 0)
		{
			this.oDail_list.children('.dial_item_content').remove();
		}
		if(this.oDail_list != null && contactArr != null && contactArr.length > 0)
		{
			this.oDail_list.children('.dial_item_content').remove();
			for(var i = 0; i < contactArr.length; i++)
			{
				var str = '<div class="dial_item_content"><div class="header_layout fl"><div class="header"></div></div><div class="text_layout fl"><span class="num">'+contactArr[i].phonenumber+'</span><span class="name">'+contactArr[i].name+'</span></div></div>';
				this.oDail_list.append(str);
			}
		}
	}
	
	Call.prototype.initTwilio = function(){
		var clientName = "LINKit";
        var twilioAuth = '/_twilio_auth?name=LINKit';
        var This = this;
        $.get(twilioAuth, function(result){
            This.token = result;

            if(This.token && typeof(Twilio) != "undefined"){
                Twilio.Device.setup(This.token, {debug: true});
                Twilio.Device.ready(function (device) {
                });

                Twilio.Device.error(function (error) {
					switch(error.code){
					case 31208:
						alert(error.message);
						break;
					}
                });

                Twilio.Device.connect(function (conn) {
                });

                Twilio.Device.disconnect(function (conn) {
                });

                Twilio.Device.incoming(function (conn) {
                    //$("#log").text("Incoming connection from " + conn.parameters.From);
                    // accept the incoming connection and start two-way audio
                    conn.accept();
                });

                /*Twilio.Device.presence(function (pres) {
                    if (pres.available) {
                        // create an item for the client that became available
                        $("<li>", { id: pres.from, text: pres.from }).click(function () {
                            $("#number").val(pres.from);
                            call();
                        }).prependTo("#people");
                    }
                    else {
                        // find the item by client name and remove it
                        $("#" + pres.from).remove();
                    }
                });*/
            }
        })
	}
	
	Call.prototype.MakeACall = function(phoneNumber){
		if(!this.token){
			var str = lang == null ? "正在连接电话服务器， 请稍后再拨" : lang.linkit.connect;
			$.alert(str);
			return;
		}
		/*if(phoneNumber[0] == '+' ||  (phoneNumber[0]=='8' && phoneNumber[1]=='6')){
			params = { "phoneNumber": phoneNumber };
		} else {
			var number = '86' + phoneNumber;
			params = { "phoneNumber": number };
		}*/
		
		var params = { "phoneNumber": phoneNumber };
		if(typeof(Twilio) != "undefined")
		{
			Twilio.Device.connect(params);
		} 
	}
	
	Call.prototype.HangCall = function(){
		if(typeof(Twilio) != "undefined")
		{
			Twilio.Device.disconnectAll();
		}
	}
	Call.prototype.fnHandCall = function(){
		var This = this;
		this.oRingoff_b.get(0).onclick = this.oRingoff_s.get(0).onclick = function()
		{
			This.HangCall();
			This.oCalling_b.hide();
			This.oCalling_s.hide();
		}
		
	}
	
	//拖拽对象
	function Drag(id)
	{
		var This = this;
		
		if(id)
		{
			this.obj = document.getElementById(id);
			
			this.disX = 0;
			this.disY = 0;
			
			this.obj.onmousedown = function (ev)
			{
				This.fnDown(ev);
			};
		}
	}
	//鼠标按下
	Drag.prototype.fnDown = function (ev)
	{
		var This = this;
		
		var oEvent = ev || event;
		this.disX = oEvent.clientX - this.obj.offsetLeft + parseInt(getStyle(this.obj, 'marginLeft'));
		this.disY = oEvent.clientY - this.obj.offsetTop + parseInt(getStyle(this.obj, 'marginTop'));
		
		//鼠标移动
		document.onmousemove = function (ev)
		{
			This.fnMove(ev);
			if(This.obj.setCapture)
			{
				This.obj.setCapture();
			}
			
			return false;
		};
		
		//鼠标抬起
		document.onmouseup = function ()
		{
			This.fnUp();
			if(This.obj.setCapture)
			{
				This.obj.releaseCapture();
				//清掉这个IE的捕获
			}
		}
	}
	//鼠标移动方法
	Drag.prototype.fnMove = function (ev)
	{
		var oEvent = ev || event;
		//if(parseInt(getStyle(this.obj, 'marginLeft')) != 0)
		//{
			var l = oEvent.clientX - this.disX;
			var t = oEvent.clientY - this.disY
			
			var marginLeft = -parseInt(getStyle(this.obj, 'marginLeft'));
			var marginTop = -parseInt(getStyle(this.obj, 'marginTop'));
			
			if(l <= marginLeft)
			{
				l = marginLeft;
			}
			else if(l >= document.documentElement.clientWidth - this.obj.offsetWidth + marginLeft)
			{
				l= document.documentElement.clientWidth - this.obj.offsetWidth + marginLeft
			}
			if(t <= marginTop)
			{
				t = marginTop;
			}
			else if(t >= document.documentElement.clientHeight - this.obj.offsetHeight + marginTop + 400)
			{
				t = document.documentElement.clientHeight - this.obj.offsetHeight + marginTop + 400;
			}
			
			this.obj.style.left =  l + 'px';
			this.obj.style.top = t + 'px';
		//}
		//else
		//{
			//this.obj.style.left = oEvent.clientX - this.disX + 'px';
			//this.obj.style.top = oEvent.clientY - this.disY + 'px';
		//}
	}
	
	//鼠标抬起方法
	Drag.prototype.fnUp = function ()
	{
		document.onmousemove = null;
		document.onmouseup = null;
	}
	
	function CallPanel(){
		this.panelType = LINKit_CONST.PANEL_TYPE.CALL;
	};
	CallPanel.prototype = inherit(IPanel.prototype);
	CallPanel.constructor = CallPanel;
	CallPanel.prototype.init = function(){
		this.panel = $('.link_call');
		this.panelLeft = $('.link_call .left');
		this.panelRight = $('.link_call .right');
		this.messagePanel = $('.link_sms .right');
		
		this.callList = $('#call_list');
		this.callInfoPanel = $('#call_log');
		this.dialPanel = $('#call_new');
		
		this.name = $('.link_call .right .log_name');
		this.phoneNumber = $('.link_call .right .log_num');
		this.callLogList = $('.link_call .right .call_bottom .log_item');
		
		this.searchIcon	= $(".link_call .left .search_box .search_icon");
		this.clearSearch = $(".link_call .left .search_clear");
		
		this.Search = $('#search_input_call');
		this.clearSearch = $('#search_clear_call');
		
		this.selectedItem = null ;
		this.contact = null;
			
		this.dialClickEvent();
		this.searchEvent();
		this.clearSearchEvent();
		this.oCall = new Call();
		this.oCall.init();
		
		this.oCall.fnListCall(callPanel.contact);
		this.sendMessageEvent();
	}
	CallPanel.prototype.show = function(){
		messagePanel.addMessagePanel()
		var $right = $('#link_call .right');
		this.panel.show();
		/* if($('#link_call .right').css('display') == 'none' && $('#link_call .right').not('.session_panel'))
		{
			$('#link_call .right').show();
		} */
		if($right.size() >= 2)
		{
			$right.each(function(index, element){
				$(this).hide();
			});
			$right.first().show();
		}
		else
		{
			$right.show();
		}
			
	}

	CallPanel.prototype.hide = function(){
		this.panel.hide();
	}
	CallPanel.prototype.clear = function(){
		this.callList.children(".item").remove();
	}

	//dataChangeType: LINKit_CONST.DATA_CHANGE
	CallPanel.prototype.refresh = function(dataChangeType, contact){
		switch (dataChangeType){
			case LINKit_CONST.DATA_CHANGE.NEW_CONTACT:
				this.createCallItem(contact);
				this.updateCallItem(contact);
				this.updateAvatar(contact);
				break;
			case LINKit_CONST.DATA_CHANGE.UPDATE_CONTACT:
				this.updateAvatar(contact);
				break;
			case LINKit_CONST.DATA_CHANGE.NEW_MESSAGE:
				this.createCallItem(contact);
				this.updateCallItem(contact);
				break;
			case LINKit_CONST.DATA_CHANGE.UPDATE_MESSAGE:
				//update call list item;
				break;
		}
	}
	
	CallPanel.prototype.dialClickEvent = function(){
		$('#link_call_new_btn').click(function(event){
			callPanel.showDailPanel();
		});
	}
	
	CallPanel.prototype.searchEvent = function() {
		var This = this;
		this.Search.keyup(function() {
			var text = This.Search.val();

			if(text.length > 0){
				This.searchIcon.hide();
				This.clearSearch.show();
			} else {
				This.clearSearch.hide();
				This.searchIcon.show();
			}

			This.search(text);
		});
	}

	CallPanel.prototype.clearSearchEvent = function() {
		var This = this;
		This.clearSearch.click(function(event) {
			This.Search.val("");
			This.clearSearch.hide();
			This.searchIcon.show();
			This.search("");
			event.stopPropagation();
		});
	}
	
	CallPanel.prototype.search = function(text){
		var contactArr = contactManager.searchContact(text);
		
		var callList = callPanel.callList;

		if(callList != null){
			var $children = callList.children(".item");
			$children.hide();
			if(contactArr != null && contactArr.length > 0){
				for(var i = 0 ; i < contactArr.length; i++){
					var itemID = this.getCallListItemID(contactArr[i].phonenumber);
					$("#"+itemID).show();
				}
			}
		}
	}
	
	CallPanel.prototype.getCallListItemID = function(phonenumber){
		var number = phonenumber;
		number = number.replace(/[^\d]/g,'');
		number = number.replace(/[ ]/g,""); //替换所有空格
		var id = 'call_item_' + number;
		return id;
	}
	
	CallPanel.prototype.getLastCall = function(contact){
		for(var i=contact.msg.length-1; i>=0; i--){
			if(contactManager.messageType(contact.msg[i]) == LINKit_CONST.MESSAGE_TYPE.CALL){
				return contact.msg[i];
			}
		}
		return null;
	}
	CallPanel.prototype.getAllCall = function(contact){
		var arr = [];
		for(var i=contact.msg.length-1; i>=0; i--){
			if(contactManager.messageType(contact.msg[i]) == LINKit_CONST.MESSAGE_TYPE.CALL){
				arr.push(contact.msg[i]);
			}
		}
		return arr;
	}
	CallPanel.prototype.createCallItem = function(contact){
		var This = this;
		var lastCall = this.getLastCall(contact);
		if(contact == null || !lastCall){
			return;
		}

		var itemID = this.getCallListItemID(contact.phonenumber);
		var $sessionExist = $("#"+itemID);
		if($sessionExist.length != 0){
			return;
		}
		
		var name = contact.name ? contact.name : contact.phonenumber;
		
		var sHtml = '';
		
		
		sHtml += '<div id="'+itemID+'" lasttime="'+lastCall.time+'" class="item">';
		sHtml += '<div class="item_content">';
		sHtml += '<div class="header_layout"><div class="header"></div></div>';
		sHtml += '<div class="text_layout">';
		sHtml += '<div class="name">' + name + '</div>';
		sHtml += '<div class="time"></div>';
		sHtml += '<div class="latest"><span class="callname"></span>';
		sHtml += '<span class="calltime">' + lastCall.message + '</span>';
		sHtml += '</div></div></div></div>';
		
		this.callList.append(sHtml);
		
		var $callItem = $('#' + itemID);
		$callItem.bind("click", function() {
			
			if($('#link_call').hasClass('right') && $('#link_call .right').css('display') == 'none')
			{
				$('#link_call .right').css('display', 'block');
			}
			messagePanel.addMessagePanel();
			callPanel.panelRight.show();
			callPanel.selectedItem = itemID ;
			callPanel.contact = contact;
			callPanel.clearContactListSelected();
			$callItem.addClass("current");

			callPanel.showCallInfo(callPanel.contact);
			
		});
	}
	
	CallPanel.prototype.updateCallItem = function(contact){
		var itemID = this.getCallListItemID(contact.phonenumber);
		var $item = $("#"+itemID);
		if($item.length > 0){
		
			var lastCall = this.getLastCall(contact);
			var messsageStatus = null;
			if(lastCall.status == LINKit_CONST.MESSAGE_STATUS.IN_CALL){
				messsageStatus = lang == null ? "来电  " : lang.linkit.in_call;
			} else if(lastCall.status == LINKit_CONST.MESSAGE_STATUS.OUT_CALL){
				messsageStatus = lang == null ? "外拨电话  " : lang.linkit.out_call;
			} else if(lastCall.status == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL){
				messsageStatus = lang == null ? "未接电话  " : lang.linkit.missed_call;
			}
		
			//更新内容
			$item.attr('lasttime', lastCall.time);
			$item.find('.calltime').html(lastCall.message);
			var date = new Date();
			date.setTime(lastCall.time);
			$item.find('.time').html(date.format('MM-dd'));
			
			var $children = this.callList.children(".item");
			for(var i = 0 ; i < $children.length; i++){
				var $itemSrc = $children.eq(i);
				var L1 = $itemSrc.attr("lasttime");
				var L2 = $item.attr("lasttime");
				if(L1 < L2){
					$item.insertBefore($itemSrc);
					break;
				}
			}
		}
	}
	
	CallPanel.prototype.updateAvatar = function(contact){
		//update session contact avatar
		var itemID = this.getCallListItemID(contact.phonenumber);
		var $sessionExist = $("#"+itemID);
		if($sessionExist.length > 0){
			$header = $sessionExist.find(".header");
			if($header){
				$header.css('background-image',contact.avatar);
			}
		}
		
		//update right panel contact avatar
		if(this.contact != null && this.contact.phonenumber == contact.phonenumber){
			$('#call_log .log_header').css('background-image',contact.avatar);
		}
	}
	
	CallPanel.prototype.showMessagePanel = function(contact){
		this.panelRight.hide();
		this.panel.append(this.messagePanel);
		this.messagePanel.show();
		messagePanel.newSession(contact);
	}

	CallPanel.prototype.sendMessageEvent = function(){
		var This = this;
		$('#call_log .log_sms').bind('click',function(){
			This.showMessagePanel(This.contact);
		});
	}
	CallPanel.prototype.showCallInfo = function(contact){
		this.dialPanel.hide();
		this.callInfoPanel.show();
		
		this.name.html(contact.name);
		this.phoneNumber.html(contact.phonenumber);
		if(typeof(contact.avatar) == 'undefined')
		{
			var ImgPath = "url('" + "./images/header_big.png" + "')";
			$('.right .log_header').css({'background-image' : ImgPath});
		}
		if(this.contact != null && this.contact.phonenumber == contact.phonenumber){
			$('.right .log_header').css('background-image', contact.avatar);
		}
		this.callLogList.children().remove();
		
		
		
		var allCall = this.getAllCall(contact);
		
		for(var i = 0; i < allCall.length; i++)
		{
			var str = '';
			var messsageStatus = null;
			var calltype = "icon_call_in";
			if(allCall[i].status == LINKit_CONST.MESSAGE_STATUS.IN_CALL){
				messsageStatus = lang == null ? "来电  " : lang.linkit.in_call;
				calltype = "icon_call_in";
			} else if(allCall[i].status == LINKit_CONST.MESSAGE_STATUS.OUT_CALL){
				messsageStatus = lang == null ? "外拨电话  " : lang.linkit.out_call;
				calltype = "icon_call_out";
			} else if(allCall[i].status == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL){
				messsageStatus = lang == null ? "未接电话  " : lang.linkit.missed_call;
				calltype = "icon_call_miss";
			}
			var date = new Date();
			date.setTime(allCall[i].time);
			str += '<div class="item_content"><div class="icon fl '+calltype+'"></div> <div class="tandc fl"><div class="text fl">'+messsageStatus+'</div><div class="calltime fl">' + allCall[i].message + '</div></div><div class="time fl">'+date.format("yyyy-MM-dd hh:mm")+'</div></div></div></div>';
			
			this.callLogList.append(str);
		}
		
	}
	
	CallPanel.prototype.showDailPanel = function(contact){
		this.dialPanel.show();
		this.callInfoPanel.hide();
	}
	
	CallPanel.prototype.clearContactListSelected = function(contact){
		callPanel.callList.children().removeClass("current");
	}
	
	CallPanel.prototype.makeACall = function(phonenumber, name){
		this.oCall.fnCommonCall(phonenumber, name);
	}

	function NotificationPanel(){
		this.panelType = LINKit_CONST.PANEL_TYPE.NOTIFICATION;
	};
	NotificationPanel.prototype = inherit(IPanel.prototype);
	NotificationPanel.constructor = NotificationPanel;
	NotificationPanel.prototype.init = function(){
		this.panel = $('.link_notice');
		this.notificationPanel = $(".link_notice .right > .notification_panel");
		this.notificationListPanel = $(".link_notice .right > .notification_panel > .notification_list");
		this.clearBtn = $(".notification_clear_all_panel .clear_all")
		this.clearAll();
	}
	NotificationPanel.prototype.show = function(){
		this.panel.show();
		this.showNotification(notificationManager.notification);
	}

	NotificationPanel.prototype.hide = function(){
		this.panel.hide();
	}
	NotificationPanel.prototype.clear = function(){
		this.clearNotificationListPanel();
	}

	//dataChangeType: LINKit_CONST.DATA_CHANGE
	NotificationPanel.prototype.refresh = function(dataChangeType, data){
		var ntfMgr = data;
		if(dataChangeType == LINKit_CONST.DATA_CHANGE.UPDATE_NOTIFICATION){
			this.showNotification(ntfMgr.notification);
		}
	}

	NotificationPanel.prototype.clearNotificationListPanel = function() {
		this.notificationListPanel.children().remove();
	}
	
	NotificationPanel.prototype.showClearBtn = function() {
		if(this.notificationListPanel.children().size() == 0)
		{
			this.clearBtn.hide();
		}
		else
		{
			this.clearBtn.show();
		}
	}
	

	NotificationPanel.prototype.showNotification = function(ns){
		if($('.loading').css('display') == 'none'){
			//this.showNotificationListPanel();
			this.clearNotificationListPanel();
			if(ns == null || ns.length == 0){
				$('.link_notice .no_notification').show();
			}else{
				$('.link_notice .no_notification').hide();
				for(var i = 0 ; i <ns.length ; i++){
					var $item = this.createNotificationUI(ns[i]);
					this.notificationListPanel.append($item);
				}
				this.showClearBtn();
			}
			//mainUI.autoresize();
		}
	}

	//创建一条notification数据的UI
	NotificationPanel.prototype.createNotificationUI = function(notification){
		var This = this;
		var date = new Date();
		date.setTime(notification.time);
		var $item = $("<div class='notification_item'></div>");
		var $appIcon = $('<div class="notification_icon"></div>');
		var appIconPath = "url('" + notification.icon + "')";
		$appIcon.css({'background-image' : appIconPath});
		var $more = $('<div class="notification_more"></div>');
		var $ntfTitle = $("<div class='notification_text'>" + notification.title + "</div>");
		var $ntfTime = $("<div class='notification_time'>" + date.format("yyyy-MM-dd hh:mm") + "</div>");
		var $ntfCloseBtn = $('<div class="notification_close needws"></div>');
		var $ntfText = $("<div class='notification_desc'>" + notification.desc + "</div>");
		var $separatorLine = $("<div class='separator'></div>");

		$item.append($appIcon);
		$item.append($more);
		$more.append($ntfTitle);
		$more.append($ntfTime);
		if(notification.type != "sys"){
			$more.append($ntfCloseBtn);
		}
		$more.append($ntfText);
		$more.append($separatorLine);

		//handle event
		$ntfCloseBtn.bind("click", function(event){
			if($ntfCloseBtn.hasClass('disconnect')){}else{
				$.confirmYN({
					message : (lang == null ? "确定删除这个通知吗？" : lang.linkit.delete_notification),
					callback : function(value) {
						if (value) {
							$item.hide(200);
							notificationManager.remove(notification.id);
							var ntfArray = new Array();
							ntfArray[0] = notification;
							notificationManager.syncNotificationToServer("kDeleteNotification", ntfArray);
							This.showClearBtn();
						}
					}
				});
			}
		});
		return $item;
	}
	
	NotificationPanel.prototype.clearAll = function(){
		var This = this;
		this.clearBtn.click(function(){
			if(!This.clearBtn.hasClass('disconnect')){
				$.confirmYN({
					message : (lang == null ? "确定删除所有通知吗？" : lang.linkit.delete_all_notification),
					callback : function(value) {
						if (value) {
							notificationManager.removeAll();
							This.showClearBtn();
						}
					}
				});
			}
		});
	}
	
	function BlessingPanel()
	{
		this.panelType = LINKit_CONST.PANEL_TYPE.BLESSING;
		this.panel = $('#link_yang');
		this.$yang_contact = $('.yang_contact');
		this.$divBox = this.$yang_contact.children('.yang_insert');
		this.$loading = $('#yang_loading');
		this.messagePanelRight = $('.link_sms .right');
		this.$link_yang_main = $('.link_yang_main');
		this.indexNum = 0;
		this.pageNum = 1;
		this.count = 20;
		this.bChange = true;
		this.bFirstLoading = true;
		this.bShowForwardNum = true;
		
		//{"id":1,"content":"dddddddddddd1","forward":2}
		this.blessingSMS = [];
		this.msgId = ''; 
	}
	BlessingPanel.prototype = inherit(IPanel.prototype);
	BlessingPanel.constructor = BlessingPanel;
	
	BlessingPanel.prototype.refresh = function()
	{
		
	}
	
	BlessingPanel.prototype.show = function()
	{
		this.panel.show();
		this.showMessage();
	}
	BlessingPanel.prototype.hide = function()
	{
		this.panel.hide();
	}
	
	BlessingPanel.prototype.clear = function()
	{

	}
	BlessingPanel.prototype.getMessagebyScroll = function()
	{
		var This = this;
		this.$yang_contact.get(0).onscroll = window.onresize = function()
		{
			var scrollTop = this.scrollTop;
			var scrollHeight = this.scrollHeight;
			var offsetHeight = this.offsetHeight;

			if(scrollHeight - offsetHeight <= scrollTop)
			{
				if(This.bChange == false) return;
				This.bChange = false;
				This.pageNum++;
				This.getMessage();
			}
		}
	}
	
	BlessingPanel.prototype.getMessage = function()
	{
		var This = this;
		
		$.ajax({
				type: "get",
				url: "/sms/query?",
				data:{
					index:this.indexNum,
					count:this.count
				},
				beforeSend: function(){
					This.$loading.show();
					This.$loading.css('top', This.$yang_contact.get(0).scrollTop + 300 +'px');
				},
				success:function(ret){
					This.bChange = true;
					This.$loading.hide();
					This.indexNum = (This.pageNum - 1) * This.count + This.count;
					if(!ret){
						return;
					}
					
					try{
						var packet = JSON.parse(ret);
					}
					catch(e){
						return;
					}
					
					if(!packet.cmd || !packet.data || typeof(packet.data.count) == 'undefined' || !packet.data.sms || packet.cmd != "kBenisonSMS"){
						return;
					}
					var msgArr = packet.data.sms;
					msgArr.sort(function(msg1, msg2){
						return msg2.forward - msg1.forward;
					});
					if(msgArr.length == 0)
					{
						
					}
					else
					{
						This.addBlessMsgList(msgArr);
						
						for(var i = 0; i < msgArr.length; i++)
						{
							var oDiv = document.createElement('div');
							oDiv.className = 'yang_list';
							var className = '';
							var sForwardNum = '';
							if(This.bShowForwardNum)
							{
								if(i == 0)
								{
									sForwardNum = '<div class="one"></div>';
								}
								else if(i == 1)
								{
									sForwardNum = '<div class="two"></div>';
								}
								else if(i == 2)
								{
									sForwardNum = '<div class="three"></div>';
								}
								else
								{
									sForwardNum = '';
								}
							}
							var sHtml = sForwardNum + '<p id="' + msgArr[i].id + '">' + msgArr[i].content + '</p><div class="forward"><a href="javascript:;"></a><span>' + msgArr[i].forward + '</span></div>';
							oDiv.innerHTML = sHtml;
							var arr2 = [];
							for(var j = 0; j < This.$divBox.length; j++)
							{
								arr2[j] = This.$divBox[j];
							}
							
							arr2.sort(function (div1, div2){
								return div1.offsetHeight - div2.offsetHeight;
							});	
							
							arr2[0].appendChild(oDiv);
							$('.forward a').unbind('click');
							$('.forward a').bind('click',function(){
								This.msgId = $(this).parent().parent().find('p').attr('id');
								var msgJson = This.getBlessMsgById(This.msgId);
								This.showMessagePanel(msgJson);
								This.addFowardNum();
							});
						}
						This.bShowForwardNum = false;
					}
				},
				error:function(){
				}
		});
	}
	BlessingPanel.prototype.addFowardNum = function()
	{
		var This = this;
		$.ajax({
				type: "get",
				url: "/sms/change",
				data:{
					id:This.msgId
				},
				success:function(ret){
					
				}
		});
	}
	BlessingPanel.prototype.showMessage = function()
	{
		//this.indexNum = 0;
		//this.pageNum = 1;
		if(this.bFirstLoading)
		{
			this.bFirstLoading = false;
			this.panel.find(".yang_list").remove();
			this.getMessage();
			this.getMessagebyScroll();
		}
	}
	
	BlessingPanel.prototype.showMessagePanel = function(blessMsgJson){
		navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.MESSAGE);
		messagePanel.sendBlessMsg(blessMsgJson);
	}
	
	BlessingPanel.prototype.clearBlessMsg = function(){
		this.blessingSMS = [];
	}
	
	BlessingPanel.prototype.addBlessMsg = function(oneBlessJson){
		this.blessingSMS.push(oneBlessJson);
	}
	
	BlessingPanel.prototype.getBlessMsgByText = function(text){
		for(var i=0; i<this.blessingSMS.length; i++){
			if(this.blessingSMS[i].content == text){
				return this.blessingSMS[i];
			}
		}
		return null;
	}
	
	BlessingPanel.prototype.addBlessMsgList = function(blessJsonList){
		this.blessingSMS = this.blessingSMS.concat(blessJsonList);
	}
	
	BlessingPanel.prototype.getBlessMsgById = function(id){
		for(var i=0; i<this.blessingSMS.length; i++){
			if(this.blessingSMS[i].id == id){
				return this.blessingSMS[i];
			}
		}
		return null;
	}
	
	function LoginPanel(){
		this.panelType = LINKit_CONST.PANEL_TYPE.LOGIN;
		this.sessionid = this.initSessionID();
		this.panel = $('#link_connect');
		var lenovoIDURL = "https://passport.lenovo.com/wauthen/login?lenovoid.action=uilogin&lenovoid.realm=www.thelinkit.com&lenovoid.uinfo=username&lenovoid.ctx=&lenovoid.cb=" + serverUrl + "/verify";
		this.$exit_btn = $('#exit_btn');
		this.$exit_btn2 = $('#myheader_box_2 .connect_exit');
		$('.link_connect .login_btn').attr("href",lenovoIDURL);
		this.lenovoid = null;
	}
	LoginPanel.prototype = inherit(IPanel.prototype);
	LoginPanel.constructor = LoginPanel;
	
	LoginPanel.prototype.show = function(){
		this.panel.show();
	}
	
	LoginPanel.prototype.hide = function(){
		this.panel.hide();
	}
	
	LoginPanel.prototype.refresh = function(){
		
	}
	
	LoginPanel.prototype.clear = function(){
		
	}
	
		
	LoginPanel.prototype.showFailLinkWindow = function()
	{	
		$('.success_link').hide();
		$('.fail_link').show();
		navigationBar.showState(LINKit_CONST.CONNECT_STATE.NOT_CONNECTED);
		navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.LOGIN);
	}
	
	LoginPanel.prototype.hideFailLinkWindow = function()
	{
		$('.success_link').show();
		$('.fail_link').hide();
	}
	
	LoginPanel.prototype.showConntectedDevice = function(mobileName)
	{
		$('#connect_client').show();
		$('#connect_install').hide();
		$('#connect_client_tip2').html(mobileName);
	}
	
	LoginPanel.prototype.hideConntectedDevice = function()
	{
		$('#connect_client').hide();
		$('#connect_install').show();
	}

	LoginPanel.prototype.drawQRcode = function(){
		$('#connect_qrcode > canvas').remove();
		$('#connect_qrcode').qrcode({ width: 200, height: 200, text: this.sessionid}).children().css('margin', '0px');
		$('#connect_qrcode_load_fail').hide();
	}
	
	LoginPanel.prototype.clearCookie = function(){
		var keys=document.cookie.match(/[^ =;]+(?=\=)/g);
		if (keys) {
			for (var i = keys.length; i--;)
			document.cookie = keys[i]+'=0;expires=' + new Date(0).toUTCString()
		}
	}

	LoginPanel.prototype.initSessionID = function (){
		var token = this.getCookieValue("token");
		if(this.sessionid == null || this.sessionid == ''){
			if(token == null || token === ""){
				token = getToken();
			}
			//this.clearCookie();
			//this.setCookie("token",token,3*30,"/");
		}else{
			token = this.sessionid ;
		}
		return token ;
	}

	LoginPanel.prototype.setCookie = function(name,value,days,path){
		var name = escape(name);
		var value = escape(value);
		var expires = new Date();
		expires.setTime(expires.getTime() + days*24*60*60*1000);
		path = path == "" ? "" : ";path=" + path;
		_expires = (typeof hours) == "string" ? "" : ";expires=" + expires.toUTCString();
		document.cookie = name + "=" + value + _expires + path;
	}

	LoginPanel.prototype.getCookieValue = function(name){
		var name = escape(name);
		//读cookie属性，这将返回文档的所有cookie
		var allcookies = document.cookie;

		//查找名为name的cookie的开始位置
		name += "=";
		var pos = allcookies.indexOf(name);
		//如果找到了具有该名字的cookie，那么提取并使用它的值
		if (pos != -1){                                             //如果pos值为-1则说明搜索"version="失败
			var start = pos + name.length;                  //cookie值开始的位置
			var end = allcookies.indexOf(";",start);        //从cookie值开始的位置起搜索第一个";"的位置,即cookie值结尾的位置
			if (end == -1) end = allcookies.length;        //如果end值为-1说明cookie列表里只有一个cookie
			var value = allcookies.substring(start,end);  //提取cookie的值
			return unescape(value);                           //对它解码
			}
		else return "";
	}
	
	LoginPanel.prototype.login1 = function(){
		var url = location.href;
		var arr = url.split('?');
		var str = arr[1];
		var arr2 = str.split('&');
		for(var i = 0; i < arr2.length; i++)
		{
			var arr3 = arr2[i].split('=');
			if(arr3[0] == 'usename')
			{
				$('#connect_win').hide();
				$('#connect_connected').show();
				$('#connect_connected_t1').html(arr3[1]);
				break;
			}
				
		}
	}
	
	LoginPanel.prototype.loginByCookie = function(){
		var useName = this.getCookieValue('username');
		this.lenovoid = this.getCookieValue('uid');
		if(useName != '')
		{
			loginPanel.sessionid = "lenovoid" + this.lenovoid;
			loginPanel.drawQRcode();
			
			$('#connect_win').hide();
			$('#connect_connected').show();
			$('#connect_connected_t1').html(useName);
			$('#myheader_box_2 .connect_username').html(useName);
			this.clearCookie();
			this.logout();
		}
	}
	LoginPanel.prototype.logoutPublic = function(){
		this.clearCookie();
		window.location.reload();
	}

	LoginPanel.prototype.logout = function()
	{
		var This = this;
		this.$exit_btn.click(function(){
			This.logoutPublic();
		});
		this.$exit_btn2.click(function(){
			This.logoutPublic();
		});
	}
	
	LoginPanel.prototype.getLocationValue = function(){
		var location = window.location;
		
	}
	
	LoginPanel.prototype.LenovoIdSyncLoginState = function(lenovoid_wust)
	{
		 var checkWustUrl="<%=path%>/SSOServlet?wust="+lenovoid_wust;
		 var xmlHttp = null;	
		 if(window.ActiveXObject){ // IE浏览器
			 xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		 }else if(window.XMLHttpRequest){ // 除IE以外的其他浏览器
			 xmlHttp = new XMLHttpRequest();
		 }
		 xmlHttp.open("post", checkWustUrl,true);
		 xmlHttp.send();
		 xmlHttp.onreadystatechange = function () {
			 if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
				//通过xmlHttp.responseText 将用户的id和username传递过来，对页面进行处理
			 }else if(xmlHttp.readyState == 4 && xmlHttp.status != 200){
				 //用户没有登录，维持页面不变即可
			 }
		 };

	}
	
	
	//会话管理类，用来监听跟服务端会话的连接，断开，数据收发等
	function SessionListener(){}

	function ConnectManager(){
		this.url = "ws://114.215.236.240/";
		//this.url = "ws://115.29.178.5/";
		this.connected = false;
		this.responseQuere = new Array();
		this.commandQueue = new Array();
		this.id = "suKeRJtA0YWLcmo1";
		this.index = 0;
		this.confirm = false;
		this.disconnected = false ;
		this.session = {};			//跟web服务端数据会话管理对象
		this.loadedData=false ;
		this.connectTime = 0 ;
	};

	//联系人管理类: 存储联系人信息 及 联系人的短信数据
	function ContactManager(){
		/*contact data struct
		contact{
			"name": "Alex",		//联系人名字
			"phonenumber":"10086",	//联系人号码
			"incontact":1,		//联系人类型（LINKit_CONST.CONTACT_TYPE）
			"avatar":"/avatar/fkdfkdjfd.png",//头像
			"unreadCount":1,	//未读短信数
			"content":"ee",		//最新短信内容
			"time":"1415615978976";//最新短信时间
			"total":100,		//该人的短信总条数，  只在初始化时有效
			"index":5,			//当前已同步到pc端的条数，  只在初始化时有效
			"msg":
			[
				{"id":"2211","message":"11","read":true,"status":1,"time":"1415616003491"},
				{"id":"2212","message":"ee","read":true,"status":1,"time":"1415615978976"},
			],
			"call":
			[
		 		{"id":"1111","message":"00:30","status":in_call/out_call/missed_all,"time":"1415616003491"},
			]
		}
		*/
		this.contacts = new Array();//contacts 为 contact数组

		this.sendingMsgArray = new Array();	//PC端发给手机的状态为发送中的短信
		//数据变化，调用UI回调，通知UI刷新
		this.dataChangeHandles = new Array();
	};

	function NotificationManager(){
		this.notification = new Array();
		//数据变化，调用UI回调，通知UI刷新
		this.dataChangeHandles = new Array();
	}
	/*    */
	function MainUI(){
		
		this.$TopTip = $('#tips_con');
		this.$Close = $('#tips_con .tips_close');
		this.$Text = $('#tips_con .tips_text');
		this.oTimer = null;
		this.tipIndex = 0;
		
		this.documentClick();
	}

	NotificationManager.prototype.init = function(ns){
		this.notification = ns ;
		this.dataChangeNotify(LINKit_CONST.DATA_CHANGE.UPDATE_NOTIFICATION, this);
	}

	NotificationManager.prototype.clean = function(){
		this.notification = new Array();
	}

	NotificationManager.prototype.remove = function(id){
		for(var i = 0 ; i < this.notification.length ; i++){
			if(this.notification[i].id == id){
				this.notification.splice(i,1);
				break ;
			}
		}
		this.dataChangeNotify(LINKit_CONST.DATA_CHANGE.UPDATE_NOTIFICATION, this);
	}

	NotificationManager.prototype.removeAll = function(){
		var ntfArr = new Array();
		var ntfSys = new Array();
		for(var i = 0 ; i < this.notification.length ; i++){
			if(this.notification[i].type != "sys"){
				ntfArr.push(this.notification[i]);
			}else{
				ntfSys.push(this.notification[i]);
			}
		}

		this.notification = ntfSys;
		this.dataChangeNotify(LINKit_CONST.DATA_CHANGE.UPDATE_NOTIFICATION, this);

		this.syncNotificationToServer("kDeleteNotification", ntfArr);
	}

	NotificationManager.prototype.syncNotificationToServer = function(cmd, notificationArr)
	{
		var arr = new Array();
		for(var i = 0 ; i < notificationArr.length ; i++){
			arr.push(notificationArr[i].id);
		}

		var command = connectManager.getHeader(arr);
		command['cmd'] = cmd;
		connectManager.sendCmdAndRespone(command, function(ret){});
	}

	NotificationManager.prototype.add = function(notification){
	}

	NotificationManager.prototype.addList = function(notificationList){
		this.notification = this.notification.concat(notificationList);
		this.dataChangeNotify(LINKit_CONST.DATA_CHANGE.UPDATE_NOTIFICATION, this);
	}


	NotificationManager.prototype.getCount = function()
	{
		return this.notification.length;
	}

	NotificationManager.prototype.bind = function(objID, callback){
		var eventHandle = {};
		eventHandle.objID = objID;
		eventHandle.callback = callback;
		this.dataChangeHandles.push(eventHandle);
	}

	NotificationManager.prototype.unbind = function(eventType, objID){
		for(var i=0; i<this.dataChangeHandles.length; i++){
			if(this.dataChangeHandles[i].objID == objID){
				this.dataChangeHandles.splice(i, 1);
				break;
			}
		}
	}

	NotificationManager.prototype.dataChangeNotify = function(changeType, data){
		for(var i=0; i<this.dataChangeHandles.length; i++){
			this.dataChangeHandles[i].callback(changeType, data);
		}
	}

	ContactBox.prototype.init = function(){
		this.box = $(".right > .session_panel > .right_panel > .number_list > .contact_list_panel > .contact_list");
		this.btnOk = $("#ok");
		this.btnCancel = $("#cancel");
		this.searchBox = $("#search_input_new_sms");
		this.searchIcon = $(".right .session_panel .right_panel .contact_list_panel .search_icon");
		this.clearSearch = $("#search_clear_contact");
		this.clear();
		this.okClickListen();
		this.concelClickListen();
		this.bodyClickListen();
		this.addContactClickEvent();
		this.searchBox.val("");
		this.contactSearch();
		this.clearContent();
		this.clear();
		this.stopPropagation();
	}

	ContactBox.prototype.generateContactsList = function(contacts) {
		if (contacts != null) {
			contactBox.clear();
			for (var i = 0; i < contacts.length; i++) {
				 if(contacts[i].incontact == LINKit_CONST.CONTACT_TYPE.UNKNOWN){
					 continue;
				 }
				var $panel = contactBox.createContactItemUI(contacts[i],i);
				contactBox.addPanel($panel);
				var $children = this.box.children(".contact");
					for(var j = 0 ; j < $children.length; j++){
						var $itemSrc = $children.eq(j);
						var L1 = $itemSrc.attr("NameFirstChar");
						var L2 = $panel.attr("NameFirstChar");
						if($itemSrc.attr("NameFirstChar") > $panel.attr("NameFirstChar")){
							$panel.insertBefore($itemSrc);
							break;
						}
					}
			}
		}
	}

	ContactBox.prototype.addPanel = function(panel) {
		this.box.append(panel);
	}

	ContactBox.prototype.clear = function() {
		this.box.children(".contact").remove();
	}

	ContactBox.prototype.show = function() {
		this.box.show();
	}

	ContactBox.prototype.hide = function() {
		this.box.hide();
	}

	ContactBox.prototype.bodyClickListen = function() {
	}

	ContactBox.prototype.okClickListen = function() {
		var This = this;
		this.btnOk.click(function(event) {
			var contacts = [];
			var index = 0;
			var $list = $('.contact input');
			for (var i = 0; i < $list.length; i++) {
				if($list.eq(i).prop('checked') == true){
					$list.eq(i).prop('checked',false);
					var name = $list.eq(i).next().next().html();
					var number = $list.eq(i).next().next().next().html();
					//alert(name + number);
					var contact = contactManager.findContactByNumber(number);
					contacts[index++] = contact;
				}
			}

			$('.number_list > .contact_list_panel').fadeOut();
			This.is_contact_box_show = false;
			messagePanel.initInputContact(contacts);
			event.stopPropagation();
		});
	}
	
	ContactBox.prototype.concelClickListen = function() {
		var This = this;
		this.btnCancel.click(function(event) {
			var contacts = [];
			var index = 0;
			var $list = $('.contact input');
			for (var i = 0; i < $list.length; i++) {
				if($list.eq(i).prop('checked') == true){
					$list.eq(i).prop('checked',false);
				}
			}
			$('.number_list > .contact_list_panel').fadeOut();
			This.is_contact_box_show = false;
			event.stopPropagation();
		});
	}


	ContactBox.prototype.setContactItemSelectState = function(contacts) {
		var $list = $('.contact input');
		for (var j = 0; j < $list.length; j++) {
			$list.eq(j).prop('checked',false);
			for (var i=0; i<contacts.length; i++){
				var number = $list.eq(j).next().next().next().html();

				if(contacts[i].phonenumber == number){
					$list.eq(j).prop('checked',true);
					break;
				}
			}
		}
	}
	
	ContactBox.prototype.contactSearch = function() {
		this.searchBox.keyup(function(event) {
			var text = contactBox.searchBox.val();

			if(text.length > 0){
				contactBox.searchIcon.hide();
				contactBox.clearSearch.show();
			} else {
				contactBox.clearSearch.hide();
				contactBox.searchIcon.show();
			}

			contactBox.generateContactsList(contactManager.searchContact(text));
			event.stopPropagation();
		});
		this.searchBox.click(function(event) {
			event.stopPropagation();
		});
	}

	ContactBox.prototype.createContactItemUI = function(contact,index) {
		var name = "checkbox" + (10000 + index) ;

		var $item = $("<div class='contact'></div>");
		var $contact_content = $("<div class='contact_content'></div>");
		var $header = $("<div class='header'></div>");
		var $header_border = $("<div class='header_border'></div>");
		var $other = $("<input type='checkbox' name='" + name + "' id='" + name + "' class='css-checkbox' /> <label for='" + name + "' class='css-label'></label> <div class='name'>" + contact.name + "</div> <div class='number'>" + contact.phonenumber + "</div>");

		$item.append($contact_content);
		$contact_content.append($header);
		$contact_content.append($header_border);
		$contact_content.append($other);

		if($header != null && contact.avatar != null && contact.avatar.length > 0){
			$header.css({'background-image' : contact.avatar});
		}

		var name = contact.name ? contact.name : contact.phonenumber;
		$item.attr("NameFirstChar", $.getNameFirstChar(name));
		return $item;
	}

	ContactBox.prototype.addContactClickEvent = function() {
		//$('.right .number_list .add_contact').unbind('click');
		$('.right .number_list .add_contact').click(function(event) {
		  var $contacts = $('.number_list > .contact_list_panel');

		  var contactList = messagePanel.readerContactFromInputbox();

		  if (!contactBox.is_contact_box_show) {
			contactBox.generateContactsList(contactManager.contacts);
			contactBox.setContactItemSelectState(contactList);
			$contacts.fadeIn();
			contactBox.is_contact_box_show = true;
		  } else {
			$contacts.fadeOut();
			contactBox.is_contact_box_show = false;
		  }
		  event.stopPropagation();
		});
		$(".contact").bind("click", function(event) {
			$(this).find("input").prop("checked",(!$(this).find("input").prop("checked")));
			event.stopPropagation();
		});
	}

	ContactBox.prototype.clearContent = function() {
		this.clearSearch.click(function(event) {
			contactBox.searchBox.val("");
			contactBox.clearSearch.hide();
			contactBox.searchIcon.show();
			contactBox.generateContactsList(contactManager.contacts);
			event.stopPropagation();
		});
	}
	ContactBox.prototype.stopPropagation = function()
	{
		$(".number_list > .contact_list_panel").click(function(event) {
			event.stopPropagation();
		});
	}
	
	ContactBox.prototype.dismissPanel = function() {
			if(contactBox.is_contact_box_show == true){
				var $contacts = $('.number_list > .contact_list_panel');
				$contacts.fadeOut();
				contactBox.is_contact_box_show = false;
			}
			//$("#search_input_contact_panel").hide();
			
	}
	
	ContactManager.prototype.clear = function() {
		this.contacts = new Array();
	}

	ContactManager.prototype.bind = function(objID, callback){
		var eventHandle = {};
		eventHandle.objID = objID;
		eventHandle.callback = callback;
		this.dataChangeHandles.push(eventHandle);
	}

	ContactManager.prototype.unbind = function(eventType, objID){
		for(var i=0; i<this.dataChangeHandles.length; i++){
			if(this.dataChangeHandles[i].objID == objID){
				this.dataChangeHandles.splice(i, 1);
				break;
			}
		}
	}

	//创建一个新联系人
	ContactManager.prototype.createOneContact = function(phonenumber, name){
		var newContact = {};
		newContact.phonenumber = phonenumber;
		newContact.name = "";
		newContact.unreadCount = 0;
		newContact.content = "";
		newContact.time = 0;
		newContact.total = 0;
		newContact.index = 0;
		newContact.incontact = LINKit_CONST.CONTACT_TYPE.UNKNOWN;

		if(name != null && name != "null" && name.length > 0){
			newContact.name = name;
		}
		else{
			newContact.name = phonenumber;
		}
		newContact.msg = new Array();
		this.contacts.push(newContact);
		return newContact;
	}

	//判定消息是短信还是电话
	ContactManager.prototype.messageType = function(message){
		switch (message.status)
		{
			case LINKit_CONST.MESSAGE_STATUS.IN_CALL:
			case LINKit_CONST.MESSAGE_STATUS.OUT_CALL:
			case LINKit_CONST.MESSAGE_STATUS.MISSED_CALL:
				return LINKit_CONST.MESSAGE_TYPE.CALL;
			case LINKit_CONST.MESSAGE_STATUS.RECEIVE_MSG:
			case LINKit_CONST.MESSAGE_STATUS.SEND_MSG:
				return LINKit_CONST.MESSAGE_TYPE.SMS;
			default :
				return LINKit_CONST.MESSAGE_TYPE.UNKNOWN;
		}
	}

	ContactManager.prototype.dataChangeNotify = function(changeType, contact){
		for(var i=0; i<this.dataChangeHandles.length; i++){
			this.dataChangeHandles[i].callback(changeType, contact);
		}
	}

	//配对成功，从手机端获取所有联系人信息及短信数据
	ContactManager.prototype.setContactInfos = function(contactJson){
		try{
			if(!contactJson.hasOwnProperty("number") || contactJson.number.length== 0){
				return;
			}
			var phonenumber = contactJson.number;
			var contact = this.findContactByNumber(phonenumber);
			//获取联系人信息
			if(null == contact){
				contact = this.createOneContact(contactJson.number, contactJson.name);
				if(contactJson.hasOwnProperty("incontact")){
					contact.incontact = contactJson.incontact;
				}
			}

			if(contactJson.hasOwnProperty("index") && contactJson.hasOwnProperty("total")){
				//contact.index = contactJson.index;
				contact.total = contactJson.total;
			}

			//获取短信数据
			if(contactJson.hasOwnProperty("msg") && contactJson.msg.length > 0)
			{
				var msgArr = contactJson.msg;
				contact.index += msgArr.length;
				
				var newMsgArr = new Array();
				for(var i in msgArr){
					if(this.messageType(msgArr[i]) == LINKit_CONST.MESSAGE_TYPE.CALL){
						newMsgArr.push(msgArr[i]);
					} else if(!this.IsSendingMessage(phonenumber, msgArr[i])){
						newMsgArr.push(msgArr[i]);
					}
				}
				for(var i in newMsgArr){
					newMsgArr[i].phonenumber = phonenumber;
					contact.msg.push(newMsgArr[i]);
					if (newMsgArr[i].time > contact.time) {

						if(newMsgArr[i].status == LINKit_CONST.MESSAGE_STATUS.RECEIVE_MSG ||
						newMsgArr[i].status == LINKit_CONST.MESSAGE_STATUS.SEND_MSG)
						{
							var lastMessage = newMsgArr[i].message;
							contact.content = lastMessage;
							contact.time = newMsgArr[i].time;
						}
						/* if(newMsgArr[i].status == LINKit_CONST.MESSAGE_STATUS.IN_CALL){
							var str = lang == null ? "来电  " : lang.linkit.in_call;
							lastMessage = str + "  " + newMsgArr[i].message;
						} else if(newMsgArr[i].status == LINKit_CONST.MESSAGE_STATUS.OUT_CALL){
							var str = lang == null ? "外拨电话  " : lang.linkit.out_call;
							lastMessage = str + "  " + newMsgArr[i].message;
						} else if(newMsgArr[i].status == LINKit_CONST.MESSAGE_STATUS.MISSED_CALL){
							var str = lang == null ? "未接电话  " : lang.linkit.missed_call;
							lastMessage = str + "  " + newMsgArr[i].message;
						} */
					}
					if (newMsgArr[i].read == false || newMsgArr[i].read == "false") {
						contact.unreadCount++;
					}
				}
				contact.msg.sort(function(a, b) {
					return a.time - b.time;
				});
			}

			this.dataChangeNotify(LINKit_CONST.DATA_CHANGE.NEW_CONTACT, contact);
				
			contactJson.name = contact.name; //防止协议包里只包含电话号码，补全联系人信息
			contactJson.avatar = contact.avatar;
			return contactJson;
		}
		catch (err) {
			MyLog(err);
		}
	}

	ContactManager.prototype.updateContact = function(contact, option){
		var contactObj = this.findContactByNumber(contact.phonenumber);
		if(contactObj == null){
			return;
		}
		if(option & LINKit_CONST.CONTACT_PROPERTY.NAME){
			contactObj.name = contact.name;
		} else if(option & LINKit_CONST.CONTACT_PROPERTY.NUMBER) {
			contactObj.phonenumber = contact.phonenumber;
		} else if(option & LINKit_CONST.CONTACT_PROPERTY.AVATAR) {
			var ImagPath = contact.avatar;
			if(typeof(contact.avatar) == 'undefined')
			{
				ImagPath = './/images//tab//myheader_0.png';
			}
			
			var headerImgPath = "url('" + ImagPath + "')";
			contactObj.avatar = headerImgPath;
		}else if(option & LINKit_CONST.CONTACT_PROPERTY.UNREAD) {
			contactObj.unreadCount = 0;
		}


		this.dataChangeNotify(LINKit_CONST.DATA_CHANGE.UPDATE_CONTACT, contactObj);
	}

	//新增短信
	ContactManager.prototype.addMessage = function(msg){
		var contact = this.findContactByNumber(msg.phonenumber);
		if(contact == null){
			contact = this.createOneContact(msg.phonenumber, null);
		}
		contact.msg.push(msg);
		if (msg.time > contact.time) {
			contact.time = msg.time;
			contact.content = msg.message;
		}
		contact.msg.sort(function(a, b) {
			return a.time - b.time;
		});

		this.dataChangeNotify(LINKit_CONST.DATA_CHANGE.NEW_MESSAGE, contact);
	}

	//删除短信
	ContactManager.prototype.removeMessage = function(contactJson){
		if(!contactJson.hasOwnProperty("number") || contactJson.number.length== 0 ||
			!contactJson.hasOwnProperty("msg") || contactJson.msg.length== 0){
			return;
		}
		var phonenumber = contactJson.number;
		var msgArr = contactJson.msg;
		var contact = this.findContactByNumber(phonenumber);
		if(contact != null){
			for(var i=0; i<msgArr.length; i++){
				for (var j = 0; j < contact.msg.length; j++) {
					if (contact.msg[j].time == msgArr[i].time) {
						contact.msg.splice(j, 1);
						break;
					}
				}
			}

			if(contact.msg.length > 0){
				contact.msg.sort(function(a, b) {
						return a.time - b.time;
					});
				contact.time = contact.msg[contact.msg.length - 1].time;
				contact.content = contact.msg[contact.msg.length - 1].message;
			}

			this.dataChangeNotify(LINKit_CONST.DATA_CHANGE.UPDATE_MESSAGE, contact);
		}
	}

	//更新短信
	ContactManager.prototype.updateMessage = function(contactJson){
		if(!contactJson.hasOwnProperty("number") || contactJson.number.length == 0 ||
			!contactJson.hasOwnProperty("msg") || contactJson.msg.length == 0){
			return;
		}
		var phonenumber = contactJson.number;
		var msgArr = contactJson.msg;
		var contact = this.findContactByNumber(phonenumber);
		if(contact != null){
			for(var i=0; i<msgArr.length; i++){
				for (var j = 0; j < contact.msg.length; j++) {
					if (contact.msg[j].time == msgArr[i].time) {
						if((contact.msg[j].read != msgArr[i]) && !contact.msg[j].read) {
							contact.unreadCount--;
						}
						contact.msg[j].read = msgArr[i].read;
						break;
					}
				}
			}

			this.dataChangeNotify(LINKit_CONST.DATA_CHANGE.UPDATE_MESSAGE, contact);
		}
	}

	//新增发送中的短信
	ContactManager.prototype.addSendingMessage = function(msg) {
		if (msg != null) {
			this.sendingMsgArray.push(msg);
		}
	}

	//判断是否发送中的短信， 因为android4.4无法操作数据库，所以无法使用id匹配来同步，改用内容+收件人+sending状态共同判断来同步，
	ContactManager.prototype.IsSendingMessage = function(phonenumber, msg){
		for (var i = 0; i < this.sendingMsgArray.length; i++) {
			if (this.sendingMsgArray[i].phonenumber === phonenumber &&
				this.sendingMsgArray[i].message === msg.message) {
				//手机端发送成功后，将短信数据回到PC端，PC更新内存数据
				this.sendingMsgArray[i].id = msg.id;
				this.sendingMsgArray[i].time = msg.time;
				delete this.sendingMsgArray[i].sendstatus;
				this.sendingMsgArray.splice(i, 1);
				return true;
			}
		}
		return false;
	}


	ContactManager.prototype.searchContact = function(fillter){
		var cs = new Array();
		var s1 = -1 ,s2 = -1 ;
		for (var i = 0; i < this.contacts.length; i++) {
			s1 = -1 ;
			s2 = -1 ;
			this.contacts[i].searchIndex = this.contacts.length + 100;
			s1 = this.contacts[i].name.toLowerCase().search(fillter.sTrim().toLowerCase()) ;
			s2 = this.contacts[i].phonenumber.sTrim().toLowerCase().search(fillter.sTrim().toLowerCase());
			if (s1 >= 0 ||  s2 >= 0) {
				this.contacts[i].searchIndex = s1 >= 0 ? s1 : s2;
				s1 = this.contacts[i].searchIndex ;
				this.contacts[i].searchIndex = s2 >= 0 ? (s2 < s1 ? s2 : s1) :s1 ;
				cs.push(this.contacts[i]);
			}
		}
		cs.sort(function(a,b){
			if(a.searchIndex == null || typeof(a.searchIndex) === undefined )
			{
				return 1;
			}else if(b.searchIndex == null || typeof(b.searchIndex) === undefined){
				return -1 ;
			}else{
				return a.searchIndex - b.searchIndex ;
			}

		});
		return cs ;
	}

	ContactManager.prototype.searchByMessage = function(text) {
		var arr = new Array();
		if(text == null || text.length == 0){
			arr = this.contacts;
		}else{
			var s = false;
			with (this) {
				for (var i = 0; i < contacts.length; i++) {
					s = false;
					if (!s && (!!contacts[i].name)) {
						if (contacts[i].name.search(text) >= 0) {
							arr.push(contacts[i]);
							s = true;
						}
					}
					if (!s) {
						if (contacts[i].phonenumber.search(text) >= 0) {
							arr.push(contacts[i]);
						} else {
							for (var j = 0; j < contacts[i].msg.length; j++) {
								if (contacts[i].msg[j].message.search(text) >= 0) {
									arr.push(contacts[i]);
									break;
								}
							}
						}
					}
				}
			}
		}
		this.sort(arr);

		return arr;
	}

	ContactManager.prototype.sort = function(arr) {
		arr.sort(function(a, b) {
			return b.time - a.time;
		});
	}

	ContactManager.prototype.insertionSort = function(arr, obj, func) {
		if (arr.length < 2) {
			return arr;
		}

		var i = arr.length - 1;
		var result = arr.concat(obj);

		while (func(obj, result[i]) < 0) {
			var temp = result[i];
			result[i] = obj;
			result[i + 1] = temp;
			i--;
		}
		return result;
	}

	ContactManager.prototype.findMessageByPhonenumber = function(phonenumber) {
		if (phonenumber != null) {
			phonenumber = phonenumber.sTrim();
			if (phonenumber.indexOf("+86") > 0) {
				phonenumber = phonenumber.substring(3, phonenumber.length);
			}
			var result = null;
			if (this.contacts != null) {
				for (var i = 0; i < this.contacts.length; i++) {
					if (this.contacts[i].search(phonenumber) > 0) {
						result = this.contacts[i].msg;
						break;
					}
				}
			}
			return result;
		}
	}

	ContactManager.prototype.findNameByNumber = function(number) {
		var result = "";
		for (var i = 0; i < this.contacts.length; i++) {
			var phonenumber = this.contacts[i].phonenumber.sTrim();
			for (var k = 0; k < number.length; k++) {
				if (number[k].sTrim().length > 8 && phonenumber.length > 8) {
					if (number[k].sTrim().substring(number[k].sTrim().length - 8, number[k].sTrim().length) == phonenumber.substring(phonenumber.length - 8, phonenumber.length)) {
						if (result.length == 0) {
							result += this.contacts[i].name;
						} else {
							result += ";" + this.contacts[i].name;
						}
						number.splice(k, 1);
						if (number.length == 0) {
							return result;
						}
						break;
					}
				} else {
					if (number[k].sTrim() == phonenumber) {
						if (result.length == 0) {
							result += this.contacts[i].name;
						} else {
							result += ";" + this.contacts[i].name;
						}
						number.splice(k, 1);
						if (number.length == 0) {
							return result;
						}
						break;
					}
				}
			}
		}
		for ( k = 0; k < number.length; k++) {
			if (result.length == 0) {
				result += number[k];
			} else {
				result += ";" + number[k];
			}
		}
		return result;
	},

	ContactManager.prototype.findContactByName = function(name) {
		if (name == null || name == "") {
			return null;
		}
		for (var contact in this.contacts) {
			if (this.contacts[contact].name == name) {
				return this.contacts[contact];
			}
		}
		return null;
	}

	ContactManager.prototype.findContactByNumber = function(number) {
		if (number == null || number == "") {
			return null;
		}
		for (var i = 0; i < this.contacts.length; i++) {
			if(number.indexOf('@chat.facebook.com') != -1)
			{
				if(this.contacts[i].phonenumber == number){
					return this.contacts[i];
				}
			}
			else
			{
				if (this.matchPhonenumber(this.contacts[i].phonenumber, number)) {
					return this.contacts[i];
				}
			}
		}
		return null;
	}

	//判断两个号码是否匹配
	ContactManager.prototype.matchPhonenumber = function(numberSrc, numberDesc) {
		if (numberSrc == null || numberDesc == null) {
			return false;
		}
		var str = numberSrc.sTrim();
		numberDesc = numberDesc.sTrim();
		if (str.length > 8 && numberDesc.length > 8) {
			if (str.substring(str.length - 8, str.length) == numberDesc.substring(numberDesc.length - 8, numberDesc.length)) {
				return true;
			}
		} else {
			if (str == numberDesc) {
				return true;
			}
		}

		return false;
	}

	ContactManager.prototype.getMessage = function(telephoneNos) {
		if (telephoneNos != null) {
			var telephoneArray = telephoneNos.split(";");
			var getmessage = {};
			getmessage['person'] = telephoneArray;
			var cmd = connectManager.getHeader(getmessage);
			cmd['cmd'] = "kGetMessage";
			connectManager.sendCmdAndRespone(cmd, function(ret){});
		}
	}
	ContactManager.prototype.getAllUnreadCount = function()
	{
		var iNum = 0;
		for (var i = 0; i < this.contacts.length; i++) {
			iNum += this.contacts[i].unreadCount;
		}
		return iNum;
	}
	
	ContactManager.prototype.getAllMessageCount = function()
	{
		var iNum = 0;
		for (var i = 0; i < this.contacts.length; i++) {
			iNum += this.contacts[i].total;
		}
		return iNum;
	}

	ContactManager.prototype.createMessageJson = function(messageArr, phonenumber, option){

		/*"data": [
		{
			"index": "",
			"total": "",
			"name": "Alex",
			"number":"10086",
			"msg": [{"id":"","message":"","read":true,"status":1,"time":""}],
		},]*/
		var messageJson = {};
		messageJson.number = phonenumber;
		var msgArr = [];
		for(var i in messageArr){
			var oneMessage = {};
			oneMessage.time = messageArr[i].time;	//id不准，利用时间来删除短信
			if(option){
				if(option.message != null){
					oneMessage.message = messageArr[i].message;
				}
				if(option.read != null){
					oneMessage.read = messageArr[i].read;
				}
			}
			msgArr[i] = oneMessage;
		}
		messageJson.msg = msgArr;
		return messageJson;
	}

	LINKit_SessionManager.impelement.SessionLister.prototype.onOpen = function(){
		connectManager.connected = true;
		loginPanel.hideFailLinkWindow();
		loginPanel.hideConntectedDevice();
		connectManager.connectTime = 0 ;
		loginPanel.drawQRcode();
		connectManager.sendQRCode();
	}

	LINKit_SessionManager.impelement.SessionLister.prototype.onMessage = function(event){
		MyLog(event.data);
		connectManager.receiveDatafromPhone(event.data);
	}

	LINKit_SessionManager.impelement.SessionLister.prototype.onError = function(e){
		connectManager.connected = false;
	}

	LINKit_SessionManager.impelement.SessionLister.prototype.onClose = function(e){
		MyLog("e.code:", e.code, "   e.reason:", e.reason);
		connectManager.connected = false;
		connectManager.disconnect(1000);
		connectManager.disconnected = false ;
		if(connectManager.heartBeat && connectManager.heartBeat > 0){
			clearTimeout(connectManager.heartBeat);
		}
		if(e.code == 1000 || e.code == 1006){
			connectManager.connectTime ++ ;
			if(connectManager.connectTime < 5){
				setTimeout(function(){
					connectManager.connect();
					MyLog("reconnect again.");
				},2*1000);
			} else {
				loginPanel.showFailLinkWindow();
			}
		}
	}
	
	LINKit_SessionManager.impelement.SessionLister.prototype.onPaired = function(e){
		//clear old data
		contactManager.clear();
		navigationBar.clear();
		//get new data
		connectManager.getPhoneInformation();
		connectManager.getAllMessage();
		//show main ui.
		navigationBar.switchPanel(LINKit_CONST.PANEL_TYPE.MESSAGE);
		navigationBar.barItemClickHandle();
		messagePanel.showLoadingProgress();
		messagePanel.showLoading();
		navigationBar.showState(LINKit_CONST.CONNECT_STATE.CONNECTED);
	}

	ConnectManager.prototype.getVisableFunction = function(){
		if(this.phoneInformation != null && this.phoneInformation.sdkVersion < 19){
			return true ;
		}
		return false;
	}

	ConnectManager.prototype.sendQRCode = function(){
		var smsData = null;
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kPostclient";
		cmd['to'] = 's' ;
		this.sendHeartBeat();
		timeTest.sendQRCode = (new Date()).getTime();
		cmd['curtime'] = timeTest.sendQRCode ;
		this.sendCmdAndRespone(cmd, function(ret) {
			timeTest.sendQRCode = (new Date()).getTime() - timeTest.sendQRCode;
			MyLog("sendQRCode",timeTest.sendQRCode);
			if(ret.cmd != null && ret.cmd != "kConflict"){
					sessionLister.onPaired();
			}else{
				mainUI.onAllHide();
				connectManager.disconnect(1000);
			}

		});
	}

	ConnectManager.prototype.sendHeartBeat = function(){
		var msg = this.getHeader()
		msg.cmd = 'kHeartbeat' ;
		msg.to = 's';
		connectManager.sendCmdAndRespone(msg);
		this.heartBeat = setTimeout(function(){
			connectManager.sendHeartBeat();
		},10*1000);

	}

	ConnectManager.prototype.connect = function() {
		this.id = loginPanel.sessionid ;
		MyLog("The websocket start connect:" , (new Date()).getTime());
		this.url = connectUrl ;

		this.session.init(sessionLister);
		this.session.connect(this.url, this.id, loginPanel.lenovoid);
	}

	ConnectManager.prototype.init = function() {
		//this.session = LINKit_SessionManager.impelement.createSession(SESSION_TYPE.ST_COUCHBASE);
		this.session = LINKit_SessionManager.impelement.createSession(SESSION_TYPE.ST_WEBSOCKET);
	}

	ConnectManager.prototype.sendCommand = function(str) {
		if (str != null && str.length > 0) {
			this.session.send(str); return ;

			if (this.connected) {

			} else {
				this.commandQueue.push(str);
				this.reconnect();
			}
		}
	}

	ConnectManager.prototype.receiveCommand = function(str) {

	};

	ConnectManager.prototype.isConnected = function() {
		return this.connected;
	}

	ConnectManager.prototype.getHeader = function(data) {
		var smsJason = {};
		smsJason['v'] = "1.1";
		smsJason['type'] = "request";
		smsJason['id'] = "" + this.index++;
		smsJason['token'] = this.id;
		smsJason['to'] = "a" ;
		smsJason['cid'] = clientID;
		if(data)
			smsJason['data'] = data;
		return smsJason;
	}

	ConnectManager.prototype.clear = function(){
		this.responseQuere = [];
		this.commandQueue = [];
		this.index = 0;
	}
	
	ConnectManager.prototype.sendCmdAndRespone = function(cmdJson, callback) {
		this.responseQuere.push({
			id : cmdJson['id'],
			callback : callback
		});

		//check if need compress data
		// if(null != cmdJson.data.compressed && cmdJson.data.compressed.length > 0){
			// cmdJson.data[cmdJson.data.compressed] = LZString.compressToBase64(cmdJson.data[cmdJson.data.compressed]);
		// }
		//console.log('send:');
		//console.log(cmdJson);
		var cmd = JSON.stringify(cmdJson);
		this.sendCommand(cmd);
	}

	ConnectManager.prototype.getPhoneInformation = function() {
		var smsData = {};
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kGetPhoneInformation";

		var callback = this.parsePhoneInformation();
		this.sendCmdAndRespone(cmd, callback);
	}
	
	ConnectManager.prototype.getAllMessage = function() {
		contactManager.clear();
		navigationBar.clear();
		messagePanel.showLoading();

		var smsData = {};
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kGetAllMessages";
		$("#connect_state").html(lang == null ? "正在获取短信..." : lang.linkit.getting_sms);

		var callback = this.parseAllMessage();
		this.sendCmdAndRespone(cmd, callback);
	}

	ConnectManager.prototype.getAllNotification = function(){
		//notificationManager.init([]);

		var smsData = {};
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kGetAllNotification";

		var callback = this.parseNotification();
		this.sendCmdAndRespone(cmd, callback);
	}
	ConnectManager.prototype.sendFinishedState = function(){
		var smsData = {};
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kFinished";
		this.sendCmdAndRespone(cmd);
	}

	ConnectManager.prototype.getAllContacts = function() {
		var smsData = {};
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kGetAllContacts";
		timeTest.getAllContacts = (new Date()).getTime();
		this.sendCmdAndRespone(cmd, function(ret) {
			timeTest.getAllContacts = (new Date()).getTime() - timeTest.getAllContacts ;
			MyLog("getAllContacts cost :", timeTest.getAllContacts);
			if (null != ret.result.contactsValue && ret.result.contactsValue.length > 0) {
				var contacts = ret.result.contactsValue;
				contactBox.init(contacts);
				$("#connect_state").html(lang == null ? "正在获取短信..." : lang.linkit.getting_sms);
			}
		});
	}

	ConnectManager.prototype.getContactAvatar = function() {
		var smsData = {};
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kGetContactAvatar";
		this.sendCmdAndRespone(cmd, function(ret) {
			if(null != ret.data && ret.data.length > 0){
				for(var i=0; i<ret.data.length; i++){
					var contact = {};
					contact.phonenumber = ret.data[i].number;
					contact.avatar = ret.data[i].avatar;
					contactManager.updateContact(contact, LINKit_CONST.CONTACT_PROPERTY.AVATAR);
				}
			}
		});
	}

	ConnectManager.prototype.parsePhoneInformation = function(){
		timeTest.getPhoneInformation = (new Date()).getTime();
		function parsePhoneInfo(ret){
			timeTest.getPhoneInformation = (new Date()).getTime() - timeTest.getPhoneInformation ;
			MyLog("getPhoneInformation cost :",timeTest.getPhoneInformation);
			if (null != ret.data) {
				connectManager.phoneInformation = ret.data;
				loginPanel.showConntectedDevice(connectManager.phoneInformation.mobileName);
				if(connectManager.getVisableFunction()){
					$('.menu_content > .delete').show();
				}
			}
		}
		return parsePhoneInfo;
	}

	ConnectManager.prototype.parseAllMessage = function(){
		var smsTotal = 0;			//短信总数
		var haveReceived = 0;		//已经收到的短信数

		var bShowSession = false;
		//getAllMessage采用分包发送机制，需校验返回的包是否完整。
		var bFirstPackage = false;	//校验包的完整性:当数据未完全收完时，刷新网页，会重新获取数据，而手机端可能继续发送之前未发完的包
		function parseMsg(ret){
			if(!bShowSession){
				bShowSession = true;
				//mainUI.showOperatorPage();
				connectManager.loadedData = true;
				mainUI.showTopTip();
			}

			if(ret.hasOwnProperty("err") && ret.err != "0" && ret.err == "kGetSMSFailed"){

			}else{
				//初始化总的短信数量
				if(ret.hasOwnProperty("total")){
					smsTotal = ret.total;
				}
				if(!bFirstPackage && ret.hasOwnProperty("index")){
					bFirstPackage = ret.index == 0;
					bFirstPackage = true;
				}
				if(smsTotal >0 && !bFirstPackage){
					return;//没有收到第一个包，其他包为脏数据，不继续处理。
				}
				/*if(ret.hasOwnProperty("index")){
					haveReceived = ret.index;
				}*/
				if (ret.hasOwnProperty("data")){
					for(var i in ret.data){
						contactManager.setContactInfos(ret.data[i]);
						if(ret.data[i].hasOwnProperty("msg")){
							if(ret.data[i].msg.length == 0){
								haveReceived += 1;
							}else{
								haveReceived += ret.data[i].msg.length;
							}
						}
					}
				}
				MyLog("Total message count", smsTotal);
				MyLog("have received message count", haveReceived);
				messagePanel.showMessageLoadingSpeed(haveReceived/smsTotal);
				if(haveReceived >= smsTotal){
					messagePanel.hideLoading();
					$("#link_sms .info_list").scrollTop(0);
					connectManager.getAllNotification();
					messagePanel.defaultClick();
				}
			}
		}
		return parseMsg;
	}

	ConnectManager.prototype.parseNotification = function(){
		function parseNtf(ret){
			connectManager.sendFinishedState();
			notificationManager.init(ret.data);

			connectManager.getContactAvatar();
		}
		return parseNtf;
	}

	ConnectManager.prototype.getAllContacts = function() {
		var smsData = {};
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kGetAllContacts";
		timeTest.getAllContacts = (new Date()).getTime();
		this.sendCmdAndRespone(cmd, function(ret) {
			timeTest.getAllContacts = (new Date()).getTime() - timeTest.getAllContacts ;
			MyLog("getAllContacts cost :",timeTest.getAllContacts);
			if (null != ret.result.contactsValue && ret.result.contactsValue.length > 0) {
				var contacts = ret.result.contactsValue;
				contactBox.init(contacts);
				$("#connect_state").html(lang == null ? "正在获取短信..." : lang.linkit.getting_sms);
			}
		});
	}

	ConnectManager.prototype.getContactAvatar = function() {
		var smsData = {};
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kGetContactAvatar";
		this.sendCmdAndRespone(cmd, function(ret) {
			if(null != ret.data && ret.data.length > 0){
				for(var i=0; i<ret.data.length; i++){
					var contact = {};
					contact.phonenumber = ret.data[i].number;
					contact.avatar = ret.data[i].avatar;
					contactManager.updateContact(contact, LINKit_CONST.CONTACT_PROPERTY.AVATAR);
				}
			}
		});
	}
	
	ConnectManager.prototype.getFacebookContactAvatar = function() {
		var smsData = {};
		var cmd = this.getHeader(smsData);
		cmd['cmd'] = "kGetFacebookContactAvatar";
		this.sendCmdAndRespone(cmd, function(ret) {
			if(null != ret.data && ret.data.length > 0){
				for(var i=0; i<ret.data.length; i++){
					var contact = {};
					contact.phonenumber = ret.data[i].number;
					contact.avatar = ret.data[i].avatar;
					contactManager.updateContact(contact, LINKit_CONST.CONTACT_PROPERTY.AVATAR);
				}
			}
		});
	}

	ConnectManager.prototype.receiveDatafromPhone = function(retString) {
		try {
			if (retString == null) {
				return;
			}
			var ret = JSON.parse(retString);
			if (!ret) {
				return ;
			}

			//check if data has compressed
			if(ret.hasOwnProperty("data") && ret.hasOwnProperty("cmprs")&& ret.cmprs == 1){
				var tmp = LZString.decompressFromBase64(ret.data);
				ret.data = JSON.parse(tmp);
			}

			if (ret.type == "response") {
				for(var i =0; i < this.responseQuere.length;i++){
					if(ret['id'] == this.responseQuere[i].id){
						if(this.responseQuere[i].callback != null){
							this.responseQuere[i].callback(ret);
						}
						break;
					}
				}
				
			} else if (ret.type == "request") {
				if(ret.cmd == "kSendMessages" || ret.cmd == "kNewFacebookMsg"){
					if (null != ret.data && ret.data.length > 0) {
						for(var i in ret.data){
							var contact = contactManager.setContactInfos(ret.data[i]);
							if(typeof(window.external) != "undefined" && typeof(window.external.msgHandle) != "undefined" && contact.msg.length > 0)
							{
								var msg = contact.msg[0];
								if(msg.status == LINKit_CONST.MESSAGE_STATUS.RECEIVE_MSG) {
									window.external.msgHandle(JSON.stringify(contact));
								}
							}
						}
					}
			
				
				}else if(ret.cmd == "kDeleteMessages"){
					if (null != ret.data && ret.data.length > 0) {
						for(var i in ret.data){
							contactManager.removeMessage(ret.data[i]);
						}
					}
				}else if(ret.cmd == "kUpdateMessages"){
					if (null != ret.data && ret.data.length > 0) {
						for(var i in ret.data){
							contactManager.updateMessage(ret.data[i]);
						}
					}
				}else if(ret.cmd === "kDisconnected"){
					this.connected = false ;
				}else if(ret.cmd === "kGetContactsFailed"){

				}else if(ret.cmd === "kGetSMSFailed"){

				}else if(ret.cmd === "KGetNotificationFailed"){

				}else if(ret.cmd === "KGetPhoneInformationFailed"){

				}else if(ret.cmd === "kNewNotification"){
					notificationManager.addList(ret.data);
					if(ret.data && ret.data.length > 0){
						if(typeof(window.external) != "undefined" && typeof(window.external.notificationHandle) != "undefined")
						{
							window.external.notificationHandle(JSON.stringify(ret.data[0]));
						}
					}
				}else if(ret.cmd === "kDeleteNotification"){
					for(var i = 0 ; i < ret.data.length ; i++){
						notificationManager.remove(ret.data[i]);
					}
				}else if(ret.cmd === "kPhoneDisconnected"){
					navigationBar.showState(LINKit_CONST.CONNECT_STATE.NOT_CONNECTED);
			
				}else if(ret.cmd === "kDeviceChanged"){
					//更换了手机设备，导致数据源发生了变化
					var tips = lang == null ? "连接的设备已更换" : lang.linkit.device_changed;
					var sHtml = '<span>' + tips + '<span>';
					mainUI.showTips(sHtml, 10000);
				}
				else if(ret.cmd === ""){
					//error.hide();
				}
			}
		} catch (err) {
			MyLog(err);
		}
	}

	ConnectManager.prototype.reconnect = function() {
		this.session.reconnect();
	}

	ConnectManager.prototype.disconnect = function(code) {
		this.session.close(code);

		this.connected = false;
		this.disconnected = true;
	}

	MainUI.prototype.autoresize = function () {

		var url = location.href;
		if(typeof(window.external) != "undefined" && typeof(window.external.PC) != "undefined")
		{
			var contentHeight = $("body").height() - $(".header").height() - $(".footer").height();
			var contentHeight_yang = $("body").height() - $(".header").height() - $(".footer").height() - $('.yang_title').height();
		}
		else
		{
			var contentHeight = $("body").height() - $(".header").height() - $(".footer").height() - 20;
			var contentHeight_yang = $("body").height() - $(".header").height() - $(".footer").height() - $('.yang_title').height() - 20 ;
		}
		
		$(".content").height(contentHeight);
		$(".frame").height(contentHeight);
		$(".tab").height(contentHeight);
		$(".link_connect").height(contentHeight);
		$(".connect_left").height(contentHeight);
		$(".connect_section").height(contentHeight);
		$(".link_sms").height(contentHeight);
		$(".link_contact").height(contentHeight);
		$(".link_call").height(contentHeight);
		$(".link_notice").height(contentHeight);
		$(".yang_contact").height(contentHeight_yang);
		$(".left").height(contentHeight);
		$(".right").height(contentHeight);
		var hight = $(".right").height() - $(".right_panel").height() - $(".input_editor").height() -12 ;
		$(".right .list").height(hight);
		$('.right .loading').css('margin-top',$(".right").height()/2 - 10);
		$('.right .no_notification').css('margin-top',$(".right").height()/2 - 10);
		$(".right .notification_list").height($(".right").height() - $(".notification_title").height() - $(".notification_clear_all_panel").height());

		var last_list_height = $(".right").height() - $(".right .contact .header_main").height()
			- $(".right .contact .contact_box").height() - $(".right .contact .send").height() - $(".right .contact .lasttitle").height();
		$('.right .contact .last .last_list').css('max-height', last_list_height - 67);
		$('.right .call_log .log_item').height($(".right").height() - 170);
		$('.right .call_new .dail_list').height($(".right").height() - 460);

		$(".link_sms .left .info_list").height($(".link_sms .left").height() - $(".link_sms .search_box").height() - $(".link_sms .link_sms_new").height() - 31);
		$(".link_contact .left .info_list").height($(".link_contact .left").height() - $(".link_contact .search_box").height()  - 22);
		$(".link_call .left .info_list").height($(".link_call .left").height() - $(".link_call .search_box").height() - $(".link_call .link_call_new").height() - 31);
		$(".link_notice .left .info_list").height($(".link_notice .left").height() - $(".link_notice .search_box").height()  - 22);
		//$(".left .info_list").height($(".left").height() - $(".functions_tab").height() - $(".search_box").height() - $(".notification").height() - 22);
		
	}
	
	MainUI.prototype.changeWindow = function () {
		if(typeof(window.external) != "undefined" && typeof(window.external.PC) != "undefined")
		{
			$('.header').height(0);
			$('#parent').css({width:'1074px', height:'600px',overflow:'hidden'});
			$('.footer').css('height', 0).hide();
			
			mainUI.autoresize();					
		}
		
	}

	
	MainUI.prototype.documentClick = function(){
		
		$("#InteractPage").click(function(event){
			//disConnect.dismissPanel();
			messagePanel.dismissPanel();
			contactBox.dismissPanel();
			event.stopPropagation();
			navigationBar.hideFeedbackPanel();
		});
	}
	
	MainUI.prototype.showTopTip = function() {
		var This = this;
		setTimeout(function(){
			This.showTopTipLoop();
		}, 1000);
	}
	
	MainUI.prototype.showTopTipLoop = function() {
		var This = this;
		$.ajax({
			type: "get",
			url: connectManager.session.tipsURL(),
			data:{
				index:This.tipIndex
			},
			success:function(ret){
				if(!ret){
					return;
				}
				
				try{
					var packet = JSON.parse(ret);
				}
				catch(e){
					return;
				}
				
				if(!packet.cmd || !packet.data || typeof(packet.data.index) == 'undefined' || !packet.data.tips || packet.cmd != "kNewTips"){
					return;
				}
				
				if(!packet.data.tips.cn && !packet.data.tips.en){
					return;
				}
				
				This.tipIndex = packet.data.index;
				
				var language = navigator.browserLanguage ? navigator.browserLanguage : navigator.language;	
				var reUrl = /(https?:\/\/)?([a-z0-9\-]+\.)+[a-z]{2,4}(\.[a-z]{2,4})?\/?/ig;
				var sHtml = '';
				if(language.indexOf('zh') < 0){
					sHtml = '<span>' + packet.data.tips.en + '<span>';
				}
				else{
					sHtml = '<span>' + packet.data.tips.cn + '<span>';
				}
				
				sHtml = sHtml.replace(reUrl, function (s){
					return '<a href="'+ s +'" target="_blank">'+ s +'</a>';
				});
				
				setTimeout(function(){
					This.showTips(sHtml, 8000);
				}, 10);
			},
			error:function(){
			}
		});
		setTimeout(function(){
			This.showTopTipLoop();
		}, 1000);
	}
	
	//tipsText: tip内容
	//hideTime: tip自动消失时间
	MainUI.prototype.showTips = function(tipsText, hideTime){
		this.$Text.html(tipsText);
		this.TopTipMove(hideTime);
		this.fnClose();
		this.fnOver();
		this.fnOut();
	}
	
	MainUI.prototype.hideTopTip = function(hideTime) {
		var This = this;
		this.oTimer = setTimeout(function(){
			This.$TopTip.animate({'top': '-60px', 'opacity':'0'}, 200);
		}, hideTime);
	}
	
	MainUI.prototype.TopTipMove = function(hideTime) {
		var This = this;
		clearTimeout(This.oTimer);
		this.$TopTip.show();
		this.$TopTip.animate({'top': "10px", 'opacity':'1'},300, function(){
			
			This.hideTopTip(hideTime);
		});
	}
	
	MainUI.prototype.fnClose = function() {
		var This = this;
		this.$Close.unbind('click');
		this.$Close.click(function(){
			This.$TopTip.animate({'top': '-60px', 'opacity':'0'}, 200);
		});
	}
	
	MainUI.prototype.fnOver = function() {
		var This = this;
		this.$TopTip.unbind('mouseover');
		this.$TopTip.mouseover(function(){
			clearTimeout(This.oTimer);
		});
	}
	
	MainUI.prototype.fnOut = function() {
		var This = this;
		this.$TopTip.unbind('mouseout');
		this.$TopTip.mouseout(function(){
			This.hideTopTip();
		});
	}

	//disConnect      = new Disconnect();
	contactBox		= new ContactBox();
	messagePanel	= new MessagePanel();
	contactPanel	= new ContactPanel();
	callPanel		= new CallPanel();
	notificationPanel = new NotificationPanel();
	blessingPanel = new BlessingPanel();
	loginPanel = new LoginPanel();

	navigationBar	= new NavigationBar();
	sessionLister	= new LINKit_SessionManager.impelement.SessionLister();
	connectManager	= new ConnectManager();
	contactManager	= new ContactManager();
	mainUI			= new MainUI();
	notificationManager = new NotificationManager();

	mainUI.autoresize();
	mainUI.changeWindow();
	$(window).resize(function() {
		mainUI.autoresize();
	});
	// $('.session #name_slot').autocomplete({
	// source: []
	// });
	$(window).on("beforeunload",function(){
		connectManager.unload = true ;
		connectManager.disconnect();
	});

	Pinyin.initialize({
		checkPolyphone: false,
		charcase: 'default'
	});

	contactBox.init();
	messagePanel.init();
	contactPanel.init();
	callPanel.init();
	notificationPanel.init();
	navigationBar.init();
	navigationBar.addPanel(messagePanel, contactPanel, callPanel, notificationPanel, blessingPanel, loginPanel);
	connectManager.init();
	loginPanel.loginByCookie();
	connectManager.connect();
	contactManager.bind("navigationBar", function(dataChangeType, contact){
		navigationBar.refresh(dataChangeType, contact);
	});
	notificationManager.bind("navigationBar", function(dataChangeType, data){
		navigationBar.refresh(dataChangeType, data);
	});
});
	
//PC端与服务器已断开连接，请点击重连按钮重新连接
//
function searchOnFocusSms(){
	$('#search_box_sms').css('background','#f3f3f3')
	$('#search_input_sms').css('background','#f3f3f3')
	
};

function searchOnBlurSms(){
	$('#search_box_sms').css('background','#ededed')
	$('#search_input_sms').css('background','#ededed')
};

function searchOnFocusContact(){
	$('#search_box_contact').css('background','#f3f3f3')
	$('#search_input_contact').css('background','#f3f3f3')
	
};

function searchOnBlurContact(){
	$('#search_box_contact').css('background','#ededed')
	$('#search_input_contact').css('background','#ededed')
};

function searchOnFocusCall(){
	$('#search_box_call').css('background','#f3f3f3')
	$('#search_input_call').css('background','#f3f3f3')
	
};

function searchOnBlurCall(){
	$('#search_box_call').css('background','#ededed')
	$('#search_input_call').css('background','#ededed')
};

//定义function给外部windows程序调用

function extendSendMessage(newMessage){
	var msgObj = JSON.parse(newMessage);
	
	var contact = contactManager.findContactByNumber(msgObj.phonenumber);
	
	var message = {};
	message.status = LINKit_CONST.MESSAGE_STATUS.SEND_MSG;
	message.sendstatus = 1;
	message.message = msgObj.content;
	message.phonenumber = contact.phonenumber;
	var date = new Date();
	message.time = date.getTime();
	contactManager.addMessage(message);
	contactManager.addSendingMessage(message);
	
	var ns = [contact.phonenumber];
	messagePanel.sendSMS(ns, contact.incontact, msgObj.content,function(ret){
		MyLog(ret);
		messagePanel.showSession(messagePanel.contact);
	});
	$('.right .input_editor > .content_msg').val('');
	messagePanel.selectedItem = messagePanel.getSessionItemID(contact.phonenumber);
	messagePanel.defaultClick();
}

function extendDeleteNotification(notify){
	var notifyObj = JSON.parse(notify);
	notificationManager.remove(notifyObj.id);
}