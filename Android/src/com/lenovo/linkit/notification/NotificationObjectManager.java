package com.lenovo.linkit.notification;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.map.JsonMappingException;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;

import com.lenovo.linkit.Constants;
import com.lenovo.linkit.UserSetting;
import com.lenovo.linkit.http.IconHelper;
import com.lenovo.linkit.http.IconNativeHelp;
import com.lenovo.linkit.http.IconResponser;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.network.INetworkManager;
import com.lenovo.linkit.util.ResourceUtil;
import com.lenovo.linkit.util.ServiceUtil;

public class NotificationObjectManager {
	private static final String TAG = "NotificationObjectManager";
	private static NotificationObjectManager mInstance;

	private List<NotificationObject> mNotificationList;

	private String mRespondId;
	private String mToken;
	private String cid;

	public void setToken(String mToken) {
		this.mToken = mToken;
	}

	protected NotificationObjectManager() {
		mNotificationList = new ArrayList<NotificationObject>();
	}

	public static NotificationObjectManager getNotificationManager() {
		if (mInstance == null) {
			mInstance = new NotificationObjectManager();
		}

		return mInstance;
	}

	public List<NotificationObject> getNotificationList() {
		return mNotificationList;
	}

	public List<NotificationObject> getNotificationList(List<String> idList) {
		List<NotificationObject> list = new ArrayList<NotificationObject>();
		List<String> ids = new ArrayList<String>();
		ids.addAll(idList);

		for (NotificationObject object : mNotificationList) {
			Iterator<String> iterator = ids.iterator();

			while (iterator.hasNext()) {
				String id = iterator.next();
				if (object.getId().equals(id)) {
					list.add(object);
					iterator.remove();
				}
			}
		}

		return list;
	}

	private void removeNotificationFromList(String id) {
		Iterator<NotificationObject> iterator = mNotificationList.iterator();
		while (iterator.hasNext()) {
			NotificationObject object = iterator.next();
			if (object.getId().equals(id)) {
				iterator.remove();
				return;
			}
		}
	}

	private String getIconUri(Context context, NotificationObject object) {
		if ((object.getId() == null) || (object.getId().trim().equals(""))) {
			object.createId();
		}

		try {
			String uri = IconNativeHelp.queryLocalIcon(context, object.getId());
			if (uri != null) {
				return uri;
			}

			uri = IconNativeHelp.queryServerIcon(context,
					object.getPackageName());
			if (uri != null) {
				IconNativeHelp.localSaveIconUri(context, object.getId(), uri);
				return uri;
			}

			uri = sendIcon2Server(context, object);
			if (uri != null) {
				IconNativeHelp.localSaveIconUri(context, object.getId(), uri);
			}

			return uri;
		} catch (Exception e) {
			e.printStackTrace();

			FLog.e(TAG, "Get notification icon uri fail.");
		}

		return null;
	}

	private String sendIcon2Server(Context context, NotificationObject object) {
		String serverIP = UserSetting.getWebSocketAddress(context);

		InputStream inputStream = getIconInputStream(context, object);
		if (inputStream == null) {
			return null;
		}

		String packName = object.getPackageName();
		String fileName = object.getId() + ".png";
		IconResponser responser = IconHelper.uploadByStream(serverIP, packName,
				IconNativeHelp.getPackageVersion(context, packName), fileName,
				inputStream);
		return responser.url;
	}

	private InputStream getIconInputStream(Context context,
			NotificationObject object) {
		Drawable drawable = ResourceUtil.getIcon(context,
				object.getPackageName(), object.getNotificationID());
		if (drawable == null) {
			return null;
		}

		Bitmap bitmap = ((BitmapDrawable) drawable).getBitmap();
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		bitmap.compress(CompressFormat.PNG, 100, bos);

		return new ByteArrayInputStream(bos.toByteArray());
	}

	public void getAllNotification(Context context, String id, String cid) {
		mRespondId = id;
		this.cid = cid;
		getNotifications(context);
	}

	public void sendNotification(Context context, INetworkManager manager,
			NotificationObject object) throws JsonGenerationException,
			JsonMappingException, IOException {
		if (object == null) {
			return;
		}

		object.createId();
		if (checkIDEffectiveness(object.getId())) {

			object.setIcon(getIconUri(context, object));
			mNotificationList.add(object);

			List<NotificationObject> list = new ArrayList<NotificationObject>();
			list.add(object);

			NotificationPacket notificationPacket = new NotificationPacket("0",
					manager.getQRCode());
			notificationPacket.setNotification(list);

			if (manager.isConnectedServer()) {
				manager.sendPacket(notificationPacket);
			}
		}
	}

	public void sendNotification(Context context, INetworkManager manager,
			List<NotificationObject> list) throws JsonGenerationException,
			JsonMappingException, IOException {
		if ((list == null) || (list.size() == 0)) {
			return;
		}

		mNotificationList.clear();

		for (NotificationObject object : list) {
			if (object != null) {
				object.createId();
				if (checkIDEffectiveness(object.getId())) {
					object.setIcon(getIconUri(context, object));
					mNotificationList.add(object);
				}
			}
		}

		NotificationPacket notificationPacket = NotificationPacket
				.makeResponse(mRespondId, mToken, cid);
		notificationPacket.setNotification(mNotificationList);
		manager.sendPacket(notificationPacket);
	}

	private boolean checkIDEffectiveness(String id) {
		if (mNotificationList != null) {
			for (NotificationObject no : mNotificationList) {
				if (no.getId().equals(id)) {
					return false;
				}
			}
		}
		return true;
	}

	public void notifyDeleteNotification(INetworkManager manager,
			NotificationObject no) throws JsonGenerationException,
			JsonMappingException, IOException {

		List<String> data = new ArrayList<String>();
		no.createId();
		data.add(no.getId());

		DeleteNotificationPacket deleteNotificationPacket = new DeleteNotificationPacket(
				manager.getQRCode(), data);
		if (manager.isConnectedServer()) {
			manager.sendPacket(deleteNotificationPacket);
		}

		removeNotificationFromList(no.getId());
	}

	public void getNotifications(Context context) {
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
			if (ServiceUtil.isServiceRunning(context,
					"com.lenovo.linkit.notification.NotificationDaemonService")) {
				Intent intent = new Intent();
				intent.setAction(Constants.NOTIFICATIONDAEMONSERVICE_NLSERVICERECEIVER_ACTION);
				intent.putExtra(Constants.NOTIFICATION_COMMAND,
						Constants.COMMAND_ALL_NOTIFICATION);
				context.sendBroadcast(intent);
			} else {
				throw new SecurityException("Service is not runnting.");
			}
		} else {
			throw new SecurityException("Can't get the notifications");
		}
	}

	public void deleteNotifications(Context context,
			List<NotificationObject> list) {
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
			Intent intent = new Intent();
			intent.setAction(Constants.NOTIFICATIONDAEMONSERVICE_NLSERVICERECEIVER_ACTION);
			intent.putExtra(Constants.NOTIFICATION_COMMAND,
					Constants.COMMAND_DISMISS_NOTIFICATION);
			NotificationObjectList nol = new NotificationObjectList();
			nol.setNotificationObject(list);
			intent.putExtra("data", nol);
			context.sendBroadcast(intent);

			FLog.i(TAG, "Delete notification, count: " + list.size());
		} else {
			throw new SecurityException("Can't delete the notifications");
		}
	}
}
