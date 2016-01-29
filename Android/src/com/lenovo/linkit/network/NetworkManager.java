package com.lenovo.linkit.network;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.NetworkInfo.State;

import com.lenovo.linkit.log.FLog;

public class NetworkManager {

	public static final int NO_CONNECTED = 0;
	public static final int GPRS_CONNECTED = 1;
	public static final int WIFI_CONNECTED = 2;

	private boolean isWork = false;
	private int connectState = NO_CONNECTED; 
	private ConnectivityChangeReceiver ccr = null;
	private NetworkChangerListener changerListener = null ;

	private NetworkManager() {

	}

	private static NetworkManager instance = new NetworkManager();

	public static NetworkManager getInstance() {
		return instance;
	}

	private Context service;

	public void setContext(Context context) {
		this.service = context;
	}

	public void start() {
		isWork = true;
		if (ccr == null) {
			FLog.i("NetworkManager", "NetworkManager is start working...");
			ccr = new ConnectivityChangeReceiver();
			IntentFilter filter = new IntentFilter();
			filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION);
			if (service != null) {
				service.registerReceiver(ccr, filter);
			}
		}
		connectState = getConnectedState();
	}

	public void stop() {
		isWork = false;
		if (ccr != null) {
			FLog.i("NetworkManager", "NetworkManager is stop work");
			service.unregisterReceiver(ccr);
			ccr = null;
		}
	}

	public int getState() {
		return connectState;
	}

	public boolean isWork() {
		return isWork;
	}
	
	public void registerNetworkChangeListener(NetworkChangerListener changerListener){
		this.changerListener = changerListener ;
	}
	
	public void unregisterNetworkChangeListener(){
		changerListener = null ;
	}

	private class ConnectivityChangeReceiver extends BroadcastReceiver {

		@Override
		public void onReceive(Context context, Intent intent) {

			connectState = getConnectedState();
			if(changerListener != null){
				changerListener.onChange(connectState);
			}
			FLog.i("NetworkManager",
					"NetworkManager receiver network is change." + connectState);
		}

	}

	private int getConnectedState() {
		ConnectivityManager connManager = (ConnectivityManager) service
				.getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo networkInfo = connManager.getActiveNetworkInfo();
		int s = NO_CONNECTED;
		if (networkInfo != null) {
			boolean available = networkInfo.isAvailable();
			if (available) {
				State state = connManager.getNetworkInfo(
						ConnectivityManager.TYPE_WIFI).getState();
				if (State.CONNECTED == state) {
					s = WIFI_CONNECTED;
				} else {
					s = GPRS_CONNECTED;
				}
			} else {
				s = NO_CONNECTED;
			}
		}
		return s;
	}
	
	public static interface NetworkChangerListener{
		public void onChange(int state);
	}
}
