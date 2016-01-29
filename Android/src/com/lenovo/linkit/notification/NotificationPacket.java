package com.lenovo.linkit.notification;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;

import android.util.Base64;

import com.google.gson.Gson;
import com.lenovo.linkit.Constants;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.util.LZString;

public class NotificationPacket extends Packet {
	
	public List<NotificationData> data = new ArrayList<NotificationData>();
	
	public NotificationPacket()
	{
	}
	
	public NotificationPacket(String id, String token)
	{
		this.id = id;
		this.token = token;
		this.type = Constants.WS_COMMAND_TYPE_REQUEST;
		this.to = Constants.WS_COMMAND_TARGET;
		this.cmd = Constants.COMMAND_NEW_ONE_NOTIFICATION;
	}
	
	public NotificationPacket(Packet packet)
	{
		this.id = packet.getId();
		this.type = Constants.WS_COMMAND_TYPE_RESPONSE;
		this.to = Constants.WS_COMMAND_TARGET;
		this.token = packet.getToken();
		this.cmd = Constants.COMMAND_NEW_ONE_NOTIFICATION;
	}
	
	////////////////////////////////////////////////////////////////////////////////////////
	public static NotificationPacket makeResponse(String id, String token,String cid) {
		
		NotificationPacket packet = new NotificationPacket();		
		packet.id = id;
		packet.token = token;
		packet.type = Constants.WS_COMMAND_TYPE_RESPONSE;
		packet.to = Constants.WS_COMMAND_TARGET;
		packet.cid = cid ;
		return packet;
	}
	
	public static NotificationPacket fromJson(String jsonStr) {
		Gson gson = new Gson();
		NotificationPacket packet = gson.fromJson(jsonStr, NotificationPacket.class);
		return packet;
	}
	
	public String toJson() {
		try {
			Gson gson = new Gson();
			this.cmprs = "1";
			String header = gson.toJson(this);			
			JSONObject json = new JSONObject(header);
			
			String dataStr = gson.toJson(this.data);
			String dataEncoded = LZString.compressToBase64(dataStr);
			// compressed all data
/*			if(dataEncoded.length() > dataStr.length())
				json.put("cmprs", 0);				
			else
				json.put("data", dataEncoded);*/

			json.put("data", dataEncoded);
			String result = json.toString();
			return result;
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return "";
	}
	
	public void setNotification(NotificationObject object) {
		List<NotificationObject> list = new ArrayList<NotificationObject>();
		list.add(object);
		
		setNotification(list);
	}
	
	public void setNotification(List<NotificationObject> list) {
		data.clear();
		
		for(NotificationObject obj : list) {
			data.add(obj);
		}
	}
}
