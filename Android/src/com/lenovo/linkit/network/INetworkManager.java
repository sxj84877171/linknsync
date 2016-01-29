package com.lenovo.linkit.network;

import org.json.JSONObject;

import com.lenovo.linkit.protocol.Packet;

/**
 * Created by daniel on 2015/1/19.
 * interface for manager network data tunnel
 */
public interface INetworkManager{
	
	public void close();
	public void connect();
	public void setQRcode(String qrcode);
	
	public String getQRCode() ;
	
	public void sendHiToServer() ;
	
	public boolean isConnectedServer() ;
	
	public void setPCConnectState(boolean state) ;
	
	public boolean isPCConnectServer() ;
	public void synchronizeCache() ;
	
	public JSONObject sayHiJsonData() ;
	public void sendPacket(Packet packet) ;
	
	public void sendMessageToService(int msgID, String msg) ;
	
	public void sendStatusToFront(String command);
	
	public void sendStatusToFront(int status) ;
	
	public void sendFailureToFront(String command);
}
