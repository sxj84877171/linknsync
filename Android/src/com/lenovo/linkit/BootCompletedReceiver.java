package com.lenovo.linkit;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class BootCompletedReceiver extends BroadcastReceiver {
	@Override
	public void onReceive(Context context, Intent intent)
    {
        if ((null == intent) || (null == intent.getAction()))
        {
            return;
        }
		if (intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)) {
			Intent serviceIntent = new Intent(context, MainService.class);
			context.startService(serviceIntent);
		}


	}

}
