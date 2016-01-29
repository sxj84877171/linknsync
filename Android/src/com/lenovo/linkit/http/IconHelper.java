package com.lenovo.linkit.http;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.message.BasicNameValuePair;

import com.lenovo.linkit.http.HttpRequest.HttpResponseException;

public class IconHelper {

	public static String uploadURL = "/notify/upload";
	public static String queryURL = "/notify/query";
	
	public static HttpRequestJson<IconResponser> httpRequest = new HttpRequestJson<IconResponser>(IconResponser.class);
	
	public static String postByStream(String actionUrl, Map<String, String> params, Map<String, InputStream> files) throws IOException {
		final String PREFIX = "--";
		final String BOUNDARY = java.util.UUID.randomUUID().toString();		
		final String LINEND = "\r\n";
		final String MULTIPART_FROM_DATA = "multipart/form-data";
		final String CHARSET = "UTF-8";
		
		URL uri = new URL(actionUrl);
		HttpURLConnection conn = (HttpURLConnection) uri.openConnection();
		conn.setReadTimeout(5 * 1000);
		conn.setUseCaches(false);
		conn.setDoInput(true);			// 允许输入
		conn.setDoOutput(true);			// 允许输出
		conn.setRequestMethod("POST");	// Post方式
		conn.setRequestProperty("connection", "keep-alive");
		conn.setRequestProperty("Charsert", "UTF-8");
		conn.setRequestProperty("Content-Type", MULTIPART_FROM_DATA + ";boundary=" + BOUNDARY);

		// 首先组拼文本类型的参数
		StringBuilder sb = new StringBuilder();
		for (Map.Entry<String, String> entry : params.entrySet()) {
			sb.append(PREFIX);
			sb.append(BOUNDARY);
			sb.append(LINEND);
			sb.append("Content-Disposition: form-data; name=\"" + entry.getKey() + "\"" + LINEND);
			sb.append("Content-Type: text/plain; charset=" + CHARSET + LINEND);
			sb.append("Content-Transfer-Encoding: 8bit" + LINEND);
			sb.append(LINEND);
			sb.append(entry.getValue());
			sb.append(LINEND);
		}

		DataOutputStream outStream = new DataOutputStream(conn.getOutputStream());
		outStream.write(sb.toString().getBytes());

		// 发送文件数据
		if (files != null)
			for (Map.Entry<String, InputStream> file : files.entrySet()) {
				StringBuilder sb1 = new StringBuilder();
				sb1.append(PREFIX);
				sb1.append(BOUNDARY);
				sb1.append(LINEND);
				sb1.append("Content-Disposition: form-data; name=\"file\"; filename=\""	+ file.getKey() + "\"" + LINEND);
				sb1.append("Content-Type: application/octet-stream; charset=" + CHARSET + LINEND);
				sb1.append(LINEND);
				outStream.write(sb1.toString().getBytes());
				InputStream is = file.getValue();
				
				byte[] buffer = new byte[1024];
				int len = 0;
				while ((len = is.read(buffer)) != -1) {
					outStream.write(buffer, 0, len);
				}

				is.close();
				outStream.write(LINEND.getBytes());
			}

		// 请求结束标志
		byte[] end_data = (PREFIX + BOUNDARY + PREFIX + LINEND).getBytes();
		outStream.write(end_data);
		outStream.flush();

		// 得到响应码
		int res = conn.getResponseCode();
		InputStream in = conn.getInputStream();
		InputStreamReader isReader = new InputStreamReader(in);
		BufferedReader bufReader = new BufferedReader(isReader);
		
		String line = "";
		String data = "";
		while(res == 200 && line != null) {
			line = bufReader.readLine();
			if(line == null)
				break;
			
			data += line;
		}
		
		outStream.close();
		conn.disconnect();
		return data;
	}
	
	public String post(String actionUrl, Map<String, String> params, Map<String, File> files) throws IOException {

		HashMap<String, InputStream> fls = new HashMap<String, InputStream>();
		for (Map.Entry<String, File> file : files.entrySet()) {
			InputStream is = new FileInputStream(file.getValue());
			fls.put(file.getKey(), is);
		}
		
		return postByStream(actionUrl, params, fls);
	}
    
	public static IconResponser uploadByStream(final String serverAddr, final String packag, final String version, final String filename, final InputStream strm) {
		
		IconResponser result = new IconResponser();
		
		//new Thread(new Runnable() {
		
		//	public void run() {
				
		HashMap<String, InputStream> fls = new HashMap<String, InputStream>();
		fls.put(filename, strm);
		
		String url = "http://" + serverAddr + uploadURL;
		
		Map<String, String> params = new HashMap<String, String>();
		params.put("package", packag);
		params.put("version", version);
		
		try {
			String data = postByStream(url, params, fls);
			result = new HttpRequestJson<IconResponser>(IconResponser.class).fromJson(data);
			result.error = "";
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		//		}
		//}).start();
		
		return result;
	}
	
	public IconResponser upload(final String serverAddr, final String packag, final String version, final String path) {
		
		IconResponser result = new IconResponser();
		
		try {
			File file = new File(path);
			InputStream is = new FileInputStream(path);
			uploadByStream(serverAddr, packag, version, file.getName(),  is);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		
		return result;
	}
	
	public static IconResponser getIcon(String serverAddr, String packag, String version) {
		
		String url = "http://" + serverAddr + queryURL;
		
		List<NameValuePair> params = new ArrayList<NameValuePair>();
		params.add(new BasicNameValuePair("package", packag));
		params.add(new BasicNameValuePair("version", version));
		
		IconResponser result = new IconResponser();
		
		try {
			result = httpRequest.request(url, params);
		} catch (UnsupportedEncodingException e) {
			result.error = "kUnsupportedEncodingException";
			e.printStackTrace();
		} catch (ClientProtocolException e) {
			result.error = "kClientProtocolException";
			e.printStackTrace();
		} catch (IOException e) {
			result.error = "kIOException";
			e.printStackTrace();
		} catch (HttpResponseException e) {
			result.error = "kHttpResponseException";
			e.printStackTrace();
		}
		
		return result;
	}
	
public HttpRequest.ErrorCode getIconAsync(String serverAddr, String packag, String version, HttpRequestJson.IHttpJsonResponser<IconResponser> responser) {
		
		String url = "http://" + serverAddr + queryURL;
		
		List<NameValuePair> params = new ArrayList<NameValuePair>();
		params.add(new BasicNameValuePair("package", packag));
		params.add(new BasicNameValuePair("version", version));
		
		return httpRequest.requestAsync(url, params, responser);		
	}
}
