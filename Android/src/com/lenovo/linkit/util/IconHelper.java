package com.lenovo.linkit.util;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
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

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.CoreConnectionPNames;
import org.apache.http.params.HttpParams;
import org.apache.http.util.EntityUtils;
import org.json.JSONException;
import org.json.JSONObject;

import com.lenovo.linkit.UserSetting;

public class IconHelper {

	public static String uploadURL = "/notify/upload";
	public static String queryURL = "/notify/query";
	
	public static String post(String actionUrl, Map<String, String> params, Map<String, File> files) throws IOException {

		String BOUNDARY = java.util.UUID.randomUUID().toString();
		String PREFIX = "--", LINEND = "\r\n";
		String MULTIPART_FROM_DATA = "multipart/form-data";
		String CHARSET = "UTF-8";
		URL uri = new URL(actionUrl);
		HttpURLConnection conn = (HttpURLConnection) uri.openConnection();
		conn.setReadTimeout(5 * 1000);
		conn.setDoInput(true);// 允许输入
		conn.setDoOutput(true);// 允许输出
		conn.setUseCaches(false);
		conn.setRequestMethod("POST"); // Post方式
		conn.setRequestProperty("connection", "keep-alive");
		conn.setRequestProperty("Charsert", "UTF-8");
		conn.setRequestProperty("Content-Type", MULTIPART_FROM_DATA
				+ ";boundary=" + BOUNDARY);

		// 首先组拼文本类型的参数
		StringBuilder sb = new StringBuilder();
		for (Map.Entry<String, String> entry : params.entrySet()) {
			sb.append(PREFIX);
			sb.append(BOUNDARY);
			sb.append(LINEND);
			sb.append("Content-Disposition: form-data; name=\""
					+ entry.getKey() + "\"" + LINEND);
			sb.append("Content-Type: text/plain; charset=" + CHARSET + LINEND);
			sb.append("Content-Transfer-Encoding: 8bit" + LINEND);
			sb.append(LINEND);
			sb.append(entry.getValue());
			sb.append(LINEND);
		}

		DataOutputStream outStream = new DataOutputStream(
				conn.getOutputStream());
		outStream.write(sb.toString().getBytes());

		// 发送文件数据
		if (files != null)
			for (Map.Entry<String, File> file : files.entrySet()) {
				StringBuilder sb1 = new StringBuilder();
				sb1.append(PREFIX);
				sb1.append(BOUNDARY);
				sb1.append(LINEND);
				sb1.append("Content-Disposition: form-data; name=\"file\"; filename=\""
						+ file.getKey() + "\"" + LINEND);
				sb1.append("Content-Type: application/octet-stream; charset="
						+ CHARSET + LINEND);
				sb1.append(LINEND);
				outStream.write(sb1.toString().getBytes());
				InputStream is = new FileInputStream(file.getValue());
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
		String line = null;
		String data = "OK";

		while ((line = bufReader.readLine()) == null)
			data += line;

		if (res == 200) {
			int ch;
			StringBuilder sb2 = new StringBuilder();
			while ((ch = in.read()) != -1) {
				sb2.append((char) ch);
			}
		}
		outStream.close();
		conn.disconnect();
		return in.toString();
	}
    
	public String upload(String packag, String version, String path) {
		
		String url = "http://" + UserSetting.getHttpServerAddress() + uploadURL;
		//String url = "http://192.168.9.5" + uploadURL;
		
		Map<String, String> params = new HashMap<String, String>();
		params.put("package", packag);
		params.put("version", version);
		
		File file = new File(path);
		Map<String, File> files = new HashMap<String, File>();
		files.put(file.getName(), file);
		
		try {
			return post(url, params, files);
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		return null;
	}
	
	public String get(final String packag, final String version) {
		//new Thread(new Runnable() {
			
		//	public void run() {
				String url = "http://" + UserSetting.getHttpServerAddress() + queryURL;
				//String url = "http://192.168.9.5" + queryURL;
				
				HttpParams httpParams = new BasicHttpParams();
				httpParams.setParameter(CoreConnectionPNames.CONNECTION_TIMEOUT, 10000);
				httpParams.setParameter(CoreConnectionPNames.SO_TIMEOUT, 35000);
				HttpClient client = new DefaultHttpClient(httpParams);
				
				HttpPost mHttpPost = new HttpPost(url);		
				
				List<NameValuePair> nameValuePair = new ArrayList<NameValuePair>();
				nameValuePair.add(new BasicNameValuePair("package", packag));
				nameValuePair.add(new BasicNameValuePair("version", version));
				
				try {
					mHttpPost.setEntity(new UrlEncodedFormEntity(nameValuePair));
	
					HttpResponse responseStr = client.execute(mHttpPost);
					int code = responseStr.getStatusLine().getStatusCode();  
					if (code == 200) {
						// 得到应答的字符串，这也是一个 JSON 格式保存的数据
						String retSrc = EntityUtils.toString(responseStr.getEntity());
						JSONObject result = new JSONObject( retSrc);
						String error = null;
						if (result.has("error"))
							result.getString("error");
						
						String uri = null;
						if (result.has("url"))
							result.getString("url");
						
						if(uri == null || uri.isEmpty())
							return null;
						
						return uri;
					}  
				} catch (UnsupportedEncodingException e) {
					e.printStackTrace();
				} catch (ClientProtocolException e) {
					e.printStackTrace();
				} catch (IOException e) {
					e.printStackTrace();
				} catch (JSONException e) {
					e.printStackTrace();
				}
		//	}
	//	}).start();
		
		return null;
	}
}
