package com.lenovo.linkit.sms;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.SmsManager;

import com.lenovo.linkit.log.FLog;

public class SmsSentReceiver extends BroadcastReceiver {

	@Override
	public void onReceive(final Context context, final Intent intent)
    {
//        String sSessionId = intent.getStringExtra("SessionId");
//        String sSmsId = intent.getStringExtra("SmsId");

		switch (this.getResultCode()) {
			case Activity.RESULT_OK:
				FLog.i("SmsSentReceiver", "Sent");
				break;
			case SmsManager.RESULT_ERROR_GENERIC_FAILURE:
			case SmsManager.RESULT_ERROR_RADIO_OFF:
			case SmsManager.RESULT_ERROR_NULL_PDU:
			case SmsManager.RESULT_ERROR_NO_SERVICE:
				break;
		}
	}

}
