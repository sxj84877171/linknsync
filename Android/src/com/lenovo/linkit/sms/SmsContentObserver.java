package com.lenovo.linkit.sms;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import android.annotation.TargetApi;
import android.content.ContentResolver;
import android.content.Context;
import android.database.ContentObserver;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.Telephony;

import com.lenovo.linkit.Constants;
import com.lenovo.linkit.calllog.CallLogBean;
import com.lenovo.linkit.contact.ContactDataPacketManager;
import com.lenovo.linkit.contact.ContactObject;
import com.lenovo.linkit.core.Engine;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.util.PhoneNumberUtil;

public class SmsContentObserver extends ContentObserver {
	private final  int   MSG_STATUS_ALL    = 0; 
	private final  int   MSG_STATUS_INBOX  = 1; 
	private final  int   MSG_STATUS_SENT   = 2; 
	private final  int   MSG_STATUS_DRAFT  = 3; 
	private final  int   MSG_STATUS_OUTBOX = 4; 
	private final  int   MSG_STATUS_FAILED = 5; 
	private final  int   MSG_STATUS_QUEUED = 6; 
	
	private static String TAG = "SmsContentObserver";
	private Context mContext;
	private static List<SMSData> mListSms = null;
	private static List<SMSMessage> mListMsg = null;
	private static List<ContactObject> mListContact = null;
	private static int mSmsTotal = 0;
	private int mTotal = 0;
	private final static Object lock = new Object();
	private static boolean mRebuildMsg = false;

	private long mCurTimeMills = 0;
	private int nComparePost = 8;

