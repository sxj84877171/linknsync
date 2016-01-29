package com.lenovo.linkit.sasl;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

import org.apache.harmony.javax.security.auth.callback.CallbackHandler;
import org.apache.harmony.javax.security.sasl.Sasl;
import org.jivesoftware.smack.SASLAuthentication;
import org.jivesoftware.smack.XMPPException;
import org.jivesoftware.smack.sasl.SASLMechanism;
import org.jivesoftware.smack.util.Base64;

// ported from
// http://code.google.com/p/fbgc/source/browse/trunk/daemon/src/main/java/org/albino/mechanisms/FacebookConnectSASLMechanism.java

public class SASLFacebookMechanism extends SASLMechanism {

	// TODO: line lengths
	// TODO: string format

//	public static String NAME = "X-FACEBOOK-PLATFORM";PLAIN   PLAINSASL
	public static String NAME = "PLAINSASL";

	private String sessionKey = "";
	private String sessionSecret = "";
	// private String apiKey = "";

	private String apiKey = "";
	private String accessToken = "";

	public SASLFacebookMechanism(SASLAuthentication arg0) {
		super(arg0);
	}

	protected void authenticate() throws IOException, XMPPException {
		AuthMechanism packet = new AuthMechanism(NAME, null);
		// Send the authentication to the server
		getSASLAuthentication().send(packet);
	}

	@Override
	public void authenticate(String apiKey, String host, String accessToken)
			throws IOException, XMPPException {
		if (apiKey == null || accessToken == null) {
			throw new IllegalArgumentException("Invalid parameters");
		}
		this.apiKey = apiKey;
		this.accessToken = accessToken;
		this.hostname = host;
		String[] mechanisms = { "DIGEST-MD5" };
		Map<String, String> props = new HashMap<String, String>();
		this.sc = Sasl.createSaslClient(mechanisms, null, "xmpp", host, props,
				this);
		authenticate();
	}

	
	public void authenticate(String username, String host, CallbackHandler cbh)
			throws IOException, XMPPException {
		String[] mechanisms = { "DIGEST-MD5" };
		Map<String, String> props = new HashMap<String, String>();
		sc = Sasl.createSaslClient(mechanisms, null, "xmpp", host, props, cbh);
		authenticate();
	}

	protected String getName() {
		return NAME;
	}

	@Override
	public void challengeReceived(String challenge) throws IOException {
		byte[] response = null;
		if (challenge != null) {
			String decodedChallenge = new String(Base64.decode(challenge));
			Map<String, String> parameters = getQueryMap(decodedChallenge);
			String version = "1.0";
			String nonce = parameters.get("nonce");
			String method = parameters.get("method");
			String composedResponse = "method="
					+ URLEncoder.encode(method, "utf-8") + "&nonce="
					+ URLEncoder.encode(nonce, "utf-8") + "&access_token="
					+ URLEncoder.encode(accessToken, "utf-8") + "&api_key="
					+ URLEncoder.encode(apiKey, "utf-8") + "&call_id=0" + "&v="
					+ URLEncoder.encode(version, "utf-8");
			response = composedResponse.getBytes();
		}
		String authenticationText = "";
		if (response != null) {
			authenticationText = Base64.encodeBytes(response);
		} // Send the authentication to the server
		getSASLAuthentication().send(new Response(authenticationText));
	}

	public void challengeReceived1(String challenge) throws IOException {
		byte response[] = null;
		if (challenge != null) {
			String decodedResponse = new String(Base64.decode(challenge));
			Map<String, String> parameters = getQueryMap(decodedResponse);
			Long callId = new GregorianCalendar().getTimeInMillis() / 1000;

			SortedMap<String, String> params = new TreeMap<String, String>();
			params.put("api_key", apiKey);
			params.put("call_id", callId.toString());
			params.put("method", parameters.get("method"));
			params.put("nonce", parameters.get("nonce"));
			params.put("session_key", sessionKey);
			params.put("v", "1.0");

			StringBuilder sigB = new StringBuilder();
			for (Map.Entry<String, String> entry : params.entrySet()) {
				sigB.append(String.format("%s=%s", entry.getKey(),
						entry.getValue()));
			}
			sigB.append(sessionSecret);

			String sig;
			try {
				sig = MD5(sigB.toString());
			} catch (NoSuchAlgorithmException e) {
				throw new IllegalStateException(e);
			}

			StringBuilder composedResp = new StringBuilder();
			for (Map.Entry<String, String> entry : params.entrySet()) {
				composedResp.append(String.format("%s=%s&", entry.getKey(),
						entry.getValue()));
			}
			composedResp.append("sig=" + sig);

			response = composedResp.toString().getBytes();
		}
		String authenticationText = response == null ? "" : Base64.encodeBytes(
				response, Base64.DONT_BREAK_LINES);
		getSASLAuthentication().send(new Response(authenticationText));
	}

	private Map<String, String> getQueryMap(String query) {
		Map<String, String> map = new HashMap<String, String>();
		String[] params = query.split("\\&");
		for (String param : params) {
			String[] fields = param.split("=", 2);
			map.put(fields[0], (fields.length > 1 ? fields[1] : null));
		}
		return map;
	}

	private Map<String, String> getQueryMap1(String query) {
		String[] params = query.split("&");
		Map<String, String> map = new HashMap<String, String>();
		for (String param : params) {
			String name = param.split("=")[0];
			String value = param.split("=")[1];
			map.put(name, value);
		}
		return map;
	}

	private String convertToHex(byte[] data) {
		StringBuffer buf = new StringBuffer();
		for (int i = 0; i < data.length; i++) {
			int halfbyte = (data[i] >>> 4) & 0x0F;
			int two_halfs = 0;
			do {
				if ((0 <= halfbyte) && (halfbyte <= 9))
					buf.append((char) ('0' + halfbyte));
				else
					buf.append((char) ('a' + (halfbyte - 10)));
				halfbyte = data[i] & 0x0F;
			} while (two_halfs++ < 1);
		}
		return buf.toString();
	}

	private String MD5(String text) throws NoSuchAlgorithmException,
			UnsupportedEncodingException {
		MessageDigest md;
		md = MessageDigest.getInstance("MD5");
		byte[] md5hash = new byte[32];
		md.update(text.getBytes("iso-8859-1"), 0, text.length());
		md5hash = md.digest();
		return convertToHex(md5hash);
	}
}
