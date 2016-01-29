package com.lenovo.linkit.calllog;

public class CallLogBean {
	
	public boolean isIncontact() {
		return incontact;
	}

	public void setIncontact(boolean incontact) {
		this.incontact = incontact;
	}

	private String id ;
	
	private String name ;
	
	private String phoneNumber ;
	
	private long time ;
	
	private long duration;
	
	private boolean incontact = false;
	
	/**
	 * in_call
	 * out_call
	 * missed_call
	 */
	private int state ;
	
	private String message ;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public long getTime() {
		return time;
	}

	public void setTime(long time) {
		this.time = time;
	}

	public long getDuration() {
		return duration;
	}

	public void setDuration(long duration) {
		this.duration = duration;
	}

	public int getState() {
		return state;
	}

	public void setState(int state) {
		this.state = state;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

}
