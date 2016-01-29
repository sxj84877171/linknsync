package com.lenovo.linkit.notification;

import java.io.Serializable;
import java.util.List;

public class NotificationObjectList implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private NotificationObject[] notificationObject ;

	public NotificationObject[] getNotificationObject() {
		return notificationObject;
	}

	public void setNotificationObject(NotificationObject[] notificationObject) {
		this.notificationObject = notificationObject;
	}
	
	public void setNotificationObject(List<NotificationObject> list) {
		if(list != null){
			this.notificationObject = new NotificationObject[list.size()];
			for(int i = 0 ; i < list.size() ; i++){
				notificationObject[i] = list.get(i);
			}
		}
	}


}
