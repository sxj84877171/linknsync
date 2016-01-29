package com.lenovo.linkit.http;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager.NameNotFoundException;

import com.lenovo.linkit.Constants;
import com.lenovo.linkit.UserSetting;

public class IconNativeHelp {

	public static String queryLocalIcon(Context context, String id) {
		String serverIP = UserSetting.getWebSocketAddress(context);
		SharedPreferences sp = context.getSharedPreferences(serverIP
				+ Constants.ICON_LOCAL_SP, Context.MODE_PRIVATE);

		if (sp.contains(id)) {
			return sp.getString(id, null);
		}

		return null;
	}
	
	public static String getPackageVersion(Context context, String packName) {
		PackageInfo packageInfo;
		try {
			packageInfo = context.getPackageManager().getPackageInfo(packName,
					0);
			return "" + packageInfo.versionCode;
		} catch (NameNotFoundException e) {
			e.printStackTrace();
		}

		return null;
	}
	
	public static String queryServerIcon(Context context, String packName) {
		String serverIP = UserSetting.getWebSocketAddress(context);

		IconResponser responser = IconHelper.getIcon(serverIP, packName,
				IconNativeHelp.getPackageVersion(context, packName));
		return responser.url;
	}
	
	public static void localSaveIconUri(Context context, String id, String uri) {
		String serverIP = UserSetting.getWebSocketAddress(context);
		SharedPreferences sp = context.getSharedPreferences(serverIP
				+ Constants.ICON_LOCAL_SP, Context.MODE_PRIVATE);

		Editor editor = sp.edit();
		editor.putString(id, uri);
		editor.commit();
	}
	
	
}
