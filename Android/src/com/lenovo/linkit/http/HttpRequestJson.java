package com.lenovo.linkit.http;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.util.EntityUtils;

import com.google.gson.Gson;
import com.lenovo.linkit.http.HttpRequest.ErrorCode;
import com.lenovo.linkit.http.HttpRequest.HttpResponseException;

public class HttpRequestJson<T> {
	
	public static interface IHttpJsonResponser<T> {
		public void onResponseResult(int responseCode, T responseObject);
	}
	
	protected HttpRequest mHttpRequest = new HttpRequest();
	
	protected Thread mThread = null;
	
	protected Class mCls = null;
	
	public HttpRequestJson(Class cls)
	{
		mCls = cls;
	}
	
	public void stop() {
		mHttpRequest.stop();
		if (mThread == null)
			return;

		mThread.interrupt();
		try {
			mThread.join(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
	
	public T fromJson(String json)
	{
		if(json == null || "".equals(json))
			return null;
		
		//Type type = new TypeToken<T>() {}.getType();
		Gson gson = new Gson();
		T obj = (T)gson.fromJson(json, mCls);
		return obj;
	}
	
	public T request(String url, List<NameValuePair> params) throws UnsupportedEncodingException, IOException, ClientProtocolException, HttpResponseException
	{
		String json = mHttpRequest.request(url, params);
		return fromJson(json);
	}
	
	public T request(String url, HttpEntity entity) throws IOException, ClientProtocolException, HttpResponseException
	{
		String json = mHttpRequest.request(url, entity);
		return fromJson(json);
	}
	
	public HttpRequest.ErrorCode requestAsync(String url, List<NameValuePair> params, final IHttpJsonResponser<T> responser) {
		if (params == null || params.isEmpty())
			return ErrorCode.errorInvalidArg;
		
		try {
			return requestAsync(url, new UrlEncodedFormEntity(params), responser);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			return ErrorCode.errorUnsupportedEncodingException;
		}
	}

	public HttpRequest.ErrorCode requestAsync(final String url, final HttpEntity entity, final IHttpJsonResponser<T> responser) {
		if (url == null || url.isEmpty())
			return ErrorCode.errorInvalidArg;

		if (entity == null)
			return ErrorCode.errorInvalidArg;

		if (responser == null)
			return ErrorCode.errorInvalidArg;

		mThread = new Thread(new Runnable() {
			public void run() {
				try {
					HttpResponse httpResponse = mHttpRequest.requestInternal(url, entity);
					int responseCode = httpResponse.getStatusLine().getStatusCode();
					
					if (responseCode == 200) {
						String responseString = EntityUtils.toString(httpResponse.getEntity());
						T obj = fromJson(responseString);
						responser.onResponseResult(responseCode, obj);
					} else {
						responser.onResponseResult(responseCode, null);
					}
					
				} catch (ClientProtocolException e) {
					e.printStackTrace();
					responser.onResponseResult(-1, null);
				} catch (IOException e) {
					e.printStackTrace();
					responser.onResponseResult(-2, null);
				}
			}
		});

		mThread.start();

		return ErrorCode.errorSuccess;
	}
}
