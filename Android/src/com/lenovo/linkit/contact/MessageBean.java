package com.lenovo.linkit.contact;

import com.lenovo.linkit.calllog.CallLogBean;
import com.lenovo.linkit.sms.SMSMessage;

public class MessageBean {

	// {"id":"2211","message":"11","person":0,"read":true,"receiveDate":0,"sendDate":0,"status":1,"time":"1415616003491"},

	private String id;

	private String message;

	private String person;

	private boolean read;

	private String receiveDate;

	private String sendDate;

	private String status;

	private String time;
	
	private String number ;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getPerson() {
		return person;
	}

	public void setPerson(String person) {
		this.person = person;
	}

	public boolean isRead() {
		return read;
	}

	public void setRead(boolean read) {
		this.read = read;
	}

	public String getReceiveDate() {
		return receiveDate;
	}

	public void setReceiveDate(String receiveDate) {
		this.receiveDate = receiveDate;
	}

	public String getSendDate() {
		return sendDate;
	}

	public void setSendDate(String sendDate) {
		this.sendDate = sendDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}

	public MessageBean() {

	}

	public MessageBean(SMSMessage sms) {
		this.id = "" + sms.getId();
		this.message = sms.getMessage();
		this.person = "" + sms.getPerson();
		this.read = sms.isRead();
		this.receiveDate = sms.getReceiveDate();
		this.sendDate = sms.getSendDate();
		this.status = "" + sms.getStatus();
		this.time = sms.getTime();
		this.number = sms.getNumber();
	}

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public MessageBean(CallLogBean callLog) {
		this.id = callLog.getId();
		this.message = callLog.getMessage();
		this.time = "" + callLog.getTime();
		this.status = "" + callLog.getState();
		this.read = true;
		this.person = "0";
		this.number = callLog.getPhoneNumber();

	}
}
