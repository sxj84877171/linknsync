function sendphonesms_req(sCmd, personName)
{
        var smsData = {};
    
        smsData['command'] = sCmd;
    
        var smsJason = {};
    
        smsJason['version'] = "1.0";
        smsJason['type'] = "request";
        smsJason['id'] = "1";
        smsJason['data'] = smsData;
     
		return JSON.stringify(smsJason);
}

function send_phone_sms(sCmd, telephone, msgbody)
{
		var sms1 = {};
		sms1['time'] = "1";
		sms1['status'] = "1";
		sms1['from'] = "321abc test";
		sms1['to'] = telephone;
		sms1['message'] = msgbody;
		sms1['read'] = "true";
		
		var sms2 = {};
		sms2['time'] = "2";
		sms2['status'] = "2";
		sms2['from'] = "123";
		sms2['to'] = telephone;
		sms2['message'] = msgbody;
		sms2['read'] = "true";
		
		var smsData = {};
	
    smsData['command'] = sCmd;
    smsData['smslist'] = [sms1, sms2];

    smsData['command'] = sCmd;

    var smsJason = {};

    smsJason['version'] = "1.0";
    smsJason['type'] = "request";
    smsJason['id'] = "1";
    smsJason['data'] = smsData;
     
		return JSON.stringify(smsJason);
/*
		var sms1 = {};
		sms1['time'] = "";
		sms1['status'] = "";
		sms1['from'] = "321";
		sms1['to'] = telephone;
		sms1['message'] = msgbody;
		sms1['read'] = "0";
		
		var sms2 = {};
		sms2['time'] = "";
		sms2['status'] = "";
		sms2['from'] = "123";
		sms2['to'] = telephone;
		sms2['message'] = msgbody;
		sms2['read'] = "0";
		
		var smsData = {};
	
    smsData['command'] = sCmd;
    smsData['smslist'] = [sms1, sms2];

    var smsJason = {};

    smsJason['version'] = "1.0";
    smsJason['type'] = "request";
    smsJason['id'] = "1";
    //smsJason['name'] = "";
    smsJason['data'] = smsData;
     
		return JSON.stringify(smsJason);*/
}

function sendphonesms_rsp(retString)
{
     try
	 {
	    var jsonstr = '(' + retString + ')';
	    var ret = eval(jsonstr);
		var ret = JSON.parse(retString); //throw out a exception
		
		if (!ret)
		{
			return;
		}
		
		if (null != ret.result.contactsValue && ret.result.contactsValue.length > 0)
		{
		    var contacts = ret.result.contactsValue;
			generate_contacts_list(contacts);
		}
		if (null != ret.result.smsesValue && ret.result.smsesValue.length > 0)
		{
		       var smsArray = ret.result.value;
	           for (var k = 0; k < smsArray.length; k++)
	           {
			       alert(smsArray[k].from);
	               alert(smsArray[k].message);
			   }
		}
	 }
	 catch (err)
	 {
	    console.log(err);
	 }
}

var g_sel_telephone = "";

function OnContactClick(telephoneNos)
{
   //如果此人有多个号码，则是;分号隔开的
   var telephoneArray = telephoneNos.split(";");
   
   if (telephoneArray.length > 1)	
   { 
       g_sel_telephone = telephoneArray[0];
       alert("此人有多个号码，缺省使用第一个号码");//todo 此人有多个号码，需要选中一个
   }
   else
   {
       g_sel_telephone = telephoneNos;
       log("你选中联系人的号码为：" + telephoneNos);
   }
}

function generate_contacts_list(contacts)
{
        var htmlText = "";
		 
        for (var i = 0; i < contacts.length; i++)
        {
			    phoneNos = "";
                
				PhoneNumbers = contacts[i].PhoneNumbers;
				for (var j = 0; j < PhoneNumbers.length; j++)
	            {
				    if (0 == j)
					{
					    phoneNos = PhoneNumbers[j]
					}
					else
					{
					    phoneNos += ";" + PhoneNumbers[j];
					}
				}
				htmlText += "<input id=\"cmd" + i +"\" type=\"radio\" name=\"contacts\" value=\"" + phoneNos + "\"  onclick=\"OnContactClick(this.value); \" ";
				htmlText += "> <label for=\"cmd" + i + "\">" + contacts[i].name + "</label><br>";
	    }
			
	    document.getElementById("radiolist").innerHTML = htmlText;
}


