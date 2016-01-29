package com.lenovo.linkit.facebook.bean;

import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.sms.SMSPacket;
import com.lenovo.linkit.util.LZString;

public class FacebookMessagePacket extends Packet {

	private List<FacebookMessages> data;

	public List<FacebookMessages> getData() {
		return data;
	}

	public void setData(List<FacebookMessages> data) {
		this.data = data;
	}

	public static class FacebookMessages {
		private String name;
		private String number;
		private String incontact = "2";
		private String icon;
		private List<FacebookMessage> msg;

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getNumber() {
			return number;
		}

		public void setNumber(String number) {
			this.number = number;
		}

		public String getIncontact() {
			return incontact;
		}

		public void setIncontact(String incontact) {
			this.incontact = incontact;
		}

		public String getIcon() {
			return icon;
		}

		public void setIcon(String icon) {
			this.icon = icon;
		}

		public List<FacebookMessage> getMsg() {
			return msg;
		}

		public void setMsg(List<FacebookMessage> msg) {
			this.msg = msg;
		}
	}

	public static FacebookMessagePacket fromJson(String jsonStr) {
		Gson gson = new Gson();
		FacebookMessagePacket packet = gson.fromJson(jsonStr,
				FacebookMessagePacket.class);
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
			json.put("data", dataEncoded);
			String result = json.toString();
			return result;
		} catch (JSONException e) {
			e.printStackTrace();
		}

		return "";
	}

	public static class FacebookMessage {
		public String getId() {
			return id;
		}

		public void setId(String id) {
			this.id = id;
		}

		public String getMessage() {
			return message;
		}

		public void setMessage(String message) {
			this.message = message;
		}

		public String getPerson() {
			return person;
		}

		public void setPerson(String person) {
			this.person = person;
		}

		public boolean getRead() {
			return read;
		}

		public void setRead(boolean read) {
			this.read = read;
		}

		public String getReceiveDate() {
			return receiveDate;
		}

		public void setReceiveDate(String receiveDate) {
			this.receiveDate = receiveDate;
		}

		public String getSendDate() {
			return sendDate;
		}

		public void setSendDate(String sendDate) {
			this.sendDate = sendDate;
		}

		public String getStatus() {
			return status;
		}

		public void setStatus(String status) {
			this.status = status;
		}

		public String getTime() {
			return time;
		}

		public void setTime(String time) {
			this.time = time;
		}

		String id;
		String message;
		String person;
		boolean read;
		String receiveDate;
		String sendDate;
		String status;
		String time;
	}

}
