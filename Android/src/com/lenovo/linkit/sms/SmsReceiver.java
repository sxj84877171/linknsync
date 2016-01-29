package com.lenovo.linkit.sms;

import android.annotation.TargetApi;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.provider.Telephony;
import android.telephony.SmsMessage;

public class SmsReceiver extends BroadcastReceiver {

    public static final String SMS_RECEIVED_ACTION = "android.provider.Telephony.SMS_RECEIVED";

    @Override
    public void onReceive(final Context context, final Intent intent) {
        if (intent.getAction().equals(Telephony.Sms.Intents.SMS_RECEIVED_ACTION)) {

            SmsMessage[] messages = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                messages = getMessagesFromIntentKitKat(intent);
            } else {
                messages = getMessagesFromIntentPreKitKat(intent);
            }

        }
    }

    @TargetApi(Build.VERSION_CODES.KITKAT)
    private SmsMessage[] getMessagesFromIntentKitKat(final Intent intent) {
        return Telephony.Sms.Intents.getMessagesFromIntent(intent);
    }

    private SmsMessage[] getMessagesFromIntentPreKitKat(final Intent intent) {
        final Object[] pdus = (Object[]) intent.getSerializableExtra("pdus");

        final int pduCount = pdus.length;
        final SmsMessage[] messages = new SmsMessage[pduCount];

        for (int i = 0; i < pduCount; i++) {
            final byte[] pdu = (byte[]) pdus[i];
            messages[i] = SmsMessage.createFromPdu(pdu);
        }
        return messages;
    }
}
