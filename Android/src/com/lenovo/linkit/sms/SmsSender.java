package com.lenovo.linkit.sms;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.telephony.SmsManager;

import java.util.ArrayList;

import com.lenovo.linkit.log.FLog;

public class SmsSender {
	private static final String TAG = "SmsSender";

	public static void sendSms(Context context, String phoneNumber,
			String text, String sSessionId, String smsId) {

		Intent iSent = new Intent(context, SmsSentReceiver.class);
		Intent iDelivered = new Intent(context, SmsDeliveredReceiver.class);

		SmsManager manager = SmsManager.getDefault();

		ArrayList<String> messages = manager.divideMessage(text);
		for (String msg : messages) {
			FLog.i(TAG, msg);
		}
		
		iDelivered.putExtra("SessionId", sSessionId);
		iDelivered.putExtra("SmsId", smsId);

		iSent.putExtra("SessionId", sSessionId);
		iSent.putExtra("SmsId", smsId);

		PendingIntent piSent = PendingIntent.getBroadcast(context, 0, iSent, 0);
		PendingIntent piDelivered = PendingIntent.getBroadcast(context, 0,
				iDelivered, 0);

		if (messages.size() > 1) {
			ArrayList<PendingIntent> sentList = new ArrayList<PendingIntent>();
			ArrayList<PendingIntent> deliveredList = new ArrayList<PendingIntent>();

			for (String message : messages) {
				sentList.add(piSent);
				deliveredList.add(piDelivered);
			}

			manager.sendMultipartTextMessage(phoneNumber, null, messages,
					sentList, deliveredList);

		} else {
			manager.sendTextMessage(phoneNumber, null, text, null, null);
			
			FLog.i(TAG, "sendTextMessage finished.");
		}	
	}
}
