package com.lenovo.linkit.contact;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.net.Uri;
import android.provider.ContactsContract;

import com.lenovo.linkit.Constants;
import com.lenovo.linkit.UserSetting;
import com.lenovo.linkit.http.AvatarHelper;
import com.lenovo.linkit.http.IconResponser;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.network.INetworkManager;
import com.lenovo.linkit.phoneinfo.PhoneInfoPacket;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.sms.SmsContentObserver;
import com.lenovo.linkit.util.MD5Util;

public class ContactManager {
	private static final String TAG = "ContactManager";
	private AvatarHelper mHelper;

	private static ContactManager mInstance;

	public static ContactManager getContactManager() {
		if (mInstance == null) {
			mInstance = new ContactManager();
		}

		return mInstance;
	}

	private ContactManager() {
		mHelper = new AvatarHelper();
	}

	public String getAvatarUri(Context context, String deviceID,
			String contactNum, byte[] avatar) {
		String avatarId =  MD5Util.MD5(mergeBytes(contactNum.getBytes(), avatar));

		try {
			String uri = queryLocalAvatar(context, avatarId);
			if (uri != null) {
				return uri;
			}

			uri = queryServerAvatar(context, deviceID, avatarId);
			if (uri != null) {
				localSaveAvatarUri(context, avatarId, uri);
				return uri;
			}

			uri = sendAvatar2Server(context, deviceID, avatarId, avatar);
			if (uri != null) {
				localSaveAvatarUri(context, avatarId, uri);
			} else {
				FLog.e(TAG, "Send avatar to server fail.");
			}

			return uri;
		} catch (Exception e) {
			FLog.e(TAG, "getAvatarUri fail.");
			e.printStackTrace();
		}

		return null;
	}
	
	private byte[] mergeBytes(byte[] buf1, byte[] buf2) {
		byte[] buffer = new byte[buf1.length + buf2.length];
		System.arraycopy(buf1, 0, buffer, 0, buf1.length);
		System.arraycopy(buf2, 0, buffer, buf1.length, buf2.length);
		
		return buffer;
	}

	private String queryLocalAvatar(Context context, String avatarId) {
		String serverIP = UserSetting.getWebSocketAddress(context);
		SharedPreferences sp = context.getSharedPreferences(serverIP
				+ Constants.CONTACT_AVATAR_LOCAL_SP, Context.MODE_PRIVATE);
		return sp.getString(avatarId, null);

	}

	private String queryServerAvatar(Context context, String deviceID,
			String avatarId) {
		String serverIP = UserSetting.getWebSocketAddress(context);

		IconResponser responser = mHelper.getAvatar(serverIP, deviceID,
				avatarId);
		return responser.url;
	}

	private void localSaveAvatarUri(Context context, String avatarId, String uri) {
		String serverIP = UserSetting.getWebSocketAddress(context);
		SharedPreferences sp = context.getSharedPreferences(serverIP
				+ Constants.CONTACT_AVATAR_LOCAL_SP, Context.MODE_PRIVATE);

		Editor editor = sp.edit();
		editor.putString(avatarId, uri);
		editor.commit();
	}

	private String sendAvatar2Server(Context context, String deviceID,
			String avatarId, byte[] avatar) {
		String serverIP = UserSetting.getWebSocketAddress(context);

		String fileName = avatarId + ".png";
		InputStream inputStream = new ByteArrayInputStream(avatar);
		IconResponser responser = mHelper.uploadByStream(serverIP, deviceID,
				avatarId, fileName, inputStream);
		return responser.url;
	}

	public byte[] getPhotoById(ContentResolver resolver, int contactid) {
		Uri uri = ContentUris.withAppendedId(
				ContactsContract.Contacts.CONTENT_URI, contactid);
		InputStream input = ContactsContract.Contacts
				.openContactPhotoInputStream(resolver, uri);

		ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
		byte[] buf = new byte[2048];
		try {
			int length = input.read(buf);
			while (length > 0) {
				outputStream.write(buf, 0, length);
				length = input.read(buf);
			}

			return outputStream.toByteArray();

		} catch (IOException e) {
			e.printStackTrace();
		}finally{
			if(input != null){
				try {
					input.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
			
			if(outputStream != null){
				try {
					outputStream.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		return null;
	}

	private ContactInfo getAvatar(Context context, ContentResolver resolver,
			String deviceID, ContactObject conObj) {
		if (conObj.isHasphoto()) {
			byte[] buf = getPhotoById(resolver, conObj.getPerson());
			if (buf != null) {
				String contactNum = conObj.getPhonenumbers();

				String uri = getAvatarUri(context, deviceID, contactNum, buf);
				if (uri != null) {
					FLog.i(TAG, "Name:" + conObj.getName() + ", avatar:" + uri);
					return new ContactInfo(contactNum, uri);
				}
			}
		}

		return null;
	}

	public void sendAvatars(final Context context, INetworkManager ws,
			String token, Packet packet) {
		List<ContactObject> contactList =SmsContentObserver
				.getSynchronizeContact();
		if (contactList == null) {
			return;
		}

		FLog.i(TAG, "Contact count:" + contactList.size());

		PhoneInfoPacket phoneInfo = new PhoneInfoPacket(context,
				ws.getQRCode(), packet);

		ContentResolver resolver = context.getContentResolver();
		for (ContactObject contact : contactList) {
			ContactInfo info = getAvatar(context, resolver,
					phoneInfo.data.deviceid, contact);
			if (info != null) {
				ContactPacket contactPacket = new ContactPacket(token);
				contactPacket.setId(packet.getId());
				contactPacket.setCid(packet.getCid());
				contactPacket.setSingleData(info);
				ws.sendPacket(contactPacket);
			}
		}
	}
	
	
	
}
