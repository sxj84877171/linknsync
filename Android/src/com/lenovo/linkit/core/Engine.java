package com.lenovo.linkit.core;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import android.app.ActivityManager;
import android.app.ActivityManager.RunningAppProcessInfo;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.net.Uri;
import android.os.Build;

import com.google.gson.JsonSyntaxException;
import com.lenovo.linkit.Constants;
import com.lenovo.linkit.R;
import com.lenovo.linkit.StateManager;
import com.lenovo.linkit.StateManager.State;
import com.lenovo.linkit.contact.ContactDataPacketManager;
import com.lenovo.linkit.contact.ContactManager;
import com.lenovo.linkit.contact.ContactObject;
import com.lenovo.linkit.facebook.FacebookChatProxyService;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.network.INetworkChangedListener;
import com.lenovo.linkit.network.INetworkManager;
import com.lenovo.linkit.network.MessengerUtil;
import com.lenovo.linkit.notification.DeleteNotificationPacket;
import com.lenovo.linkit.notification.NotificationObject;
import com.lenovo.linkit.notification.NotificationObjectManager;
import com.lenovo.linkit.notification.NotificationPacket;
import com.lenovo.linkit.phoneinfo.PhoneInfoPacket;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.sms.SMSData;
import com.lenovo.linkit.sms.SMSMessage;
import com.lenovo.linkit.sms.SMSPacket;
import com.lenovo.linkit.sms.SmsContentObserver;
import com.lenovo.linkit.sms.SmsObjectManager;
import com.lenovo.linkit.sms.SmsSender;

public class Engine implements INetworkChangedListener {
	private static final String TAG = Engine.class.getSimpleName();
	private Context mContext;

	private SmsContentObserver mSmsContent = null;
	private INetworkManager mWSManager = null;
	private String mQRCode = null;
	private ContactObject mContactContent = null;
	private NotificationObjectManager mNotificationManager;
	private Thread thread ;

	private static Engine mInstance;
	public static Engine getEngine() {
		if (mInstance == null) {
			mInstance = new Engine();
		}
		return mInstance;
	}

	private Engine() {

	}

	public void init(final Context context) {
		mContext = context;

		mSmsContent = new SmsContentObserver(mContext);
		mContext.getContentResolver().registerContentObserver(
				Uri.parse("content://sms/"), true, mSmsContent);
		mContext.getContentResolver().registerContentObserver(
				android.provider.CallLog.Calls.CONTENT_URI, true, mSmsContent);

		mContactContent = new ContactObject(mContext);

		mNotificationManager = NotificationObjectManager
				.getNotificationManager();

		FLog.i(TAG, "Init finished.");
	}

	public void uninit() {
	}

