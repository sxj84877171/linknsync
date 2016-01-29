package com.lenovo.linkit;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import android.annotation.SuppressLint;
import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.CallLog;
import android.provider.ContactsContract;
import android.provider.Telephony;

import com.lenovo.linkit.calllog.CallLogBean;
import com.lenovo.linkit.contact.ContactBean;
import com.lenovo.linkit.contact.ContactPacket;
import com.lenovo.linkit.contact.MessageBean;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.sms.SMSMessage;
import com.lenovo.linkit.util.PhoneNumberUtil;

public class PacketManager {

	private Context context;

	private List<ContactBean> contactList;

	public static PacketManager getInstance(Context context) {
		if (instance.context == null) {
			instance.context = context;
		}
		return instance;
	}

	private PacketManager() {

	}

	private static PacketManager instance = new PacketManager();
	
	public List<ContactPacket> getContactPacketList(Packet packet){
		List<ContactPacket> result = new ArrayList<ContactPacket>();
		if(contactList == null){
			contactList = getContactBeanList();
		}
		for(ContactBean contact:contactList){
			ContactPacket cp = new ContactPacket(packet.getToken());
			if(contact.getData().size() > 5){
				
			}
			result.add(cp);
		}
		return result;
	}

	public List<ContactBean> getContactBeanList() {
		List<ContactBean> contacts = getContactBean();
		List<CallLogBean> calls = getAllCallLog();
		List<SMSMessage> smss = getAllSMSs();

		for (ContactBean contact : contacts) {
			List<MessageBean> data = new ArrayList<MessageBean>();
			data.addAll(findSMSMessageBean(contact, smss));
			data.addAll(findCallLogBean(contact, calls));
			contact.setData(data);
		}

		for (SMSMessage sms : smss) {
			if (!sms.isIncontact()) {
				ContactBean contact = new ContactBean();
				contact.setHasPhoto(false);
				contact.setIncontact(false);
				contact.setPersonID(0);
				contact.setPhonenumber(sms.getNumber());
				List<MessageBean> data = new ArrayList<MessageBean>();
				data.addAll(findSMSMessageBean(contact, smss));
				data.addAll(findCallLogBean(contact, calls));
				contact.setData(data);
				contacts.add(contact);
			}

		}
		for (CallLogBean call : calls) {
			if (!call.isIncontact()) {
				ContactBean contact = new ContactBean();
				contact.setHasPhoto(false);
				contact.setIncontact(false);
				contact.setPersonID(0);
				contact.setPhonenumber(call.getPhoneNumber());
				List<MessageBean> data = new ArrayList<MessageBean>();
				data.addAll(findSMSMessageBean(contact, smss));
				data.addAll(findCallLogBean(contact, calls));
				contact.setData(data);
				contacts.add(contact);
			}
		}

		return contacts;
	}

