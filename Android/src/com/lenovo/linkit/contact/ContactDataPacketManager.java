package com.lenovo.linkit.contact;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.CallLog;

import com.lenovo.linkit.Constants;
import com.lenovo.linkit.calllog.CallLogBean;

public class ContactDataPacketManager {

	public final static String TAG = "ContactDataPacketManager";

	private Context context = null;

	


	private static ContactDataPacketManager instance;

	public static ContactDataPacketManager getInstance() {
		if (instance == null) {
			instance = new ContactDataPacketManager();
		}
		return instance;
	}

	public Context getContext() {
		return context;
	}

	public void setContext(Context context) {
		this.context = context;
	}

	

	public List<CallLogBean> getAllCallLog() {

		List<CallLogBean> list = new ArrayList<CallLogBean>();
		Uri uri = android.provider.CallLog.Calls.CONTENT_URI;
		// 查询的列
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

}
