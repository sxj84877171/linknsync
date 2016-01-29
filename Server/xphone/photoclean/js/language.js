var lang = null;

function change_language() {
	var language = navigator.browserLanguage ? navigator.browserLanguage : navigator.language;
	if (language.indexOf('zh') >= 0) {
		lang = LANG_CN;
		//title
		$(document).attr("title","照片大挪移 - 最快腾空间的应用");
	}
	else if(language.indexOf('zh') < 0)
	{
		lang = LANG_EN;
		//title
		$(document).attr("title",lang.index.top_logo_text + " - An app for fastest phone-space release");
		//css
		$("#bncont_txt1").css({"font-size":"44px","margin-top":"32px"});
		$("#bncont_txt2").css({"margin-top":"30px"});
		$("#bncont_txt3").css({"font-size":"20px","margin-top":"6px"});
		$("#content_lmtt_txt2").css({"letter-spacing":"0px"});
		//img
		$(".first_list .firstwrap").css({"background-image":"url(./images/banner_phone_1_en.png)"});
		$(".second_list .secondwrap").css({"background-image":"url(./images/banner_phone_2_en.png)"});
//		$("#time_title").css({"color":"#ffffff"});

//		$("#").attr("", abc);
	}
	
	
	//text
		$("#top_logo_text").text(lang.index.top_logo_text);
		$("#top_home").text(lang.index.top_home);
		$("#top_timeline").text(lang.index.top_timeline);
		$("#top_faq").text(lang.index.top_faq);
		$("#bncont_txt1").text(lang.index.bncont_txt1);
		$("#bncont_txt2").text(lang.index.bncont_txt2);
		$("#bncont_txt3").text(lang.index.bncont_txt3);
		$("#dl_android").text(lang.index.dl_android);
		$("#dl_iphone").text(lang.index.dl_iphone);
		$("#dl_windows").text(lang.index.dl_windows);
		$("#content_lmtt_txt1").text(lang.index.content_lmtt_txt1);
		$("#content_lmtt_txt2").text(lang.index.content_lmtt_txt2);
		$("#first_list_title").text(lang.index.first_list_title);
		$("#first_list_txt1").text(lang.index.first_list_txt1);
		$("#first_list_txt2").text(lang.index.first_list_txt2);
		$("#first_list_txt3").text(lang.index.first_list_txt3);
		$("#first_list_txt4").text(lang.index.first_list_txt4);
		$("#first_list_txt5").text(lang.index.first_list_txt5);
		$("#second_list_title").text(lang.index.second_list_title);
		$("#second_list_txt2").text(lang.index.second_list_txt2);
		$("#footer_logo_text").text(lang.index.footer_logo_text);
		
		$("#time_title").text(lang.timeline.time_title);
		
		$("#faq_header_title").text(lang.faq.faq_header_title);
		$("#question_1").text(lang.faq.question_1);
		$("#answer_1_1").text(lang.faq.answer_1_1);
		$("#answer_1_2").text(lang.faq.answer_1_2);
		$("#answer_1_3").text(lang.faq.answer_1_3);
		$("#answer_1_4").text(lang.faq.answer_1_4);
		$("#question_2").text(lang.faq.question_2);
		$("#answer_2_1").text(lang.faq.answer_2_1);
		$("#answer_2_2").text(lang.faq.answer_2_2);
		$("#answer_2_3").text(lang.faq.answer_2_3);
		$("#question_3").text(lang.faq.question_3);
		$("#answer_3_1").text(lang.faq.answer_3_1);
}