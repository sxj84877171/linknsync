package com.lenovo.linkit.notification;

import java.util.ArrayList;
import java.util.List;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.IBinder;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

import com.lenovo.linkit.Constants;
import com.lenovo.linkit.log.FLog;

@SuppressLint("NewApi")
public class NotificationDaemonService extends NotificationListenerService {
	public static final String TAG = NotificationDaemonService.class
			.getSimpleName();

	private NLServiceReceiver nlservicereciver;

	public void onCreate() {
		FLog.init(getApplicationContext(), "NoService_debug.log");
		
		IntentFilter filter = new IntentFilter();
		filter.addAction(Constants.NOTIFICATIONDAEMONSERVICE_NLSERVICERECEIVER_ACTION);
		filter.addAction(Constants.ACTION_GET_LOG_FROM_NOTIFICATION_SERVICE);
		nlservicereciver = new NLServiceReceiver();
		registerReceiver(nlservicereciver, filter);

		Intent sendIntent = new Intent();
		sendIntent.setAction(Constants.MAINSERVER_NLSERVICERECEIVER_ACTION);
		sendIntent.putExtra(Constants.NOTIFICATION_COMMAND,
				Constants.COMMAND_SERVICE_STATE);
		sendIntent.putExtra("data", true);
		sendBroadcast(sendIntent);

		Intent sendIntent2 = new Intent();
		sendIntent2.setAction(Constants.MAINACTIVITY_NLSERVICERECEIVER_ACTION);
		sendIntent2.putExtra("data", true);
		sendBroadcast(sendIntent2);

		FLog.i(TAG, "LINKit NotificationListenerService start listen.");

		super.onCreate();
	}

	@Override
	public IBinder onBind(Intent intent) {
		return super.onBind(intent);
	}

	public void onDestroy() {
		Intent sendIntent = new Intent();
		sendIntent.setAction(Constants.MAINSERVER_NLSERVICERECEIVER_ACTION);
		sendIntent.putExtra(Constants.NOTIFICATION_COMMAND,
				Constants.COMMAND_SERVICE_STATE);
		sendIntent.putExtra("data", false);
		sendBroadcast(sendIntent);
		unregisterReceiver(nlservicereciver);
		
		FLog.i(TAG, "LINKit NotificationListenerService stop listen.");
		
		super.onDestroy();
	}

	@Override
	public void onNotificationPosted(final StatusBarNotification sbn) {
		this.sendNotificationChanage(sbn, false);
	}

	@Override
	public void onNotificationRemoved(final StatusBarNotification sbn) {
		this.sendNotificationChanage(sbn, true);
	}

	private void sendNotificationChanage(final StatusBarNotification sbn,
			final boolean removed) {
		NotificationObject no = getNotificationObject(sbn);
		Intent sendIntent = new Intent();
		sendIntent.setAction(Constants.MAINSERVER_NLSERVICERECEIVER_ACTION);
		String command = !removed ? Constants.COMMAND_NEW_NOTIFICATION
				: Constants.COMMAND_REMOVE_NOTIFICATION;
		sendIntent.putExtra(Constants.NOTIFICATION_COMMAND, command);
		if (no != null) {
			sendIntent.putExtra("result", no);
			sendBroadcast(sendIntent);
			
			FLog.i(TAG,
					"NotificationListenerService listen:sendNotificationChanage "
							+ (removed ? "remove notification"
									: "new notification" + no.getTitle()));
		}
	}

	private List<NotificationObject> getAcitivityNofiticationObject() {
		StatusBarNotification[] sbns = getActiveNotifications();
		List<NotificationObject> result = new ArrayList<NotificationObject>();
		if (sbns != null) {
			for (int i = 0; i < sbns.length; i++) {
				NotificationObject no = getNotificationObject(sbns[i]);
				if (no != null) {
					result.add(no);
				}
			}
		}
		return result;
	}

