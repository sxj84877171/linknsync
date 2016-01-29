package com.lenovo.linkit.network;

import java.net.URI;
import java.nio.channels.NotYetConnectedException;
import java.util.List;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONObject;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Handler;
import android.os.Message;
import android.telephony.TelephonyManager;

import com.lenovo.linkit.Constants;
import com.lenovo.linkit.core.Engine;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.protocol.PairPacket;

/**
 * Created by sam on 2014/9/5.
 */
public class WebSocketManager extends WebSocketClient implements INetworkManager{

	private static final String TAG = "WebSocketManager";
	private Context mContext;
	private Handler mServiceHandler = null;
	private String mQRcode = "";
	
	private boolean mConnectServer = false;
	private boolean mPCConnect = false;
	private SynchronizeCache mCache = null;

	public WebSocketManager(Context context, URI svrUri, Handler handler) {
		super(svrUri);

		mContext = context;
		mServiceHandler = handler;
		mCache = SynchronizeCache.getInstance();
	}

	public void setQRcode(String qrcode) {
		mQRcode = qrcode;
	}
	
	public String getQRCode() {
		return mQRcode;
	}
	
	@Override
	public void onOpen(ServerHandshake serverHandshake) {
		FLog.i(TAG, "Web socket opened!");

		sendMessageToService(Constants.HANDLER_WS_CONNECTED, null);
		Engine.getEngine().setNetWorktManager(this);

		mConnectServer = true;
	}

	@Override
	public void onMessage(String message) {
		message = message.trim();
		FLog.i(TAG, "Receive message: " + message);
		
		// Add by Alex 2014-11-13
		Engine.getEngine().processCommand(message);
	}

	@Override
	public void onClose(int i, String s, boolean b) {
		FLog.i(TAG, "Web socket closed!" + "    i=" + i + ",s=" + s + ",b=" + b);

		sendMessageToService(Constants.HANDLER_WS_DISCONNECTED, null);

		mPCConnect = false;
		mConnectServer = false;
	}

	@Override
	public void onError(Exception e) {
		sendMessageToService(Constants.HANDLER_WS_DISCONNECTED, null);
		FLog.w(TAG, "onError " , e);
	}	

	public void sendHiToServer() {
		PairPacket packet = new PairPacket(mContext, mQRcode);
		String msg = packet.toJson();
		send(msg);
		
		FLog.i(TAG, "Send hi packet to server finished.");
	}
	
	public boolean isConnectedServer() {
		return mConnectServer;
	}
	
	public void setPCConnectState(boolean state) {
		if(mPCConnect != state){
			FLog.i(TAG, "pc connect change,now is:" + state);
		}
		mPCConnect = state;
	}
	
	public boolean isPCConnectServer() {
		return mPCConnect;
	}
	
	public void synchronizeCache() {
		List<Packet> list = mCache.getCachePackets();
		for (Packet packet : list) {
			sendPacket(packet);
		}
	}

	public JSONObject sayHiJsonData() {
		JSONObject sayHi = new JSONObject();

		TelephonyManager tm = (TelephonyManager) mContext.getSystemService(Context.TELEPHONY_SERVICE);
		String sMobileId = tm.getDeviceId();
		String sMobileName = android.os.Build.MODEL;

		WifiManager wifiManager = (WifiManager) mContext.getSystemService(Context.WIFI_SERVICE);
		WifiInfo wifiInfo = wifiManager.getConnectionInfo();
		String sSSID = wifiInfo.getSSID();
		String sMac = wifiInfo.getMacAddress();
		
		try {
			sayHi.put("version", "1.0");
			sayHi.put("type", "request");
			sayHi.put("id", "0");
			sayHi.put("to", "s");
			sayHi.put("token", mQRcode);

			JSONObject data = new JSONObject();
			data.put("command", "postsource");
			data.put("deviceid", sMobileId);
			data.put("name", sMobileName);
			data.put("ssid", sSSID);
			data.put("mac", sMac);
			data.put("sdklever", android.os.Build.VERSION.SDK_INT);
			sayHi.put("data", data);
		} catch (Exception e) {
			FLog.w(TAG, "Error on json for sayHi..");
		}
		
		return sayHi;
	}

	public void sendPacket(Packet packet) {
		if (packet == null) {
			return;
		}
		
		if (!isConnectedServer() || !isPCConnectServer()) {
			FLog.i(TAG, "isConnectedServer:" + isConnectedServer() + " ,isPCConnectServer:" + isPCConnectServer());
			mCache.cachePacket(packet);
			return;
		}
		
		try {
			String msg = packet.toJson();
			
			FLog.i(TAG, "Send to PC: " + msg);
			
			send(msg);
		} catch (NotYetConnectedException e) {
			e.printStackTrace();
		}
	}
	
	public void sendMessageToService(int msgID, String msg) {
		if (mServiceHandler == null) {
			return;
		}

		Message message = mServiceHandler.obtainMessage();
		message.what = msgID;

		if ((msg != null) && !(msg.trim().isEmpty())) {
			message.obj = msg;
		}

		mServiceHandler.sendMessage(message);
	}

	public void sendStatusToFront(String command) {
		if (command == null) {
			return;
		}
		
		if (command.equals(Constants.COMMAND_GET_PHONE_INFO)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_SEND_PHONE_INFO);
			
		} else if (command.equals(Constants.COMMAND_GET_ALL_CONTACTS)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_SEND_ALL_CONTACTS);
			
		} else if (command.equals(Constants.COMMAND_GET_ALL_SMS)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_SEND_ALL_SMS);
			
		} else if (command.equals(Constants.COMMAND_GET_ALL_NOTIFICATION)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_SEND_ALL_NOTIFICATION);
			
		} else if (command.equals(Constants.COMMAND_SYNCHRONIZED)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_SYNCHRONIZED);
			
		} else if (command.equals(Constants.COMMAND_FINISHED)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_FINISHED);
			
		}
	}
	
	public void sendStatusToFront(int status) {
		MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, status);
	}
	
	public void sendFailureToFront(String command) {
		if (command == null) {
			return;
		}
		
		if (command.equals(Constants.COMMAND_GET_PHONE_INFO)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_GET_PHONE_INFO_FAIL);
			
		} else if (command.equals(Constants.COMMAND_GET_ALL_CONTACTS)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_GET_CONTACTS_FAIL);
			
		} else if (command.equals(Constants.COMMAND_GET_ALL_SMS)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_GET_SMS_FAIL);
			
		} else if (command.equals(Constants.COMMAND_GET_ALL_NOTIFICATION)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, Constants.STATE_GET_NOTIFICATION_FAIL);
			
		}
	}
}