	public List<ContactBean> getContactBean() {
		List<ContactBean> contacts = new ArrayList<ContactBean>();
		Uri contactUri = ContactsContract.Contacts.CONTENT_URI;
		ContentResolver resolver = context.getContentResolver();
		Cursor cursor = resolver.query(contactUri, null, null, null, null);
		while (cursor.moveToNext()) {
			int iId = cursor.getInt(cursor
					.getColumnIndex(ContactsContract.Contacts._ID));
			String sId = String.valueOf(iId);
			long photoId = cursor.getLong(cursor
					.getColumnIndex(ContactsContract.Contacts.PHOTO_ID));

			int numberOfPhoneNumber = Integer
					.parseInt(cursor.getString(cursor
							.getColumnIndex(ContactsContract.Contacts.HAS_PHONE_NUMBER)));
			if (numberOfPhoneNumber > 0) {
				Cursor cursor2 = resolver.query(
						ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
						null, ContactsContract.CommonDataKinds.Phone.CONTACT_ID
								+ " = ?", new String[] { sId }, null);
				while (cursor2.moveToNext()) {
					ContactBean contact = new ContactBean();
					contact.setPersonID(iId);
					contact.setName(cursor.getString(cursor
							.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME)));
					contact.setPhonenumber(cursor2.getString(cursor2
							.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)));
					contact.setHasPhoto((photoId == 0) ? false : true);
					contact.setIncontact(true);
					contacts.add(contact);
				}
				cursor2.close();
			}
		}
		cursor.close();
		return contacts;
	}

	public List<CallLogBean> getAllCallLog() {

		List<CallLogBean> list = new ArrayList<CallLogBean>();
		Uri uri = android.provider.CallLog.Calls.CONTENT_URI;
		String[] projection = { CallLog.Calls.DATE, // 日期
				CallLog.Calls.NUMBER, // 号码
				CallLog.Calls.TYPE, // 类型
				CallLog.Calls.CACHED_NAME, // 名字
				CallLog.Calls._ID, // id
				CallLog.Calls.DURATION, };
		final ContentResolver resolver = context.getContentResolver();

		Cursor cursor = resolver.query(uri, projection, null, null, null);

		cursor.moveToFirst(); // 游标移动到第一项
		for (int i = 0; i < cursor.getCount(); i++) {
			CallLogBean clBean = new CallLogBean();
			cursor.moveToPosition(i);
			Date date = new Date(cursor.getLong(cursor
					.getColumnIndex(CallLog.Calls.DATE)));
			clBean.setTime(date.getTime());
			String number = cursor.getString(cursor
					.getColumnIndex(CallLog.Calls.NUMBER));
			clBean.setPhoneNumber(number);
			int type = cursor.getInt(cursor.getColumnIndex(CallLog.Calls.TYPE));
			clBean.setState(type == CallLog.Calls.INCOMING_TYPE ? Constants.INCOMING_CALL
					: (type == CallLog.Calls.OUTGOING_TYPE ? Constants.OUTGOING_CALL
							: Constants.MISSED_CALL));
			String cachedName = cursor.getString(cursor
					.getColumnIndex(CallLog.Calls.CACHED_NAME));// 缓存的名称与电话号码，如果它的存在
			clBean.setName(cachedName);
			int id = cursor.getInt(cursor.getColumnIndex(CallLog.Calls._ID));
			clBean.setId("" + id);
			long duration = cursor.getLong(cursor
					.getColumnIndex(CallLog.Calls.DURATION));
			clBean.setDuration(duration);
			list.add(clBean);
		}
		if(cursor != null && !cursor.isClosed()){
			cursor.close();
		}
		return list;

	}

	@SuppressLint("NewApi")
	public List<SMSMessage> getAllSMSs() {
		final List<SMSMessage> smses = new ArrayList<SMSMessage>();

		Uri uri = null;
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
			uri = Telephony.Sms.CONTENT_URI;
		} else {
			uri = Uri.parse("content://sms");
		}
		final ContentResolver resolver = context.getContentResolver();
		final Cursor cursor = resolver.query(uri, null, null, null, null);
		while ((null != cursor) && (cursor.moveToNext())) {
			SMSMessage sms = new SMSMessage();
			sms.setId(cursor.getLong(cursor.getColumnIndex("_ID")));
			sms.setTime(cursor.getString(cursor.getColumnIndex("date")));
			sms.setPerson(cursor.getInt(cursor.getColumnIndex("person")));
			sms.setStatus(cursor.getInt(cursor.getColumnIndex("type")));
			sms.setMessage(cursor.getString(cursor.getColumnIndex("body")));
			sms.setRead(cursor.getInt(cursor.getColumnIndex("read")) == 1);
			sms.setNumber(cursor.getString(cursor.getColumnIndex("address")));
			smses.add(sms);
		}
		if (null != cursor) {
			cursor.close();
		}
		return smses;
	}

	public List<MessageBean> findCallLogBean(ContactBean contact,
			List<CallLogBean> list) {
		List<MessageBean> result = new ArrayList<MessageBean>();
		for (CallLogBean t : list) {
			if (PhoneNumberUtil.isEqualNumber(contact.getPhonenumber(),
					t.getPhoneNumber(), 8)) {
				t.setIncontact(true);
				result.add(new MessageBean(t));

			}
		}
		return result;
	}

	public List<MessageBean> findSMSMessageBean(ContactBean contact,
			List<SMSMessage> list) {
		List<MessageBean> result = new ArrayList<MessageBean>();
		for (SMSMessage t : list) {
			if (PhoneNumberUtil.isEqualNumber(contact.getPhonenumber(),
					t.getNumber(), 8)) {
				t.setIncontact(true);
				result.add(new MessageBean(t));

			}
		}
		return result;
	}

}