	// //////////////////////////////////////////////////////////////////////////////////////////////////
	// Add by Alex 2014-11-13
	public void processCommand(String message) {
		Packet packet = Packet.parse(message);

		FLog.i(TAG, "Get packet, command: " + packet.getCmd());
		if (packet.isCmd(Constants.COMMAND_FINISHED)) {
			StateManager.getInstance().pushState(new State(State.STATE_FINISHED));
			packet.setCid(null);
		} else if (packet.isCmd(Constants.COMMAND_FINISHED_PAIRED)) {
			StateManager.getInstance().pushState(new State(State.STATE_PAIRED));
			this.mWSManager.setPCConnectState(true);
			this.mWSManager.synchronizeCache();
		} else if (packet.isCmd(Constants.MESSAGE_CONFLICT)) {
			StateManager.getInstance().pushState(new State(State.STATE_CONFICT));
			FLog.i(TAG, "another device connect this account.  close the socket.");
			packet.setCid(null);
			putSharedPreferencesKeyValue(Constants.LENOVOID_LOGIN_CONFICT ,"lenovoid");
			mWSManager.close();
		} else if (packet.isCmd(Constants.COMMAND_HEARTBEAT)) {
			packet.setCid(null);
		} else if (packet.isCmd(Constants.COMMAND_PC_DISCONNECTED)) {
			StateManager.getInstance().pushState(new State(State.STATE_PC_DISCONNECT));
		} else if (packet.isCmd(Constants.COMMAND_GET_ALL_SMS)) {
			StateManager.getInstance().pushState(new State(State.STATE_ALL_SMS));
			FacebookChatProxyService.getInstance().setPacket(packet);
			SMSPacket.getAllSMS(this.mWSManager, packet, mContext);
		} else if (packet.isCmd(Constants.COMMAND_SEND_SMS)) {		
			StateManager.getInstance().pushState(new State(State.STATE_SMS_TOPC));
			try {
				packet.setCid(null);
				SMSPacket smsPacket = SMSPacket.fromJson(message);
				List<SMSData> datas = smsPacket.data;
				for (SMSData data : datas) {
					sendSms(smsPacket.getId(), data);
				}
			} catch (JsonSyntaxException e) {
				FLog.e(TAG,
						"Send sms, convert message to SMSPackage fail, json format wrong!");
			}
			StateManager.getInstance().pullState(new State(State.STATE_SMS_TOPC));
		} else if (packet.isCmd(Constants.COMMAND_UPDATE_SMS)) {		
			StateManager.getInstance().pushState(new State(State.STATE_SMS_TOPC));
			try {
				SMSPacket smsPacket = SMSPacket.fromJson(message);
				smsPacket.setCid(null);
				List<SMSData> list = smsPacket.data;
				for (SMSData data : list) {
					List<SMSMessage> smslist = data.getMsg();

					FLog.i(TAG, "Update sms, number:" + data.getNumber()
							+ ", sms count:" + smslist.size());

					for (SMSMessage sms : smslist) {
						updateSmsStatus(sms);
					}
				}
			} catch (JsonSyntaxException e) {
				FLog.e(TAG,
						"Update sms, convert message to SMSPackage fail, json format wrong!");
			}
			StateManager.getInstance().pullState(new State(State.STATE_SMS_TOPC));
		} else if (packet.isCmd(Constants.COMMAND_DELETE_SMS)) {	
			StateManager.getInstance().pushState(new State(State.STATE_SMS_TOPC));
			List<String> lstSmsId = SMSPacket.getKeyTimeList(message);
			if (lstSmsId != null && lstSmsId.size() > 0) {
				Engine.getEngine().deleteSms(lstSmsId);

				FLog.i(TAG, "Delete sms, count: " + lstSmsId.size());
			}
			StateManager.getInstance().pullState(new State(State.STATE_SMS_TOPC));
		} else if (packet.isCmd(Constants.COMMAND_GET_ALL_NOTIFICATION)) {	
			// whether notification service is running
			ActivityManager activityManager = (ActivityManager) mContext
					.getSystemService(Context.ACTIVITY_SERVICE);
			List<RunningAppProcessInfo> apps = activityManager
					.getRunningAppProcesses();

			Iterator<RunningAppProcessInfo> iterator = apps.iterator();
			while (iterator.hasNext()) {
				RunningAppProcessInfo appInfo = iterator.next();

				if (appInfo.processName
						.equals(Constants.NOTIFICATION_PROCESS_NAME)) {
					try {
						NotificationObjectManager.getNotificationManager().setToken(packet.getToken());
						NotificationObjectManager.getNotificationManager()
								.getAllNotification(mContext, packet.getId(),packet.getCid());

						FLog.i(TAG, "Get all notification.");
						return; // the continue steps is in callback:
								// onAllNotification;
					} catch (Exception e) {
						NotificationPacket notificationPacket = new NotificationPacket(
								packet);

							this.mWSManager.sendPacket(notificationPacket);

						FLog.i(TAG, "New notification & send packet.");
					}

					break;
				}
			}

			if (!iterator.hasNext()) {
				NotificationPacket notificationPacket = new NotificationPacket(
						packet);

				this.mWSManager.sendPacket(notificationPacket);
			}

			FLog.i(TAG, "New notification & send packet.");

		} else if (packet.isCmd(Constants.COMMAND_GET_PHONE_INFO)) {
			StateManager.getInstance().pushState(new State(State.STATE_PHONE_INFO));
			PhoneInfoPacket phoneInfo = new PhoneInfoPacket(mContext,
					this.mWSManager.getQRCode(), packet);
			this.mWSManager.sendPacket(phoneInfo);
			FLog.i(TAG, "Number:" + phoneInfo.data.phoneNumber);
			FLog.i(TAG, "DeviceId:" + phoneInfo.data.deviceid);
			FLog.i(TAG, "Name:" + phoneInfo.data.mobileName);
			FLog.i(TAG, "SDK:" + phoneInfo.data.sdkVersion);
			StateManager.getInstance().pullState(new State(State.STATE_PHONE_INFO));

		} else if (packet.isCmd(Constants.COMMAND_DELETE_NOTIFICATION)) {	
			StateManager.getInstance().pushState(new State(State.STATE_NOTIFICATION_TOPC));
			try {
				DeleteNotificationPacket deleteNotificationPacket = DeleteNotificationPacket
						.fromJson(message);
				if (deleteNotificationPacket == null
						|| deleteNotificationPacket.getDeletedNotificationIDs() == null) {
					FLog.e(Engine.TAG, "Invalid delete notification packet");
				} else {
					List<NotificationObject> list = mNotificationManager
							.getNotificationList(deleteNotificationPacket
									.getDeletedNotificationIDs());

					mNotificationManager.deleteNotifications(mContext, list);
				}
			} catch (SecurityException e) {
				e.printStackTrace();
			}
			StateManager.getInstance().pullState(new State(State.STATE_NOTIFICATION_TOPC));
		} else if (packet.isCmd(Constants.COMMAND_GET_FACEBOOK_CONTACT_AVATAR)) {		
			FacebookChatProxyService.getInstance().sendAvatars(packet.getToken(), packet);
		} else if (packet.isCmd(Constants.COMMAND_GET_CONTACT_AVATAR)) {	
			StateManager.getInstance().pushState(new State(State.STATE_FACEBOOK_AVATAR));
			ContactManager manager = ContactManager.getContactManager();
			manager.sendAvatars(mContext, this.mWSManager, mQRCode, packet);
			StateManager.getInstance().pullState(new State(State.STATE_FACEBOOK_AVATAR));
		}else if(packet.isCmd(Constants.COMMAND_SEND_FACEBOOKMESSAGE)){
			StateManager.getInstance().pushState(new State(State.STATE_SMS_TOPC));
			SMSPacket smsPacket = SMSPacket.fromJson(message);
			List<SMSData> datas = smsPacket.data;
			if(datas != null){
				for (SMSData data : datas) {
					if( data.getMsg() != null){
						for(SMSMessage sms : data.getMsg()){
							FLog.i(TAG,data.number + ":" + sms.message);
							boolean result = FacebookChatProxyService.getInstance().sendMessage(data.number, sms.message);
							SMSPacket sms1 = new SMSPacket();
							sms1.setId("0");
							sms1.cmd =Constants.COMMAND_NEW_FACEBOOKMESSAGE;
							sms1.type = Constants.WS_COMMAND_TYPE_REQUEST;
							sms1.to = Constants.WS_COMMAND_TARGET;
							if(!result){
								data.sendstatus = "2" ;
								FLog.e(TAG,data.number + " send message fail");
							}
							sms1.token = mWSManager.getQRCode();
							sms1.data = datas;
							sms.setTime("" + System.currentTimeMillis());
							
							FLog.i(TAG,sms1.toJson());
							FLog.i(TAG,sms1.toJson());
							
							mWSManager.sendPacket(sms1);
						}
					}
				}
			}
			StateManager.getInstance().pullState(new State(State.STATE_SMS_TOPC));
		}

		FLog.i(TAG, "Handle command " + packet.cmd + " finish!");
	}