	public SmsContentObserver(Context context) {
		super(null);

		this.mContext = context;
	}
    // merge sms for transfering
	public List<SMSData> mergeSmsByThread() {
		final List<SMSData> smsThreads = new ArrayList<SMSData>();
		
		try {
			ContactObject cont = new ContactObject(this.mContext);
			mListContact = new ArrayList<ContactObject>();

			List<SMSMessage> smsesTemp = getAllSms();
			
			List<CallLogBean> callList = mergeSmsByThread(smsThreads, cont,
					smsesTemp);
			
			// get contact which message list is empty
			getEmptyContact(cont, smsThreads, callList);
		} catch (Exception e) {
			e.printStackTrace();
		}

		return smsThreads;
	}
    // 
	private List<CallLogBean> mergeSmsByThread(List<SMSData> smsThreads,
			ContactObject cont, List<SMSMessage> smsesTemp) {
		List<ContactObject> list = cont.GetContactList();
		ContactDataPacketManager.getInstance().setContext(mContext);
		List<CallLogBean> callList = ContactDataPacketManager.getInstance()
				.getAllCallLog();			


		SMSData thread = null;
		for(SMSMessage msg: smsesTemp){
			Boolean bSucceed = addMsgToThread(msg, smsThreads);
			if (!bSucceed){
				thread = new SMSData();
				thread.msg = new ArrayList<SMSMessage>();
				setMsgThreadInfo(list, callList, msg, thread, msg.getThread_id());
				thread.msg.add(msg);
				int total = thread.msg.size();
				thread.setTotal(total);
				smsThreads.add(thread);
			}
		}
		return callList;
	}
	// add this message to parent thread session
	private boolean addMsgToThread(SMSMessage msg, List<SMSData> smsThreads){
		boolean bSucceed = false;
		for (SMSData data : smsThreads) {
			if (data.getThread_id() == msg.getThread_id()) {
				if (null != data.getMsg()){
					data.getMsg().add(msg);
				}else{
					data.setMsg(new ArrayList<SMSMessage>());
					data.getMsg().add(msg);
				}
				int total = data.msg.size();
				data.setTotal(total);
				bSucceed = true;
				break;
			}
		
		}
		return bSucceed;
	}
	// set thread session info for web,web need this information to sort and filter 
	private void setMsgThreadInfo(List<ContactObject> list,
			List<CallLogBean> callList, SMSMessage msg, SMSData thread,
			int thread_id) {
		try {
			String number = msg.getNumber();
			if (null != number) {
				thread.setNumber(number);
			}
			
			for (ContactObject contObj : list) {
				if (null != contObj	&& PhoneNumberUtil.isEqualNumber(number, contObj.getPhonenumbers(), nComparePost)) {
					if (null != contObj.getName()) {
						thread.setName(contObj.getName());
					}

					thread.setNumber(PhoneNumberUtil.getNoPrefixNumber(
							contObj.getPhonenumbers(), number,
							nComparePost));

					thread.setIncontact(1);
					contObj.setHasmessage(1);

					mListContact.add(contObj);
					break;
				}
			}
			List<SMSMessage> csl = getCallLogToSMSMessageByPhoneNumber(callList,
					thread.getNumber());
			thread.msg.addAll(csl);


			thread.setIndex(0);
			thread.setThread_id(thread_id);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// get all message, so we input the parameter '0' to get all message.
    private List<SMSMessage> getAllSms(){
		Cursor cursor = getDBCursor(0, null);

		List<SMSMessage> smsesReturn = getSmsByCursor(cursor);
		if (null != cursor) {
			cursor.close();
		}
		mListMsg = new ArrayList<SMSMessage> (smsesReturn);
		return smsesReturn;		
		
    }
    // notify new message has received
	public List<SMSMessage> notifyNewSms(Cursor cursor) {

		List<SMSMessage> smses = new ArrayList<SMSMessage>();
		try {
			smses = getSmsByCursor(cursor);
			mListMsg.addAll(smses);

			if (smses.size() > 0){
				Engine.getEngine().setNewMsg(makeSmsPacket(smses), Constants.COMMAND_SEND_SMS);
				mergeSmsByThread(mListSms, new ContactObject(this.mContext), smses);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return smses;
	}
    // 检查发送的短信是否成功写入短信数据库
	public List<SMSMessage> notifyNewSms(long time, SMSMessage msg) {

		List<SMSMessage> smses = new ArrayList<SMSMessage>();
		try {
			int nTimes = 0;
			final int looptimes = 5;
			final long sleepsecs = 500;
			
			//  循环检查数据库是否有该数据记录
			while (nTimes < looptimes){
				Cursor cursor = getDBCursor(time, msg.getMessage());
				if (null != cursor && cursor.getCount() > 0) {
					cursor.close();
					return smses;
				}
				++nTimes;
				cursor.close();
				Thread.sleep(sleepsecs);
			}
			msg.setTime(String.valueOf(time));
			msg.setStatus(MSG_STATUS_SENT);
			smses.add(msg);
//			mListMsg.addAll(smses);
			if (smses.size() > 0){
				Engine.getEngine().setNewMsg(makeSmsPacket(smses), Constants.COMMAND_SEND_SMS);
//				mergeSmsByThread(mListSms, new ContactObject(this.mContext), smses);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return smses;
	}
	
	// notify update message
	public List<SMSMessage> notifyUpdateSms(Cursor cursor) {

		List<SMSMessage> smses = new ArrayList<SMSMessage>();
		try {
			smses = getSmsByCursor(cursor);


			if (smses.size() > 0){
				Engine.getEngine().setUpdateMsg(makeSmsPacket(smses));
				mRebuildMsg = true;
/*				List<SMSMessage> smsesOld = new ArrayList<SMSMessage>();
				smsesOld = new ArrayList<SMSMessage>(mListMsg.subList(0, smsesOld.size() - smses.size() - 1));
				smsesOld.addAll(smses);
				mListMsg = smsesOld;
				
				// sometimes we need merge sms to thread.
				mListSms.clear();
				mergeSmsByThread(mListSms, new ContactObject(this.mContext), mListMsg);*/
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return smses;
	}
	// notify delete message 
	public List<SMSMessage> notifyDeleteSms() {

		List<SMSMessage> smsesReturn = new ArrayList<SMSMessage>(mListMsg);
		try {
			List<SMSMessage> smsesTemp = new ArrayList<SMSMessage>();
			Cursor cursor = getDBCursor(0, null);
			smsesTemp = getSmsByCursor(cursor);
			if (null != cursor) {
				cursor.close();
			}
			for (SMSMessage msg : smsesTemp) {
				String time = msg.getTime();

				for (SMSMessage paramSms : smsesReturn) {
					if (null != time && time.equals(paramSms.getTime())) {
						smsesReturn.remove(paramSms);
						break;
					}
				}
			}

			if (smsesReturn.size() > 0){
				Engine.getEngine().setDelMsg(makeSmsPacket(smsesReturn));		

				// we need clear mListSms and then rebuild again.
				mRebuildMsg = true;
				mListMsg =  new ArrayList<SMSMessage>(smsesTemp);
				// we need clear mListSms and then rebuild again.
/*				mListSms.clear();
				mListMsg =  new ArrayList<SMSMessage>(smsesTemp);
				mergeSmsByThread(mListSms, new ContactObject(
						SmsContentObserver.this.mContext),
						smsesTemp);*/
			
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return smsesReturn;
	}

	// we need build the sms packet for transfering protocol, it was defined with web team.
	private List<SMSData> makeSmsPacket(List<SMSMessage> lstMsg) {
		List<SMSData> lstData = new ArrayList<SMSData>();
		try {
			for (SMSMessage msg : lstMsg) {
				List<SMSMessage> list = new ArrayList<SMSMessage>();
				if(msg.getStatus() > MSG_STATUS_SENT){
					msg.setStatus(MSG_STATUS_SENT);	
				}
				list.add(msg);
				SMSData data = new SMSData();
				data.setMsg(list);
				data.setNumber(msg.getNumber());
				lstData.add(data);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return lstData;
	}

	// when a message was changed,the database will callback this function,so we need to deal our logic.
	public List<SMSMessage> notifyChangedSms() {

		List<SMSMessage> smses = new ArrayList<SMSMessage>();
		try {
			ContactDataPacketManager.getInstance().setContext(mContext);

			Cursor cursor = getDBCursor(mCurTimeMills, null);
			if (null != cursor) {
				int oldCount = mListMsg.size();
				int curCount = getDBCursor(0, null).getCount();
				final int sub = curCount - oldCount;
				if (sub > 0){
					// new message
					notifyNewSms(cursor);						
				}
				else if (0 == sub){
					// update message
					smses = notifyUpdateSms(cursor);
				}
				else{
					// delete message
					smses = notifyDeleteSms();
				}
			}
			if (null != cursor) {
				cursor.close();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return smses;
	}

	//  get message via cursor
	public List<SMSMessage> getSmsByCursor(Cursor cursor) {

		final List<SMSMessage> smses = new ArrayList<SMSMessage>();
		if (null == cursor) {
			return smses;
		}

		while ((null != cursor) && (cursor.moveToNext())) {
			SMSMessage sms = new SMSMessage();
			sms.setId(cursor.getLong(cursor.getColumnIndex("_ID")));
			sms.setTime(cursor.getString(cursor.getColumnIndex("date")));
			sms.setPerson(cursor.getInt(cursor.getColumnIndex("person")));
			sms.setStatus(cursor.getInt(cursor.getColumnIndex("type")));
			sms.setThread_id(cursor.getInt(cursor.getColumnIndex("thread_id")));
			sms.setNumber(cursor.getString(cursor.getColumnIndex("address")));
			sms.setMessage(cursor.getString(cursor.getColumnIndex("body")));
			sms.setRead(cursor.getInt(cursor.getColumnIndex("read")) == 1);
			
			smses.add(sms);

			mCurTimeMills = System.currentTimeMillis();
		}
		return smses;

	}

	// get database cursor via start date
	private synchronized Cursor getDBCursor(long startDate, String msg) {
		Uri uri = null;
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
			uri = getContentUri();
		} else {
			uri = getContentUriPreKitKat();
		}
		String select = " date >= " + (startDate);
		if (null != msg && !msg.isEmpty()){
			select += " and body = '" + msg +"'";
		}

		final ContentResolver resolver = this.mContext.getContentResolver();

		Cursor cursor = resolver.query(uri, null, select, null, "date DESC");
		return cursor;
	}

	public void getEmptyContact(ContactObject cont, List<SMSData> smsThreads,
			List<CallLogBean> callList) {
		for (ContactObject contObj : cont.GetContactList()) {
			if (null != contObj && 0 == contObj.getHasmessage()) {
				SMSData thread = new SMSData();
				if (null != contObj.getPhonenumbers()) {
					thread.setNumber(contObj.getPhonenumbers());
				}
				if (null != contObj.getName()) {
					thread.setName(contObj.getName());
				}
				thread.setIncontact(1);
				thread.setIndex(0);
				List<SMSMessage> smses = getCallLogListData(callList, contObj);
				thread.setMsg(smses);
				thread.setTotal(smses.size());
				if (smses.size() == 0) {
					thread.setIndex(1);
				}
				smsThreads.add(thread);
				if (smses.size() == 0) {
					++mSmsTotal;
				}

				mListContact.add(contObj);
			}
		}
		for (CallLogBean clb : callList) {
			if (!clb.isIncontact()) {
				ContactObject contObj = new ContactObject(this.mContext);
				contObj.setHasmessage(1);
				contObj.setHasphoto(false);
				contObj.setName(clb.getName());
				contObj.setPhonenumbers(clb.getPhoneNumber());
				SMSData thread = new SMSData();
				if (null != contObj.getPhonenumbers()) {
					thread.setNumber(contObj.getPhonenumbers());
				}
				if (null != contObj.getName()) {
					thread.setName(contObj.getName());
				}
				thread.setIncontact(0);
				thread.setIndex(0);
				List<SMSMessage> smses = getCallLogListData(callList, contObj);
				thread.setMsg(smses);
				thread.setTotal(smses.size());
				if (smses.size() == 0) {
					thread.setIndex(1);
				}
				smsThreads.add(thread);
				if (smses.size() == 0) {
					++mSmsTotal;
				}
				mListContact.add(contObj);
			}
		}

	}

	public List<SMSMessage> getCallLogListData(List<CallLogBean> callList,
			ContactObject contObj) {
		List<SMSMessage> smses = new ArrayList<SMSMessage>();
		for (CallLogBean clb : callList) {
			if (PhoneNumberUtil.isEqualNumber(contObj.getPhonenumbers(),
					clb.getPhoneNumber(), 8)) {
				SMSMessage smsMessage = new SMSMessage();
				smsMessage.setId(Long.parseLong(clb.getId()));
				smsMessage.setStatus(clb.getState());
				smsMessage.setReceiveDate("" + clb.getTime());
				smsMessage.setSendDate("" + clb.getTime());
				smsMessage.setTime("" + clb.getTime());
				clb.setIncontact(true);
				smsMessage.setRead(true);

				int s = (int) clb.getDuration();
				if (s > 0) {
					String mes = "";
					if (s >= 3600) {
						mes += (s / 3600) + "h";
						s -= s / 3600 * 3600;
					}
					if (s >= 60) {
						mes += (s / 60) + "m";
						s -= s / 60 * 60;
					}
					mes += s + "s";
					smsMessage.setMessage(mes);
				} else {
					smsMessage.setMessage("0s");
				}
				smses.add(smsMessage);
			}
		}
		return smses;
	}
	public List<SMSData> GetSmsList() {
		List<SMSData> result = mListSms;
		if (null == mListSms || mRebuildMsg) {
			result = mergeSmsByThread();
			synchronized (lock) {
				mListSms = result;
				mRebuildMsg = false;
			}
		} else {
			for (SMSData data : result) {
				data.setIndex(0);
			}
		}
		return mListSms;
	}
	
	// when a message was changed,the database will callback this function,
	// so we need to deal our logic in this fuction.
	@Override
	public void onChange(boolean selfChange) {
		FLog.w(TAG, "onChange");

		super.onChange(selfChange);

		new Thread() {
			public void run() {
				synchronized (SmsContentObserver.lock) {
					notifyChangedSms();
				}
			}
		}.start();

	}

	@TargetApi(Build.VERSION_CODES.KITKAT)
	private static Uri getContentUri() {
		return Telephony.Sms.CONTENT_URI;
	}

	private static Uri getContentUriPreKitKat() {
		return Uri.parse("content://sms");
	}

	@TargetApi(Build.VERSION_CODES.KITKAT)
	private static Uri getContentInBoxUri() {

		return Telephony.Sms.Inbox.CONTENT_URI;
	}

	private static Uri getContentInBoxUriPreKitKat() {
		return Uri.parse("content://sms/inbox");
	}

	public int getSmsTotal() {
		return mTotal;
	}

	public static List<ContactObject> getSynchronizeContact() {
		synchronized (SmsContentObserver.lock) {
			return mListContact;
		}
	}

	public List<SMSMessage> getCallLogToSMSMessageByPhoneNumber(
			List<CallLogBean> callList, String phoneNumber) {
		List<SMSMessage> result = new ArrayList<SMSMessage>();
		for (CallLogBean clb : callList) {
			if (PhoneNumberUtil.isEqualNumber(phoneNumber,
					clb.getPhoneNumber(), 8)) {
				SMSMessage smsMessage = new SMSMessage();
				smsMessage.setId(Long.parseLong(clb.getId()));
				smsMessage.setStatus(clb.getState());
				smsMessage.setReceiveDate("" + clb.getTime());
				smsMessage.setSendDate("" + clb.getTime());
				smsMessage.setTime("" + clb.getTime());
				clb.setIncontact(true);

				int s = (int) clb.getDuration();
				if (clb.getState() != Constants.MISSED_CALL) {
					if (s > 0) {
						String mes = "";
						if (s >= 3600) {
							mes += (s / 3600) + "h";
							s -= s / 3600 * 3600;
						}
						if (s >= 60) {
							mes += (s / 60) + "m";
							s -= s / 60 * 60;
						}
						mes += s + "s";
						smsMessage.setMessage(mes);
					} else {
						smsMessage.setMessage("0s");
					}
				} else {
					smsMessage.setMessage(" ");
				}

				smsMessage.setRead(true);
				result.add(smsMessage);
			}
		}
		return result;
	}
}
