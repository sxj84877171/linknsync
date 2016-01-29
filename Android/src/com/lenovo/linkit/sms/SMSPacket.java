package com.lenovo.linkit.sms;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;

import com.google.gson.Gson;
import com.lenovo.linkit.Constants;
import com.lenovo.linkit.network.INetworkManager;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.util.LZString;

public class SMSPacket extends Packet {
	private static final String TAG = "SMSPacket";

	public List<SMSData> data;
	
	

	// //////////////////////////////////////////////////////////////////////////////////////
	public static SMSPacket fromJson(String jsonStr) {
		Gson gson = new Gson();
		SMSPacket packet = gson.fromJson(jsonStr, SMSPacket.class);
		return packet;
	}

	public String toJson() {
		try {
			Gson gson = new Gson();
			this.cmprs = "1";
			String header = gson.toJson(this);
			JSONObject json = new JSONObject(header);

			String dataStr = gson.toJson(this.data);
			String dataEncoded = LZString.compressToBase64(dataStr);
			// compressed all data
/*    		if (dataEncoded.length() > dataStr.length())
				json.put("cmprs", 0);
			else
				json.put("data", dataEncoded);*/
			json.put("data", dataEncoded);
			String result = json.toString();
			return result;
		} catch (JSONException e) {
			e.printStackTrace();
		}

		return "";
	}

	// //////////////////////////////////////////////////////////////////////////////////////
	public static void getAllSMS(INetworkManager ws, Packet packet, Context context) {
		SMSPacket sms = new SMSPacket();
		sms.id = packet.id;
		sms.type = Constants.WS_COMMAND_TYPE_RESPONSE;
		sms.to = Constants.WS_COMMAND_TARGET;
		sms.token = ws.getQRCode();
		sms.cid = packet.getCid();
		sms.cmd = Constants.COMMAND_GET_ALL_SMS;

		SmsContentObserver obs = new SmsContentObserver(context);
		List<SMSData> smsList = new ArrayList<SMSData>();

		smsList = obs.GetSmsList();
		
			
		//sms.setTotal(String.valueOf(SmsContentObserver.getSmsTotal()));
		int totalSMS = getTotal(smsList);
		sms.setTotal(String.valueOf(totalSMS));

		int size = smsList.size();
		List<SMSData> data = new ArrayList<SMSData>();
		int msgTotalSize = 0;
		int everySend = 25;
		int nCurMsgIndex = 0;
		int nCurThreadIndex = 0;

		for (; nCurThreadIndex < size; ++nCurThreadIndex) {
			// Get every thread id, thread id equals the contact name.
			SMSData dataTemp = new SMSData(smsList.get(nCurThreadIndex));
			if (null == dataTemp.msg) {
				continue;
			}
			if ((null != dataTemp.msg && dataTemp.msg.size() <= 0)) {
				msgTotalSize++;
			}
			nCurMsgIndex = smsList.get(nCurThreadIndex).getIndex();
			List<SMSMessage> msgList = new ArrayList<SMSMessage>();

			// Get every msg to set the SMSData
			for (; nCurMsgIndex < dataTemp.msg.size(); ++nCurMsgIndex) {
				msgList.add((dataTemp.msg.get(nCurMsgIndex)));
				msgTotalSize++;
				if (msgTotalSize >= everySend) {
					break;
				}
			}
			nCurMsgIndex += 1;
			nCurMsgIndex = nCurMsgIndex < dataTemp.getTotal() ? nCurMsgIndex
					: dataTemp.getTotal();
			dataTemp.setIndex(nCurMsgIndex);
			smsList.get(nCurThreadIndex).setIndex(nCurMsgIndex);
			if (nCurMsgIndex < dataTemp.msg.size()) {
				nCurThreadIndex -= 1;
			}

			// Add SMSData to data list.
			dataTemp.setMsg(msgList);
			data.add(dataTemp);

			// Send to other device
			if (msgTotalSize >= everySend || nCurThreadIndex == size - 1) {
				sms.data = data;

				if(nCurThreadIndex + 1 >= size)
					sms.setTotal(String.valueOf(totalSMS));
				
					ws.sendPacket(sms);
				
				sms.index += msgTotalSize;
				data.clear();
				msgTotalSize = 0;
			}
		}

		if (size == 0) {
			sms.setTotal("0");
			ws.sendPacket(sms);
		}
	}
	
	private static int getTotal(List<SMSData> list) {
		int totalSMS = 0;
		for(SMSData data : list) {
			List<SMSMessage> msgList = data.getMsg();
			if(msgList == null) {
				continue;
			}
			
			if (msgList.size() == 0) {
				totalSMS++;
			} else {
				totalSMS += msgList.size();
			}
		}
		
		return totalSMS;
	}

	public static List<String> getKeyTimeList(String message) {
		SMSPacket smsPacket = SMSPacket.fromJson(message);
		List<SMSData> listData = smsPacket.data;
		if (null == listData) {
			return null;
		}
		List<String> lstSmsId = new ArrayList<String>();
		for (SMSData data : listData) {
			if (null != data && null != data.getMsg()) {
				for (SMSMessage msg : data.getMsg()) {
					lstSmsId.add(msg.getTime());
				}
			}
		}
		return lstSmsId;
	}
}
