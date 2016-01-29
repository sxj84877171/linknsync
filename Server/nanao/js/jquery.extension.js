/**
 * @author 愚人码头
 * 文章地址：http://www.css88.com/archives/2316
 * 演示地址：http://www.css88.com/demo/edit-box/index1.html
 * 下载地址：http://www.css88.com/demo/edit-box/selection.rar
 */
(function($){
    $.fn.selection = function(){
        var s,e,range,stored_range;
        if(this[0].selectionStart == undefined){
            var selection=document.selection;
            if (this[0].tagName.toLowerCase() != "textarea") {
                var val = this.val();
                range = selection.createRange().duplicate();
                range.moveEnd("character", val.length);
                s = (range.text == "" ? val.length:val.lastIndexOf(range.text));
                range = selection.createRange().duplicate();
                range.moveStart("character", -val.length);
                e = range.text.length;
            }else {
                range = selection.createRange(),
                stored_range = range.duplicate();
                stored_range.moveToElementText(this[0]);
                stored_range.setEndPoint('EndToEnd', range);
                s = stored_range.text.length - range.text.length;
                e = s + range.text.length;
            }
        }else{
            s=this[0].selectionStart,
            e=this[0].selectionEnd;
        }
        var te=this[0].value.substring(s,e);
        return {start:s,end:e,text:te}
    };
	
	$.fn.setSelection = function(pos){
		this[0].focus();  
		if(this[0].setSelectionRange){ //W3C  
			this[0].setSelectionRange(pos,pos);  
		}  
	　　else if(this[0].createTextRange){ //IE  
			var range = this[0].createTextRange(); //新建textRange对象    
			range.moveStart('character',pos); //更改range对象的开始位置  
			range.collapse(true); //光标移动到范围结尾  
			range.select(); //选中  
		}
	}
})(jQuery);

