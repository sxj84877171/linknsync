package com.lenovo.linkit.contact;

import java.util.List;

public class ContactBean {

	public boolean isIncontact() {
		return incontact;
	}

	public void setIncontact(boolean incontact) {
		this.incontact = incontact;
	}

	private int personID;

	private String name;

	private String phonenumber;

	private boolean hasPhoto;

	private List<MessageBean> data;

	private boolean incontact;

	public List<MessageBean> getData() {
		return data;
	}

	public void setData(List<MessageBean> data) {
		this.data = data;
	}

	public int getPersonID() {
		return personID;
	}

	public void setPersonID(int personID) {
		this.personID = personID;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPhonenumber() {
		return phonenumber;
	}

	public void setPhonenumber(String phonenumber) {
		this.phonenumber = phonenumber;
	}

	public int getHasmessage() {
		int result = 0;
		if (data != null) {
			result = data.size();
		}
		return result;
	}

	public boolean isHasPhoto() {
		return hasPhoto;
	}

	public void setHasPhoto(boolean hasPhoto) {
		this.hasPhoto = hasPhoto;
	}

}
