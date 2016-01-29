package com.lenovo.linkit.protocol;

import com.google.gson.Gson;
import com.lenovo.linkit.Constants;

public class Packet {
		
	public String v = Constants.WS_COMMAND_VERSION;
	public String type;
	public String id;
	public String cid;
	public String to;
	public String token;
	public String cmd;
	public String err;
	public String desc;
	public String total;
	public String cmprs;
	public int index;

	public int getIndex() {
		return index;
	}

	public void setIndex(int index) {
		this.index = index;
	}

	////////////////////////////////////////////////////////////////////////////////////////
	public static Packet parse(String jsonStr) {
		Gson gson = new Gson();
		Packet packet = gson.fromJson(jsonStr, Packet.class);
		return packet;
	}
	
	public String toJson() {
		Gson gson = new Gson();
		return gson.toJson(this);
	}

	////////////////////////////////////////////////////////////////////////////////////////
	public boolean isCmd(String cmd) {
		if(cmd == null)
			return false;
		
		return cmd.equals(this.cmd);
	}
	
	////////////////////////////////////////////////////////////////////////////////////////
	public String getVersion() {
		return v;
	}

	public void setVersion(String v) {
		if("".equals(v))
			this.v = null;
		else
			this.v = v;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		if("".equals(type))
			this.type = null;
		else
			this.type = type;
	}

	public int getIntegerID() {
		try {
			return Integer.parseInt(this.id);
		} catch (Exception e) {			
		}
		
		return 0;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		if("".equals(id))
			this.id = null;
		else
			this.id = id;
	}

	public String getTo() {
		return to;
	}

	public void setTo(String to) {
		if("".equals(to))
			this.to = null;
		else
			this.to = to;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		if("".equals(token))
			this.token = null;
		else
			this.token = token;
	}

	public String getCmd() {
		return cmd;
	}

	public void setCmd(String cmd) {
		if("".equals(cmd))
			this.cmd = null;
		else
			this.cmd = cmd;
	}

	public String getErr() {
		return err;
	}

	public void setErr(String err) {
		if("".equals(err))
			this.err = null;
		else
		this.err = err;
	}

	public String getDesc() {
		return desc;
	}

	public void setDesc(String desc) {
		if("".equals(desc))
			this.desc = null;
		else
			this.desc = desc;
	}

	public String getTotal() {
		return total;
	}

	public void setTotal(String total) {
		if("".equals(total))
			this.total = null;
		else
			this.total = total;
	}

	public String getCompressed() {
		return cmprs;
	}

	public void setCompressed(String cmprs) {
		if("".equals(cmprs))
			this.cmprs = null;
		else
			this.cmprs = cmprs;
	}

	public String getCid() {
		return cid;
	}

	public void setCid(String cid) {
		this.cid = cid;
	}	
	
	
	
}