	// ///////////////////////////////////////////////////////////////////////////////////////////////////////

	public void setNetWorktManager(INetworkManager manager) {
		this.mWSManager = manager;
		mQRCode = this.mWSManager.getQRCode();
	}

	public void setNewMsg(List<SMSData> smsValue, String cmd) {
		SMSPacket sms = new SMSPacket();
		sms.id = "0";
		sms.cmd = cmd;
		sms.type = Constants.WS_COMMAND_TYPE_REQUEST;
		sms.to = Constants.WS_COMMAND_TARGET;
		sms.data = smsValue;
		sms.token = mQRCode;

			if (mWSManager != null) {
				// send
				StateManager.getInstance().pushState(new State(State.STATE_SMS_TOPC));
				this.mWSManager.sendPacket(sms);
				StateManager.getInstance().pullState(new State(State.STATE_SMS_TOPC));

			}
	}

	public void setUpdateMsg(List<SMSData> smsValue) {
		SMSPacket sms = new SMSPacket();
		sms.id = "0";
		sms.cmd = Constants.COMMAND_UPDATE_SMS;
		sms.type = Constants.WS_COMMAND_TYPE_REQUEST;
		sms.to = Constants.WS_COMMAND_TARGET;
		sms.data = smsValue;
		sms.token = mQRCode;

			if (mWSManager != null) {
				StateManager.getInstance().pushState(new State(State.STATE_SMS_TOPC));
				// send
				this.mWSManager.sendPacket(sms);

				StateManager.getInstance().pullState(new State(State.STATE_SMS_TOPC));
			}
	}