//组织JSON格式:to Jeremy, Plz organize cmd json string here
function organizeCmdJsonString(cmd)
{
       var CmdJson = "";
        	
        switch (cmd)
        {
        		 case "1": //组织获取联系人的电话
				 {
				     CmdJson = sendphonesms_req('getAllContacts', '');
        		     break;
				 }
        		  
        		 case "2": //组织获取所有手机SMS
				 {
				     CmdJson = sendphonesms_req('getAllMessages', '');
        		     break;
				  }
				  case "3": //指定联系人发送SMS 
        		 {
					  g_sel_telephone = '13480995674';
					 CmdJson = send_phone_sms('sendMessages', g_sel_telephone, document.getElementById('message').value);
				     break;
				 }
				  
				 case "4": //获取所有Notification信息
        		 {
				    break;
				 }
				  
        		 default: //缺省
        		 {
				 break;
				 }
        }
        	
       return CmdJson;
}
        

function receiveDatafromPhone(jsonresult)
{
    	sendphonesms_rsp(jsonresult);
}
    	
var ws = null;
var reConnectTimer = -1; 
        
function setConnected(connected)
{
       document.getElementById('echo').disabled = !connected;
}

function connect() 
{
		
		log('Connecting...!');
		       
		if (-1 != reConnectTimer)
		{
				 clearInterval(reConnectTimer);
				 reConnectTimer = -1;
		}
				   
        var target = document.getElementById('target').value;
        if (target == '') 
       {
                alert('Please select server side connection implementation.');
                return;
        }
            
        if ('WebSocket' in window) 
        {
            	log('Your browser support WebSocket!');
                ws = new WebSocket(target);
        } 
        else if ('MozWebSocket' in window) 
        {
            	log('Your browser support WebSocket!');
                ws = new MozWebSocket(target);
        } 
         else 
         {
                log('WebSocket is not supported by this browser.');
                return;
         };
            
         ws.onopen = function () 
         {
                setConnected(true);
                log('Info: WebSocket connection opened.');
		 };
				   
         ws.onmessage = function (event) 
        {
               // log('Encrypted: ' + event.data);
              // var jdata = hexStringToByteArray(event.data);
                var cipherParams = CryptoJS.lib.CipherParams.create({
				  	ciphertext: CryptoJS.enc.Hex.parse(event.data)
			  	});
                var d = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv }).toString(CryptoJS.enc.Utf8);
                log('Decrypted: ' + d);
			//	var decrypted = hex2ansi(d);

                receiveDatafromPhone(d);
		 };
            
		ws.onclose = function () 
        {
                setConnected(false);
                log('Info: WebSocket connection closed.');
         };
		 
		 ws.onerror = function(e) 
		{
			    log('error，the connection is unavailable');
				 //reConnectTimer = setInterval("reConnect()",2000); 
		};
}

function hex2ansi(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function disconnect() 
{
         if (ws != null) 
		 {
                ws.close();
                ws = null;
         }
         setConnected(false);
}
		
function reConnect() 
 {
		 if (ws != null) 
		 {
             ws.close();
		 }
         ws = null;
		 connect();
 }
		 

 function echo() 
{
         if (ws != null) 
		 {
                var message = document.getElementById('message').value;
                //log('Sent: ' + message);
				//var encryptStr = des ("lenovo", message, 1, 0);
                ws.send(message);
         } 
         else 
         {
                alert('WebSocket connection not established, please connect.');
         }
}

function updateTarget(target) 
 {
          document.getElementById('target').value = 'ws://192.168.1.5'  + target;
 }
        
        
 function SendCommand(cmd)
 {
         log('click: ' + cmd);
         var CmdJson = organizeCmdJsonString(cmd);
			 
         if (CmdJson.length < 1)
         {
        		 log('warining: Please Input JsonCmdString');
         }
          else
         {
        	 	 log('Sent: ' + CmdJson);
                 var message = pad(CmdJson);
                 var encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });

        	     ws.send(encrypted.ciphertext.toString());
         }
 }

var key = CryptoJS.enc.Latin1.parse('suKeRJtA0YWLcmo1');
var iv = CryptoJS.enc.Hex.parse('6B5D7F6C5D1E556949191901026E7F3D');
var tcl = 1;

function log(message) 
{
         var console = document.getElementById('console');
         var p = document.createElement('p');
         p.style.wordWrap = 'break-word';
            
         p.style.color = "#00" +  tcl + tcl + tcl + tcl ;
         p.appendChild(document.createTextNode(message));
         console.appendChild(p);
            
         while (console.childNodes.length > 50) 
		 {
             console.removeChild(console.firstChild);
         }
		 
         console.scrollTop = console.scrollHeight;
         tcl++;
         tcl = tcl % 10;
}

function clear()
{
    document.getElementById('console').innerHTML = "";
}

window.onload = function()
{
        document.getElementById('target').value = 'ws://192.168.1.5:8000' + "/examples/websocket/echoMessage";
		document.getElementById('clear').onclick = clear;
        connect();
}

function pad(source) {
    var paddingChar = ' ';
    var size = 16;
    var x = source.length % size;
    var padLength = size - x;

    for (var i = 0; i < padLength; i++) {
        source += paddingChar;
    }

    return source;
}

 
 
 
 
 