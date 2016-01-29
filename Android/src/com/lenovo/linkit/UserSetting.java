package com.lenovo.linkit;

import java.util.UUID;

import com.lenovo.linkit.log.FLog;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.preference.PreferenceManager;

/**
 * Created by sam on 14-3-9.
 */
public class UserSetting {
	public static String TAG = "UserSetting";
	// private static String mDefaultHttpServer = "www.dworkstudio.com";
	private static String mTestHttpServer = "114.215.236.240";
	private static String mDefaultHttpServer = "thelinkit.com";//"http://thelinkit.com/" ;//"115.29.178.5";
	
	private static final String mTestSyncUrl = "http://114.215.236.240:4984/sync_gateway";
    private static final String mDefaultSyncUrl = "http://115.29.178.5:4984/sync_gateway";
    
	private static String mHttpServer = Constants.IS_TEST_BUILD ? mTestHttpServer
			: mDefaultHttpServer;
	
	private static String mHttpSyncUrl = Constants.IS_TEST_BUILD ? mTestSyncUrl
			: mDefaultSyncUrl;

	public static void initSetting(Context context) {
		try {
			SharedPreferences settings = PreferenceManager
					.getDefaultSharedPreferences(context);

			mHttpServer = settings.getString("serverAddress", "");
			if (mHttpServer.isEmpty()) {
				if (Constants.IS_TEST_BUILD) {
					mHttpServer = mTestHttpServer;
				} else {
					mHttpServer = mDefaultHttpServer;
				}

				SharedPreferences.Editor sharedata = settings.edit();
				sharedata.putString("serverAddress", mHttpServer);
				sharedata.commit();
			}

			FLog.i(TAG, "Init setting finished. Server: " + mHttpServer);

		} catch (Exception e) {
			FLog.e(TAG, "Exception on create folder. " , e);
		}
	}

	public static String getWebSocketAddress(Context context) {
		SharedPreferences sh = context.getSharedPreferences(Constants.WS_SP,
				Context.MODE_WORLD_READABLE | Context.MODE_MULTI_PROCESS);

		String address = sh.getString("serverAddress", "");
		if (address.isEmpty()) {
			initSetting(context);

			FLog.i(TAG, "Get web socket server: " + mHttpServer);
			return mHttpServer;
		} else {
			FLog.i(TAG, "Get web socket server: " + address);
			mHttpServer = address;
			return address;
		}
	}
	public static long getLastSeq(Context context, long value) {
		SharedPreferences sh = context.getSharedPreferences(Constants.DOC_LAST_SEQ,
				Context.MODE_PRIVATE);
		long ret = sh.getLong(Constants.DOC_LAST_SEQ, 0);
		return ret;
	}
	public static void setLastSeq(Context context, long content){
		SharedPreferences sh = context.getSharedPreferences(Constants.DOC_LAST_SEQ,
				Context.MODE_PRIVATE);
		Editor editor = sh.edit();
		editor.putLong(Constants.DOC_LAST_SEQ, content);
		editor.commit();
		return ;
	}
	
	public static void setDocumentIds(Context context, String content){
		SharedPreferences sh = context.getSharedPreferences(Constants.DOCUMENT_IDS,
				Context.MODE_PRIVATE);
		Editor editor = sh.edit();
		editor.putString(Constants.DOCUMENT_IDS, content);
		editor.commit();
		return ;
	}

	public static String getDocumentIds(Context context) {
		SharedPreferences sh = context.getSharedPreferences(Constants.DOCUMENT_IDS,
				Context.MODE_PRIVATE);
		String ret = sh.getString(Constants.DOCUMENT_IDS, "");
		return ret;
	}
	
	public static String getPhoneUUID(Context context) {
		String ret;
		SharedPreferences sh = context.getSharedPreferences(Constants.PHONE_UUID,
				Context.MODE_PRIVATE);
		ret = sh.getString(Constants.PHONE_UUID, "");
		if (ret.isEmpty()){
			return setPhoneUUID(context);
		}
		return ret;
	}
	
	public static String setPhoneUUID(Context context){
		String uuid = UUID.randomUUID().toString();
		SharedPreferences sh = context.getSharedPreferences(Constants.PHONE_UUID,
				Context.MODE_PRIVATE);
		Editor editor = sh.edit();
		editor.putString(Constants.PHONE_UUID, uuid);
		editor.commit();
		return uuid;
	}
	public static String getSyncUrl() {
		return mHttpSyncUrl;
	}
	public static String getHttpServerAddress() {
		return mHttpServer;
	}

}