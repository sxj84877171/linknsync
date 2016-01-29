package com.lenovo.linkit.network;

import android.os.Bundle;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;

import com.lenovo.linkit.StateManager.State;

public class MessengerUtil {
	private static Messenger mMessenger = null;

	public static void setMessenger(Messenger messenger) {
		mMessenger = messenger;
	}

	public static void sendMsg2Client(String sKey, String sObjParam, int iMsg) {
		Bundle extras = new Bundle();
		extras.putString(sKey, sObjParam);
		sendMsg2Client(iMsg, 0, 0, extras);
	}

	public static void sendMsg2Client(int iMsg, int arg1, int arg2,
			Bundle extras) {
		if (mMessenger == null) {
			return;
		}

		try {
			Message msgBack = Message.obtain(null, iMsg);

			if (msgBack != null) {
				msgBack.arg1 = arg1;
				msgBack.arg2 = arg2;
				msgBack.setData(extras);
				mMessenger.send(msgBack);
			}
		} catch (RemoteException e) {
			e.printStackTrace();
		}
	}

	public static void sendMsg2Client(Messenger messenger, String sKey,
			String sObjParam, int iMsg) {
		if (messenger == null) {
			return;
		}

		try {
			Bundle b = new Bundle();

			if (null != sKey) {
				b.putString(sKey, sObjParam);
			}

			Message msgBack = Message.obtain(null, iMsg);

			if (msgBack != null) {
				msgBack.setData(b);
				messenger.send(msgBack);
			}
		} catch (RemoteException e) {
			e.printStackTrace();
		}
	}

	public static void sendMsg2Client(int msgID, int arg) {
		sendMsg2Client(msgID, arg, 0);
	}

	public static void sendMsg2Client(int msgID, Bundle extras) {
		sendMsg2Client(msgID, 0, 0, extras);
	}

	public static void sendMsg2Client(int msgID, int arg1, int arg2) {
		sendMsg2Client(msgID, arg1, arg2, null);
	}

	
}
