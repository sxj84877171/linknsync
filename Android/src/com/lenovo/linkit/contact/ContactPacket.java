package com.lenovo.linkit.contact;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.lenovo.linkit.Constants;
import com.lenovo.linkit.protocol.Packet;

public class ContactPacket extends Packet {
	private List<ContactInfo> data;
	
	public ContactPacket(String token) {
		this.id = "0";
		this.token = token;
		this.type = Constants.WS_COMMAND_TYPE_RESPONSE;
		this.to = Constants.WS_COMMAND_TARGET;
	}

	public List<ContactInfo> getData() {
		return data;
	}

	public void setData(List<ContactInfo> data) {
		this.data = data;
	}
	
	public void setSingleData(ContactInfo info) {
		if (info == null) {
			return;
		}
		
		this.data = new ArrayList<ContactInfo>();
		this.data.add(info);
	}
	
	public String toJson() {
		try {
			Gson gson = new Gson();
			this.cmprs = "0";
			String header = gson.toJson(this);			
			JSONObject json = new JSONObject(header);
			String result = json.toString();
			return result;
		} catch (JSONException e) {
			e.printStackTrace();
		}
		
		return "";
	}
}
