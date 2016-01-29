package com.lenovo.linkit.phoneinfo;

import android.content.Context;
import android.telephony.TelephonyManager;

import com.google.gson.Gson;
import com.lenovo.linkit.Constants;
import com.lenovo.linkit.protocol.Packet;

public class PhoneInfoPacket extends Packet {
	
	public class PhoneInfo {
		public String phoneNumber;
		public long currentTime;
		public String sdkVersion;
		public String deviceid;
		public String mobileName;
		private String countryCode ;
	}
	
	public PhoneInfo data = new PhoneInfo();
	
	public PhoneInfoPacket(Context context, String token, Packet packet)
	{
		this.id = packet.getId();
		this.token = token;
		this.to = Constants.WS_COMMAND_TARGET;	
		this.type = Constants.WS_COMMAND_TYPE_RESPONSE;
		
		TelephonyManager telephonyManager = (TelephonyManager)context.getSystemService(Context.TELEPHONY_SERVICE);

		this.data.phoneNumber = telephonyManager.getLine1Number();
		this.data.mobileName = android.os.Build.MODEL;
		this.data.deviceid = telephonyManager.getDeviceId();
		this.data.currentTime = System.currentTimeMillis();
		this.data.sdkVersion = "" + android.os.Build.VERSION.SDK_INT;
		this.data.countryCode = telephonyManager.getSimCountryIso().toUpperCase();
	}
	
	public String toJson() {
		Gson gson = new Gson();
		return gson.toJson(this);
	}
}