	private NotificationObject getNotificationObject(StatusBarNotification sbn) {
		NotificationObject no = new NotificationObject();
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
			Notification n = sbn.getNotification();
			CharSequence ctitle = n.extras
					.getCharSequence(Notification.EXTRA_TITLE);
			CharSequence ctext = n.extras
					.getCharSequence(Notification.EXTRA_TEXT);
			if (ctext == null) {
				ctext = sbn.getNotification().extras
						.getCharSequence(Notification.EXTRA_SUB_TEXT);
			}
			if (ctext != null) {
				no.setDesc(String.valueOf(ctext));
			}
			if (ctitle != null) {
				no.setTitle(String.valueOf(ctitle));
			}
			no.setIconId(n.icon);
			no.setPackageName(sbn.getPackageName());
			no.setNotificationID(sbn.getId());
			no.setTime(sbn.getPostTime());
			no.setTag(sbn.getTag());
			if ((sbn.getNotification().flags & Notification.FLAG_ONGOING_EVENT) != 0
					|| (n.flags & Notification.FLAG_NO_CLEAR) != 0) {
				no.setType("sys");
			} else {
				no.setType("user");
			}
			if (no.getTitle() == null || no.getIconId() == 0) {
				return null;
			}
			return no;
		} else {
			return null;
		}
	}

	class NLServiceReceiver extends BroadcastReceiver {

		@Override
		public void onReceive(Context context, Intent intent) {
			if (intent.getAction().equals(
					Constants.ACTION_GET_LOG_FROM_NOTIFICATION_SERVICE)) {
				String logmsg = FLog
						.getHtmlLogByLevel(Constants.LOG_LEVEL_VERBOSE);
				FLog.i(TAG, "Get service log string, size:" + logmsg.length());
				
				if ((logmsg != null) && (logmsg.trim().length() > 0)) {
					Bundle bundle = new Bundle();
					bundle.putString("log", logmsg);

					Intent sendbackIntent = new Intent();
					sendbackIntent
							.setAction(Constants.ACTION_SEND_NOTIFICATION_LOG_FROM_SERVICE);
					sendbackIntent.putExtras(bundle);

					sendBroadcast(sendbackIntent);
				}

				return;
			}

			Intent sendIntent = new Intent();
			FLog.i(TAG,
					Constants.NOTIFICATION_COMMAND
							+ ":"
							+ intent.getStringExtra(Constants.NOTIFICATION_COMMAND));
			
			sendIntent.setAction(Constants.MAINSERVER_NLSERVICERECEIVER_ACTION);
			if (intent.getStringExtra(Constants.NOTIFICATION_COMMAND).equals(
					Constants.COMMAND_ALL_NOTIFICATION)) {
				List<NotificationObject> result = getAcitivityNofiticationObject();

				sendIntent.putExtra(Constants.NOTIFICATION_COMMAND,
						Constants.COMMAND_ALL_NOTIFICATION);
				NotificationObjectList nol = new NotificationObjectList();
				nol.setNotificationObject(result);
				sendIntent.putExtra("result", nol);
				
				FLog.i(TAG,
						"NotificationListenerService listen: getAllNotification ");
			} else if (intent.getStringExtra(Constants.NOTIFICATION_COMMAND)
					.equals(Constants.COMMAND_DISMISS_NOTIFICATION)) {
				Bundle extra = intent.getExtras();
				NotificationObjectList nol = (NotificationObjectList) extra
						.get("data");
				NotificationObject[] result = nol.getNotificationObject();
				for (NotificationObject no : result) {
					cancelNotification(no.getPackageName(), no.getTag(),
							no.getNotificationID());
					
					FLog.i(TAG,
							"NotificationListenerService listen: cancel notification:"
									+ no.getTitle());
				}
				
				sendIntent.putExtra("result", nol);
			} else if (intent.getStringExtra(Constants.NOTIFICATION_COMMAND)
					.equals(Constants.COMMAND_SERVICE_STATE)) {
				sendIntent.putExtra(Constants.NOTIFICATION_COMMAND,
						Constants.COMMAND_SERVICE_STATE);
				sendIntent.putExtra("data", true);
			}

			sendBroadcast(sendIntent);
		}

	}
}
