package com.lenovo.linkit.notification;

import java.io.Serializable;

public class NotificationData implements Serializable{
	
	private static final long serialVersionUID = 1L;
	
	public String id;
	public String icon;
	public String type = "sys";
	public String title;
	public String packageName;
	public String appName;
	public long time;
}
