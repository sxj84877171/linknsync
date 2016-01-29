package com.lenovo.linkit.sms;

import java.util.Date;

import android.annotation.TargetApi;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.Telephony;

import com.lenovo.linkit.log.FLog;

public class SmsObjectManager {
	private static final String TAG = "SmsObjectManager";
	
	public static String insertSms(final Context context, String number,
			SMSMessage sms) {
		Uri uri = null;
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
			uri = getContentUriInBox();
		} else {
			uri = getContentUriInBoxPreKitKat();
		}

		ContentResolver resolver = context.getContentResolver();
		ContentValues contentValues = new ContentValues();
		String sListTo = number;

		long lTime = new Date().getTime();
		contentValues.put("date", lTime);
		contentValues.put("date_sent", lTime);
		contentValues.put("address", sListTo);
		contentValues.put("body", sms.getMessage());

		Uri retUri = resolver.insert(uri, contentValues);

		String sID = "";
		Cursor cursor = resolver.query(retUri, null, null, null, null);
		while ((null != cursor) && (cursor.moveToNext())) {
			sID = cursor.getString(cursor.getColumnIndex("_ID"));
		}

		if (null != cursor) {
			cursor.close();
		}

		if ((sID == null) || (sID.trim().isEmpty())) {
			FLog.e(TAG, "Insert sms fail.");
		}

		return sID;
	}

	public static void deleteSms(Context context, String[] aryDeleteID) {
		int iRet = 0;

		if (aryDeleteID.length > 0) {
			iRet = context.getContentResolver().delete(
					Uri.parse("content://sms"), "date=?", aryDeleteID);
		}

		if (iRet == 0) {
			FLog.w(TAG, "Update sms fail.");
		}
	}

	public static int updateSms(Context context, ContentValues contentValues,
			String[] updateTimes) {
		int iRet = 0;

		if (updateTimes.length > 0) {
			iRet = context.getContentResolver().update(
					Uri.parse("content://sms"), contentValues, "date=?",
					updateTimes);
		}

		if (iRet == 0) {
			FLog.w(TAG, "Update sms fail.");
		}

		return iRet;
	}

	@TargetApi(Build.VERSION_CODES.KITKAT)
	private static Uri getContentUriInBox() {
		return Telephony.Sms.Sent.CONTENT_URI;
	}

	private static Uri getContentUriInBoxPreKitKat() {
		return Uri.parse("content://sms/sent");
	}

	@TargetApi(Build.VERSION_CODES.KITKAT)
	private static Uri getContentUri() {
		return Telephony.Sms.CONTENT_URI;
	}

	private static Uri getContentUriPreKitKat() {
		return Uri.parse("content://sms");
	}
}
