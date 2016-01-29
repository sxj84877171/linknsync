var domAllHeight = document.documentElement.offsetWidth;

var faqMainHeight = document.getElementById("faq-main").offsetHeight;


//function logoHeightPosition() {
//
//	if ((domAllHeight - faqMainHeight - 140) > 0) {
//		$("#footer").css({"position":"fixed", "bottom":"0px"});
//	} else {
//		$("#footer").css({"position":"none", "bottom":"0px"});
//	};
//};
//
//logoHeightPosition();
var debounce = function(func, threshold, execAsap) {
	var timeout;
	return function debounced() {
		var obj = this,
			args = arguments;

		function delayed() {
			if (!execAsap)
				func.apply(obj, args);
			timeout = null;
		};
		if (timeout)
			clearTimeout(timeout);
		else if (execAsap)
			func.apply(obj, args);
		timeout = setTimeout(delayed, threshold || 100);
	};
};
//window.onresize = function resizeFAQ() {
//	if ((domAllHeight - faqMainHeight - 140) <= 0) {
//		footer.style.position = "none";
//		footer.style.bottom = "0px";
//		alert(1);
//	} else {
//		alert(2);
//		footer.style.position = "fixed";
//		footer.style.bottom = "0px";
//
//	}
//};


	//window.onresize=resizeFAQ();


