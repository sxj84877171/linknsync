package com.lenovo.linkit.protocol;

public class HandShakePkg {
	private String _id;
	private String _rev;
	private String channels;
	private String created_at;
	private String datachannel;
	private String cmdchannel;
	private String status;
	private String pkg;

	public HandShakePkg() {
	}

	public String get_id() {
		return _id;
	}

	public void set_id(String _id) {
		this._id = _id;
	}

	public String get_rev() {
		return _rev;
	}

	public void set_rev(String _rev) {
		this._rev = _rev;
	}

	public String getChannels() {
		return channels;
	}

	public void setChannels(String channels) {
		this.channels = channels;
	}

	public String getCreated_at() {
		return created_at;
	}

	public void setCreated_at(String created_at) {
		this.created_at = created_at;
	}

	public String getDatachannel() {
		return datachannel;
	}

	public void setDatachannel(String datachannel) {
		this.datachannel = datachannel;
	}

	public String getCmdchannel() {
		return cmdchannel;
	}

	public void setCmdchannel(String cmdchannel) {
		this.cmdchannel = cmdchannel;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getPkg() {
		return pkg;
	}

	public void setPkg(String pkg) {
		this.pkg = pkg;
	}
}