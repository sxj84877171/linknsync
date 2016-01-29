package com.lenovo.linkit.network;

public interface INetworkChangedListener {
	public void onDisconnect();

	public void onConnect(int type);

	public void onError(int code);
}
