$(function() {
	
	$('.content').css({'box-shadow':'none'});
	
	$('#connect_qrcode').qrcode({ width: 320, height: 320, text: "testtesttesttesttesttesttest"})
    .children().css('margin', '20px');
	
	$('#connect_qrcode').click(function(){
		$('#main').show();
		auto_resize();
		$('.connect_section').hide();
		$('body').css({'background-image':'url("")', 'background-color':'rgb(100,100,100)'});
		$('.content').css({'box-shadow':'rgba(0, 0, 0, 0.4) 10px 10px 10px 1px'});
	})
	
	$('.message_session_tab').click(function(){
		$('#contact_list').removeClass('active');
		$('#contact_list').addClass('hide');
		$('#session_list').removeClass('hide');
		$('#session_list').addClass('active');
		$('.new_message').removeClass('new_contact');
		$('.message_session_tab').addClass('message_session_tab_choose');
		$('.contact_list_tab').removeClass('contact_list_tab_choose');
	});

	$('.contact_list_tab').click(function(){
		$('#session_list').removeClass('active');
		$('#session_list').addClass('hide');
		$('#contact_list').addClass('active');
		$('#contact_list').removeClass('hide');
		$('.new_message').addClass('new_contact');
		$('.message_session_tab').removeClass('message_session_tab_choose');
		$('.contact_list_tab').addClass('contact_list_tab_choose');
	});


	function auto_resize(){	
		$(".list").height($(".right").height() - $(".right_panel").height() - $(".input_editor").height() - $(".line").height()  -39);
		$(".info_list").height($(".left").height() - $(".functions_tab").height() - $(".search_box").height() - $(".notification").height() - 20);
		$(".notification_list").height($(".right").height() - $(".notification_title").height() - $(".notification_clear_all_panel").height() -50);
	}
	auto_resize();
	
	$(window).resize(function() {
		auto_resize();
	});
	
	$("#session_list > .item").each(function(){
		$(this).bind("click",function(){
			$(this).addClass('current');
		});
	});
	
	$(".list>.item").each(function(){
		$(this).bind("click",function(){
			if($(".menu").css('display') == "none"){
				$(".menu").show();
				//$(".menu_content").animate({"margin-right":"15px"},500);
				$(".menu_content").show();
			}else{
				//$(".menu_content").animate({"margin-right":"720px"},500,function(){$(".menu").hide();});
				$(".menu_content").hide();
				$(".menu").hide();
				//
			}
		});
	});
	
	$("#contact_list > .item").each(function(){
		$(this).bind("click",function(){
			$(".right > .session_panel").hide();
			$(".right > .notification_panel").hide();
			$(".right > .contact_panel").show();
			$(".right > .contact_panel > .contact").show();
			$(".right > .contact_panel > .contact_list").hide();
			auto_resize();
		});
	});
	$("#contact_list > .item >.header_layout").each(function(){
		$(this).bind("click",function(event){
			$(".right > .session_panel").hide();
			$(".right > .notification_panel").hide();
			$(".right > .contact_panel").show();
			$(".right > .contact_panel > .contact").hide();
			$(".right > .contact_panel > .contact_list").show();
			auto_resize();
			event.stopPropagation();
		});
	});
	$("#session_list > .item").each(function(){
		$(this).bind("click",function(){
			$(".right > .contact_panel").hide();
			$(".right > .notification_panel").hide();
			$(".right > .session_panel").show();
			auto_resize();
		});
	});
	
	$(".notification").bind("click",function(){
		$(".right > .contact_panel").hide();
		$(".right > .session_panel").hide();
		$(".right > .notification_panel").show();
		auto_resize();
			
	});
	
});





	