	public void setDelMsg(List<SMSData> smsValue) {
		SMSPacket sms = new SMSPacket();
		sms.id = "0";
		sms.cmd = Constants.COMMAND_DELETE_SMS;
		sms.type = Constants.WS_COMMAND_TYPE_REQUEST;
		sms.to = Constants.WS_COMMAND_TARGET;
		sms.data = smsValue;
		sms.token = mQRCode;

			if (mWSManager != null && this.mWSManager.isConnectedServer()) {
				StateManager.getInstance().pushState(new State(State.STATE_SMS_TOPC));
				// send
				this.mWSManager.sendPacket(sms);

				StateManager.getInstance().pullState(new State(State.STATE_SMS_TOPC));
			}
	}

	public void start() {
		FacebookChatProxyService.getInstance().setContext(mContext);
		
		ContactDataPacketManager.getInstance().setContext(mContext);
		mContactContent.GetContactList();

		mSmsContent.GetSmsList();
		
		
		
	}

	public void stop() {
//		if (networkAdapter != null) {
//			networkAdapter.unregisterReceiver();
//		}
	}

	private int deleteSms(List<String> lstSmsId) {
		String[] sArySmsID = new String[1];

		for (String aLstSmsId : lstSmsId) {
			sArySmsID[0] = aLstSmsId;
			SmsObjectManager.deleteSms(mContext, sArySmsID);
		}

		return 0;
	}

	private int updateSmsStatus(SMSMessage sms) {
		String[] times = new String[1];

		times[0] = sms.getTime();

		ContentValues contentValues = new ContentValues();

		contentValues.put("read", sms.isRead());

		return SmsObjectManager.updateSms(mContext, contentValues, times);
	}

