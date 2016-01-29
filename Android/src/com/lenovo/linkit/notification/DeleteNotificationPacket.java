package com.lenovo.linkit.notification;

import java.util.List;

import com.google.gson.Gson;
import com.lenovo.linkit.Constants;
import com.lenovo.linkit.protocol.Packet;

public class DeleteNotificationPacket extends Packet {
	
	List<String> data;
	
	public DeleteNotificationPacket(String token, List<String> data) {
		
		this.id = "0";
		this.token = token;
		this.type = Constants.WS_COMMAND_TYPE_REQUEST;
		setTo(Constants.WS_COMMAND_TARGET);
		setCmd(Constants.COMMAND_DELETE_NOTIFICATION);
		
		this.data = data;
	}
	
	public List<String> getDeletedNotificationIDs() {
		return data;
	}
	
	public static DeleteNotificationPacket fromJson(String jsonStr) {
		Gson gson = new Gson();
		DeleteNotificationPacket packet = gson.fromJson(jsonStr, DeleteNotificationPacket.class);
		return packet;
	}
	
	public String toJson() {
		Gson gson = new Gson();
		return gson.toJson(this);
	}
}
