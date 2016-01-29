package com.lenovo.linkit;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;


public class LenovoID {
	
	public static String baseUrl = "http://" + UserSetting.getHttpServerAddress() + "/usr/login";
	
	public static void uploadLoginInfo(String uid , String username, String token){
		List<BasicNameValuePair> params = new LinkedList<BasicNameValuePair>();  
		params.add(new BasicNameValuePair("usr",username));
		params.add(new BasicNameValuePair("token",token));
		params.add(new BasicNameValuePair("uid",uid));
		String param = URLEncodedUtils.format(params, "UTF-8");
		HttpGet getMethod = new HttpGet(baseUrl + "?" + param);
		HttpClient httpClient = new DefaultHttpClient();  
		try {
			HttpResponse response = httpClient.execute(getMethod);
			response.getStatusLine().getStatusCode();
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}catch(Exception e){
			e.printStackTrace();
		}
		
		
		
	}

}
