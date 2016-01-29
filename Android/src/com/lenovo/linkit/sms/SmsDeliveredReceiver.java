package com.lenovo.linkit.sms;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.lenovo.linkit.log.FLog;

public class SmsDeliveredReceiver extends BroadcastReceiver {

	@Override
	public void onReceive(final Context context, final Intent intent) {

//        String sSessionId = intent.getStringExtra("SessionId");
//        String sSmsId = intent.getStringExtra("SmsId");

        switch (this.getResultCode()) {
            case Activity.RESULT_OK:
                //String sDeliveredMsg = "Delivered: " + sSessionId + " : " + sSmsId;
            	FLog.i("SmsDeliveredReceiver", "Delivered");
                break;
            default:
                break;
        }
	}

}
