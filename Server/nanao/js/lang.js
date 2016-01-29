var lang = null;

function change_language() {
	var language = navigator.browserLanguage ? navigator.browserLanguage : navigator.language;
	
	if(language.indexOf('zh') < 0)
	{
		lang = LANG_EN;
		$("#ok").attr("value", lang.linkit.ok);
		$("#cancel").attr("value", lang.linkit.cancel);
		$("#connect_desc1").text(lang.linkit.connect_desc1);
		$("#connect_desc2").text(lang.linkit.connect_desc2);
		$("#connect_install_tip1").text(lang.linkit.connect_install_tip1);
		$("#connect_install_tip2").text(lang.linkit.connect_install_tip2);
		$(".message_session_text").text(lang.linkit.message_session_text);
		$(".contact_list_text").text(lang.linkit.contact_list_text);
		$("#search_input_session").attr("placeholder", lang.linkit.search_input_session);
		$("#search_input_contact").attr("placeholder", lang.linkit.search_input_session);
		$("#notification_label").text(lang.linkit.notification_title);
		$(".notification_title > p").text(lang.linkit.notification_title);
		$("#send").attr("value", lang.linkit.send);
		$("#send_sms").text(lang.linkit.send_sms);
		$("#send_sms_to_all").text(lang.linkit.send_sms_to_all);
		$("#input_phonenum_tips").attr("placeholder", lang.linkit.input_phonenum_tips);
		$(".clear_all").text(lang.linkit.clear_all);
		$(".new_sms").text(lang.linkit.new_sms);
		$("#reconnect").text(lang.linkit.reconnect);
		$("#bottom_connect_status").text(lang.linkit.bottom_connect_status);
		$("#back_to_home").text(lang.linkit.back_to_home);
		$(".loading").text(lang.linkit.loading);
		$(".bbs_link").text(lang.linkit.bbs_link);
		$("#last_title").text(lang.linkit.Recent);
		$("#China").text(lang.linkit.China);
		$("#America").text(lang.linkit.America);
		$(".info").text(lang.linkit.pcDisconnect);
		$(".reconnect").text(lang.linkit.reconnect);
		$(".backhome").text(lang.linkit.backhome);
		$("#backhome").text(lang.linkit.backhome);
		$(".connect").text(lang.linkit.connected);
		$("#info").text(lang.linkit.phoneDisconnect);
		$(".loading_font").text(lang.linkit.message_loading);
		$("#link_sms_new_btn").text(lang.linkit.new_message);
		$(".new_sms").text(lang.linkit.new_message);
		$(".is_show_call").text(lang.linkit.show_call_history);
		$("#search_input_new_sms").attr("placeholder", lang.linkit.search_input_session);
		$("#contact_callit").text(lang.linkit.callit);
		$("#last_moretxt").text(lang.linkit.holetext);
		$("#checked").text(lang.linkit.holetext);
		$("#link_call_new_btn").text(lang.linkit.callit);
		$("#call_num_input").attr("placeholder", lang.linkit.call_num_input);
		$("#Description").text(lang.linkit.Description);
		$("#Notifications").text(lang.linkit.Notifications);
		$(".clear_all").text(lang.linkit.clear_all);
		$(".no_notification").text(lang.linkit.nothing);
		$(".state").text(lang.linkit.in_a_call);
		$(".sms").attr("title", lang.linkit.handup_sengMessage);
		$(".answer").attr("title", lang.linkit.Answer);
		$(".inoff").attr("title", lang.linkit.Hang_up);
		$("#reading").text(lang.linkit.use_phone);	
		$("#search_input_call").attr("placeholder", lang.linkit.Search_phone_records);
		$("#search_input_sms").attr("placeholder", lang.linkit.search_message);
		$("#t1").text(lang.linkit.Rate);
		$("#t2").text(lang.linkit.remaining_minutes);
		$("#t3").text(lang.linkit.Position);
		$("#t4").text(lang.linkit.Package);
		$("#t5").text(lang.linkit.Here);
		$("#t6").text(lang.linkit.Explain);
		$("#t7").text(lang.linkit.Set_of_links);
		$("#t8").text(lang.linkit.Account);
		$("#t9").text(lang.linkit.Descriptive_text);
		$("#forward").text(lang.linkit.feedback);
		$("#forwarding").text(lang.linkit.suggestions);
		$(".feedback_cancel").attr("value", lang.linkit.cancel);
		$(".feedback_canfirm").attr("value", lang.linkit.submit);
		
		$("#connect_client_tip1").text(lang.linkit.conntected_device);
		
		$("#connect_win_t1").text(lang.linkit.easy_interconnection);
		$("#connect_win_t2").text(lang.linkit.application);
		$("#connect_win_t3").text(lang.linkit.support);
		$("#connect_win_t4").text(lang.linkit.more_convenient);
		$("#login_btn").text(lang.linkit.login_by_Lenovo_ID);
		
		$("#connect_connected_t2").text(lang.linkit.successful);
		$("#connect_connected_t3").text(lang.linkit.login_in_the_mobile);
		$("#connect_connected_t4").text(lang.linkit.scan);
		$("#exit_btn").text(lang.linkit.log_out);
		$(".fail_link").text(lang.linkit.disconnect);
		
		
		
		
		
		
		
		
	}
}