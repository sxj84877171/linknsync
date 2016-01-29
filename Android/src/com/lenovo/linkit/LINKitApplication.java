package com.lenovo.linkit;

import java.lang.Thread.UncaughtExceptionHandler;

import android.annotation.SuppressLint;
import android.app.Application;
import android.os.Handler;
import android.os.Message;

import com.lenovo.linkit.log.FLog;

public class LINKitApplication extends Application {

	private boolean isNotificationServiceAlive = false;
	
	private boolean hasLogin = false ;

	public boolean isHasLogin() {
		return hasLogin;
	}

	public void setHasLogin(boolean hasLogin) {
		this.hasLogin = hasLogin;
	}

	public boolean isNotificationServiceAlive() {
		return isNotificationServiceAlive;
	}

	public void setNotificationServiceAlive(boolean isNotificationServiceAlive) {
		this.isNotificationServiceAlive = isNotificationServiceAlive;
	}

	private boolean isShowSetNotification = true;

	public boolean isShowSetNotification() {
		return isShowSetNotification;
	}

	public void setShowSetNotification(boolean isShowSetNotification) {
		this.isShowSetNotification = isShowSetNotification;
	}

	@SuppressLint("HandlerLeak")
	private Handler myHandler = new Handler() {
		@Override
		public void dispatchMessage(Message msg) {
			super.dispatchMessage(msg);
			if (msg != null) {
				String message = (String) msg.obj;
//				Toast.makeText(LINKitApplication.this, message,
//						Toast.LENGTH_LONG).show();
				FLog.e("LINKitApplication", message);
				int pid = android.os.Process.myPid();
				FLog.e("LINKitApplication", "kill pid:" + pid);
				android.os.Process.killProcess(pid);
				
			}
		}

	};

	@Override
	public void onCreate() {
		Thread.setDefaultUncaughtExceptionHandler(new MyUncaughtExceptionHandler());
		super.onCreate();
	}

	@Override
	public void onTerminate() {
		super.onTerminate();
	}

	@Override
	public void onLowMemory() {
		super.onLowMemory();
	}

	class MyUncaughtExceptionHandler implements UncaughtExceptionHandler {

		@Override
		public void uncaughtException(Thread thread, Throwable ex) {
			// FLog.i("LINKitApplication", "Thread Name:" + thread.getName());
			// FLog.i("LINKitApplication", "Thread ID :" + thread.getId());
			// FLog.i("LINKitApplication", "Error Message:" + ex.getMessage());
			// FLog.i("LINKitApplication", "Error message statck trace:"+
			// ex.getStackTrace());
			Message msg = new Message();
			msg.obj = ex.getCause() + "\r\n" + ex.getMessage() + "\r\n"
					+ ex.getStackTrace();
			ex.printStackTrace();
			myHandler.sendMessage(msg);
			
			FLog.e("LINKit", "Application running error , it must be restart it.", ex);
		}

	}
}
