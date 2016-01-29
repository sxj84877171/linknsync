package com.lenovo.linkit.http;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;


public class HttpRequest {

	public class HttpResponseException extends Exception
	{
		private static final long serialVersionUID = 1L;
		
		public int responseCode;
		
		public HttpResponseException(int code) {
			this.responseCode = code;
		}
	}
	
	public interface IHttpResponser {
		public void onResponseResult(int responseCode, String responseString);
	}

	public enum ErrorCode {
		errorSuccess,
		errorInvalidArg,
		errorUnsupportedEncodingException,
		errorClientProtocolException,
		errorIOException,
	}

	protected Thread mThread = null;

	public void stop() {
		if (mThread == null)
			return;

		mThread.interrupt();
		try {
			mThread.join(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

	// request sync
	public String request(String url, List<NameValuePair> params) throws UnsupportedEncodingException, IOException, ClientProtocolException, HttpResponseException
	{
		if (url == null || url.isEmpty())
			return null;
		
		if (params == null || params.isEmpty())
			return null;
		
		return request(url, new UrlEncodedFormEntity(params));
	}
	
	// request sync
	public String request(String url, HttpEntity entity) throws IOException, ClientProtocolException, HttpResponseException
	{
		if(entity == null)
			return null;
		
		HttpResponse httpResponse = requestInternal(url, entity);
		int responseCode = httpResponse.getStatusLine().getStatusCode();
		
		if (responseCode == 200) {
			String responseString = EntityUtils.toString(httpResponse.getEntity());
			return responseString;
		}
		
		throw new HttpResponseException(responseCode);
	}
	
	// request async
	public ErrorCode requestAsync(String url, List<NameValuePair> params, final IHttpResponser responser) {
		if (params == null || params.isEmpty())
			return ErrorCode.errorInvalidArg;
				
		try {
			return requestAsync(url, new UrlEncodedFormEntity(params), responser);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			return ErrorCode.errorUnsupportedEncodingException;
		}
	}
	
	// request async
	public ErrorCode requestAsync(final String url, final HttpEntity entity, final IHttpResponser responser) {
		if (url == null || url.isEmpty())
			return ErrorCode.errorInvalidArg;

		if (entity == null)
			return ErrorCode.errorInvalidArg;

		if (responser == null)
			return ErrorCode.errorInvalidArg;

		stop();
		
		mThread = new Thread(new Runnable() {
			public void run() {
				try {
					HttpResponse httpResponse = requestInternal(url, entity);
					int responseCode = httpResponse.getStatusLine().getStatusCode();
					
					if (responseCode == 200) {
						String responseString = EntityUtils.toString(httpResponse.getEntity());
						responser.onResponseResult(responseCode, responseString);
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
	
	public HttpResponse requestInternal(String url, HttpEntity entity) throws IOException, ClientProtocolException
	{
		HttpPost httpPost = new HttpPost(url);
		httpPost.setEntity(entity);

		HttpClient httpClient = new DefaultHttpClient();
		HttpResponse httpResponse = httpClient.execute(httpPost);
		return httpResponse;
	}
}
