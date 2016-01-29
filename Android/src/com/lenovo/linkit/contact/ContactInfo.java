package com.lenovo.linkit.contact;

public class ContactInfo {
	String number;
	String avatar;
	
	public ContactInfo() {
		
	}
	
	public ContactInfo(String number, String avatar) {
		this.number = number;
		this.avatar = avatar;
	}

	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	public String getAvatar() {
		return avatar;
	}

	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

}
