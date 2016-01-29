package com.lenovo.linkit.util;

import android.app.NotificationManager;
import android.content.Context;
import android.support.v4.app.NotificationCompat;
import com.lenovo.linkit.R;


public class NotificationUtil {
	private static int sIndex = 1;

	public static void newNotification(final Context context) {
		final NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(context)
				.setSmallIcon(R.drawable.ic_stat_notification)
				.setContentTitle("Notification " + sIndex).setContentText("Hello World!");

		final NotificationManager mNotifyMgr = (NotificationManager) context
				.getSystemService(Context.NOTIFICATION_SERVICE);
		mNotifyMgr.notify(sIndex, mBuilder.build());
		sIndex++;
	}
}
