package com.lenovo.linkit.util;

import android.content.Context;
import android.telephony.TelephonyManager;

public class TelephonyUtil {
	public static String getLine1Number(final Context context) {
		final TelephonyManager manager = (TelephonyManager) context
				.getSystemService(Context.TELEPHONY_SERVICE);

		return String.valueOf(manager.getLine1Number());
	}
}
