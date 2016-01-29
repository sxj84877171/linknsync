package com.lenovo.linkit.sms;

import java.util.List;

public class SMSData {

	public int index;
	public int total;
	public String name;
	public String number;
	public int thread_id;
	public int incontact;
	
	public String sendstatus;

	public int getIncontact() {
		return incontact;
	}

	public void setIncontact(int incontact) {
		this.incontact = incontact;
	}

	public int getThread_id() {
		return thread_id;
	}

	public SMSData(SMSData tmp) {
		this.index = tmp.index;
		this.thread_id = tmp.thread_id;
		this.total = tmp.total;
		this.name = tmp.name;
		this.number = tmp.number;
		this.msg = tmp.msg;
		this.incontact = tmp.incontact;
	}

	public SMSData() {
	}

	public void setThread_id(int thread_id) {
		this.thread_id = thread_id;
	}

	public List<SMSMessage> msg;

	public int getIndex() {
		return index;
	}

	public void setIndex(int index) {
		this.index = index;
	}

	public int getTotal() {
		return total;
	}

	public void setTotal(int total) {
		this.total = total;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public List<SMSMessage> getMsg() {
		return msg;
	}

	public void setMsg(List<SMSMessage> msg) {
		this.msg = msg;
	}
}
