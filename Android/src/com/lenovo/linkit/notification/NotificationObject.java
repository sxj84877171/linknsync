package com.lenovo.linkit.notification;


public class NotificationObject extends NotificationData {

	private static final long serialVersionUID = 1L;
	
	//private String id;
	//private String icon;
	//private String type = "sys";
	//private String title;
	//private String packageName;
	//private long time;
	
	private int notificationID;
	private String desc;
	private int iconId;
	private String tag;

	public long getTime() {
		return this.time;
	}

	public void setTime(final long postTime) {
		this.time = postTime;
	}

	public String getPackageName() {
		return this.packageName;
	}

	public void setPackageName(final String packageName) {
		this.packageName = packageName;
	}

	public String getTitle() {
		return this.title;
	}

	public void setTitle(final String title) {
		this.title = title;
	}

	public String getDesc() {
		return this.desc;
	}

	public void setDesc(final String text) {
		this.desc = text;
	}

	public int getIconId() {
		return this.iconId;
	}

	public void setIconId(final int id) {
		this.iconId = id;
	}

	public String getIcon() {
		return this.icon;
	}

	public void setIcon(final String icon) {
		this.icon = icon;
	}

	public String getTag() {
		return tag;
	}

	public void setTag(String tag) {
		this.tag = tag;
	}

	public String setId(String id) {
		return this.id = id;
	}

	public String getId() {
		return this.id;
	}

	public int getNotificationID() {
		return this.notificationID;
	}

	public void setNotificationID(int mNotificationID) {
		this.notificationID = mNotificationID;
	}

	public void createId() {
		this.id = "" + notificationID;

		if (packageName != null) {
			this.id += packageName.hashCode();
		} else {
			this.id += "com.lenovo.linkit".hashCode();
		}

		if (tag != null) {
			this.id += tag.hashCode();
		} else {
			this.id += "0".hashCode();
		}
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
}
