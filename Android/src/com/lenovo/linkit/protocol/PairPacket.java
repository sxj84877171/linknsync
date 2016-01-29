package com.lenovo.linkit.protocol;

import com.google.gson.Gson;
import com.lenovo.linkit.Constants;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.telephony.TelephonyManager;

public class PairPacket extends Packet {
	
	public class DeviceInfo {
		String deviceid;
		String name;
		String ssid;
		String mac;
		int sdklever;
	}
	
	public DeviceInfo data = new DeviceInfo();
	
	public PairPacket(Context context, String token)
	{
		TelephonyManager tm = (TelephonyManager) context.getSystemService(Context.TELEPHONY_SERVICE);
		String sMobileId = tm.getDeviceId();
		String sMobileName = android.os.Build.MODEL;

		WifiManager wifiManager = (WifiManager) context.getSystemService(Context.WIFI_SERVICE);
		WifiInfo wifiInfo = wifiManager.getConnectionInfo();
		String sSSID = wifiInfo.getSSID();
		String sMac = wifiInfo.getMacAddress();
		
		this.type = Constants.WS_COMMAND_TYPE_REQUEST;
		this.to = "s";
		this.id = "0";
		this.cmd = "kPostsource";
		this.token = token;

		this.data.deviceid = sMobileId;
		this.data.name = sMobileName;
		this.data.ssid = sSSID;
		this.data.mac = sMac;
		this.data.sdklever = android.os.Build.VERSION.SDK_INT;
	}
	
	public String toJson() {
		Gson gson = new Gson();
		return gson.toJson(this);
	}
}
