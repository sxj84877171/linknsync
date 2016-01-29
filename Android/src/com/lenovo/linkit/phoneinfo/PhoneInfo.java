package com.lenovo.linkit.phoneinfo;

public class PhoneInfo {
    private String phoneNumber;
    private long currentTime;
    private String sdkVersion ;
    private String deviceid;
    private String mobileName;
    
    public String getSdkVersion() {
		return this.sdkVersion;
	}

	public void setSdkVersion(String sdkVersion) {
		this.sdkVersion = sdkVersion;
	}

	public String getPhoneNumber() {
        return this.phoneNumber;
    }

    public void setPhoneNumber(String sPhoneNumber) {
    	this.phoneNumber = sPhoneNumber;
    }

    public long getCurrentTime() {
        return this.currentTime;
    }

    public void setCurrentTime(long lCurrentTime) {
    	this.currentTime = lCurrentTime;
    }

	public String getDeviceid() {
		return this.deviceid;
	}

	public void setDeviceid(String deviceid) {
		this.deviceid = deviceid;
	}

	public String getMobileName() {
		return this.mobileName;
	}

	public void setMobileName(String mobileName) {
		this.mobileName = mobileName;
	}

}
