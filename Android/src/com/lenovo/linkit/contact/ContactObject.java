package com.lenovo.linkit.contact;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;

import com.lenovo.linkit.log.FLog;

public class ContactObject {
	private static final String TAG = "ContactObject";
	private String name;
	private int person;
	private String phonenumbers; // Multiple Numbers use Contants.NUMBER_SPLIT to split
	private int hasmessage;
	private boolean hasphoto;
	private static List<ContactObject> mListContact = null;
	private final Object lock = new Object();
	private Context mContext;

	public String getName() {
		return this.name;
	}

	public void setName(String sName) {
		this.name = sName;
	}

	public String getPhonenumbers() {
		return this.phonenumbers;
	}

	public void setPhonenumbers(String sPhonenumbers) {
		sPhonenumbers = sPhonenumbers.replace(" ", "");
		sPhonenumbers = sPhonenumbers.replace("-", "");
		this.phonenumbers = sPhonenumbers;
	}

	public int getPerson() {
		return this.person;
	}

	public void setPerson(int iPerson) {
		this.person = iPerson;
	}

	public ContactObject(Context context) {
		mContext = context;
	}

	public List<ContactObject> getAll(final Context context) {
		List<ContactObject> contacts = new ArrayList<ContactObject>();
		Uri contactUri = ContactsContract.Contacts.CONTENT_URI;
		ContentResolver resolver = context.getContentResolver();

		Cursor cursor = resolver.query(contactUri, null, null, null, null);

		while (cursor.moveToNext()) {
			String phonenumber = "";

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
					ContactObject contactObj = new ContactObject(mContext);
					contactObj.setPerson(iId);
					contactObj
							.setName(cursor.getString(cursor
									.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME)));
					phonenumber = cursor2
							.getString(cursor2
									.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER));

//					if(!phonenumber.contains("+86")){
//						phonenumber = "86" + phonenumber ;
//					}else if(!phonenumber.startsWith("86")){
//						phonenumber = "86" + phonenumber ;
//					}
					contactObj.setPhonenumbers(phonenumber);
					contactObj.setHasphoto((photoId == 0) ? false : true);
					contacts.add(contactObj);
				}
				cursor2.close();
			}
		}
		cursor.close();
		
		FLog.i(TAG, "All contact count: " + contacts.size());

		return contacts;
	}

	public List<ContactObject> GetContactList() {
		if (null == mListContact) {
			synchronized (this.lock) {
				mListContact = getAll(mContext);
			}
		}

		return mListContact;
	}

	public int getHasmessage() {
		return hasmessage;
	}

	public void setHasmessage(int hasmessage) {
		this.hasmessage = hasmessage;
	}

	public boolean isHasphoto() {
		return hasphoto;
	}

	public void setHasphoto(boolean hasphoto) {
		this.hasphoto = hasphoto;
	}
}
