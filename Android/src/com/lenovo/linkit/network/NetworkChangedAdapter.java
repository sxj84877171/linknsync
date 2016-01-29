package com.lenovo.linkit.network;


import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

public class NetworkChangedAdapter {
	private final Context _context;
	private INetworkChangedListener _listener;
	private ConnectivityChangeReceiver _receiver;
	public NetworkChangedAdapter(Context context) {
		assert (context != null);
		this._context = context;
	}
	
	public boolean registerReceiver(INetworkChangedListener listener) {
		assert (listener != null);
		
		if (listener == null) return false;
		if (this._listener != null) return false;
		
		this._listener = listener;		
		this._receiver = new ConnectivityChangeReceiver(this._listener);
		IntentFilter filter = new IntentFilter();
        filter.addAction(ConnectivityManager.CONNECTIVITY_ACTION);
        this._context.registerReceiver(this._receiver, filter);
        
        return true;
	}
	
	public void unregisterReceiver() {
		if (this._listener != null) {
			this._context.unregisterReceiver(this._receiver);
			this._listener = null;
			this._receiver = null;
		}
	}
	
	
	private class ConnectivityChangeReceiver extends BroadcastReceiver {
		private final INetworkChangedListener _listener;
		private int _typeConnected = ConnectivityManager.TYPE_MOBILE;
		
		public ConnectivityChangeReceiver(INetworkChangedListener listener) {
			this._listener = listener;
		}
		
		@Override
		public void onReceive(Context context, Intent intent) {
			String action = intent.getAction();
			if (!action.equals(ConnectivityManager.CONNECTIVITY_ACTION)) return;

			ConnectivityManager connectivityManager = (ConnectivityManager)context.getSystemService(Context.CONNECTIVITY_SERVICE);
			if (connectivityManager == null) {
				this._typeConnected = ConnectivityManager.TYPE_MOBILE;
				this._listener.onError(0);
				this._listener.onConnect(0);
				return;
			}
			
			boolean noConnectivity = intent.getBooleanExtra(ConnectivityManager.EXTRA_NO_CONNECTIVITY, false);
			if (noConnectivity) {
				this._typeConnected = ConnectivityManager.TYPE_MOBILE;
				this._listener.onDisconnect();
				return;
			}
			
			NetworkInfo info = connectivityManager.getActiveNetworkInfo();
			if (info == null) {
				this._typeConnected = ConnectivityManager.TYPE_MOBILE;
				this._listener.onError(1);
				return;
			}

			if (!info.isConnected())
				return;
			
			int type = info.getType();
			if ((type != ConnectivityManager.TYPE_WIFI) && (type != ConnectivityManager.TYPE_ETHERNET))
				return;
			
			if (type != this._typeConnected) {
				this._typeConnected = type;
				this._listener.onConnect(type);
			}
		}
		
	}
}