	private List<String> sendSms(String sessionId, SMSData data) {
		List<String> resultIds = new ArrayList<String>();

		String number = data.number;
		List<SMSMessage> smses = data.getMsg();

		FLog.i(TAG,
				"Send sms, number: " + number + ", sms count: " + smses.size());

		try {
			for (final SMSMessage sms : smses) {
				String smsId = "";
				if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {

				} else {
					smsId = SmsObjectManager.insertSms(mContext, number, sms);
				}
				sms.setNumber(number);

				String body = sms.getMessage();
				final long curtime = System.currentTimeMillis();
				SmsSender.sendSms(mContext, number, body, sessionId, smsId);

				if ("".equals(smsId)) {
					thread = new Thread() {
						public void run() {
							try {
								Thread.sleep(2000);
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
							mSmsContent.notifyNewSms(curtime, sms);
						}
					};
					thread.start();
				}
				resultIds.add(smsId);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return resultIds;
	}

	@Override
	public void onDisconnect() {
		FLog.i(TAG, "onDisconnect");

		MessengerUtil.sendMsg2Client("WifiState",
				mContext.getString(R.string.s_wifi_disconnect),
				Constants.MSG_WIFI_STATE);
	}

	@Override
	public void onConnect(int type) {
		FLog.i(TAG, "onConnect");

		/*
		 * WifiManager wifiManager = (WifiManager) mContext
		 * .getSystemService(Context.WIFI_SERVICE); WifiInfo wifiInfo =
		 * wifiManager.getConnectionInfo();
		 * 
		 * String sMention = mContext.getString(R.string.s_wifi_connect) +
		 * " AP: " + wifiInfo.getSSID();
		 * 
		 * SocketActivity.SendMsg2Client("WifiState", sMention,
		 * MainService.MSG_WIFI_STATE);
		 */
	}

	@Override
	public void onError(int code) {
		FLog.i(TAG, "onError");
	}

	public synchronized void onNotificationPosted(final NotificationObject no) {

		try {
				if (mWSManager != null && mWSManager.isConnectedServer() && mWSManager.isPCConnectServer()) {
					StateManager.getInstance().pushState(new State(State.STATE_NOTIFICATION_TOPC));
					mNotificationManager.sendNotification(mContext,
							this.mWSManager, no);

					StateManager.getInstance().pullState(new State(State.STATE_NOTIFICATION_TOPC));
				}

			FLog.i(TAG, "New notification. Titile: " + no.title);
		} catch (Exception e) {
			e.printStackTrace();

			FLog.e(TAG, "New notification. Send to PC fail.");
		}
	}

	public synchronized void onNotificationRemoved(NotificationObject no) {

		try {
				if (mWSManager != null && mWSManager.isConnectedServer() && mWSManager.isPCConnectServer()) {
					StateManager.getInstance().pushState(new State(State.STATE_NOTIFICATION_TOPC));
					mNotificationManager.notifyDeleteNotification(
							this.mWSManager, no);
					StateManager.getInstance().pullState(new State(State.STATE_NOTIFICATION_TOPC));
				}

			FLog.i(TAG, "Remove notification. Titile: " + no.title);
		} catch (Exception e) {
			e.printStackTrace();

			FLog.i(TAG, "Remove notification. Send to PC fail.");
		}
	}

	public synchronized void onAllNotification(final NotificationObject[] result) {
		List<NotificationObject> list = Arrays.asList(result);
		if (list.size() == 0) {
			return;
		}

		try {
			if(mWSManager != null && mWSManager.isConnectedServer() && mWSManager.isPCConnectServer()){
				StateManager.getInstance().pushState(new State(State.STATE_ALL_NOTIFICATION));
				mNotificationManager.sendNotification(mContext, this.mWSManager,
						list);
				StateManager.getInstance().pullState(new State(State.STATE_ALL_NOTIFICATION));
				FLog.i(TAG, "Send all notification to PC, count: " + list.size());
			}
		} catch (Exception e) {
			e.printStackTrace();
			FLog.i(TAG, "Send all notification to PC, fail.");
		}

	}

	public synchronized void onDismissNotification() {
		FLog.i(TAG, "onDismissNotification");
	}
	
	private void putSharedPreferencesKeyValue(String key, String value) {
		SharedPreferences sh = mContext.getSharedPreferences(Constants.VERSION,
				Context.MODE_PRIVATE|Context.MODE_MULTI_PROCESS );
		Editor editor = sh.edit();
		editor.putString(key, value);
		editor.commit();
	}
}
