package com.lenovo.linkit.network;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.channels.NotYetConnectedException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicHeader;
import org.apache.http.params.BasicHttpParams;
import org.apache.http.params.HttpConnectionParams;
import org.apache.http.params.HttpParams;
import org.apache.http.protocol.HTTP;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

import android.content.Context;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Handler;
import android.os.Message;
import android.telephony.TelephonyManager;
import android.widget.Toast;

import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.Database;
import com.couchbase.lite.Document;
import com.couchbase.lite.Emitter;
import com.couchbase.lite.LiveQuery;
import com.couchbase.lite.Manager;
import com.couchbase.lite.Mapper;
import com.couchbase.lite.QueryRow;
import com.couchbase.lite.SavedRevision;
import com.couchbase.lite.android.AndroidContext;
import com.couchbase.lite.replicator.Replication;
import com.couchbase.lite.util.Log;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;
import com.lenovo.linkit.Constants;
import com.lenovo.linkit.UserSetting;
import com.lenovo.linkit.core.Engine;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.protocol.HandShakePkg;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.protocol.PairPacket;
import com.lenovo.linkit.sms.SMSPacket;

/**
 * Created by daniel on 2015/1/19.
 */
public class CBRestManager implements INetworkManager,
		Replication.ChangeListener {

	private static final String TAG = "CBRestManager";
	private Context mContext;
	private Handler mServiceHandler = null;
	private String mQRcode = "";

	private boolean mConnectServer = false;
	private boolean mPCConnect = false;
	private SynchronizeCache mCache = null;
	private static URI mSyncUri = null;
	public List<String> mChannels = new ArrayList<String>();

	// CBL constants
	public static final String CBL_DATABASE_NAME = "phone_local_db";
	public static final String CBL_DESIGN_DOC_NAME = "phone_local_doc";
	public static final String CBL_BY_DATE_VIEW_NAME = "byDate";
	public static final String CBL_KEY_ID = "_id";
	public static final String CBL_KEY_DOC = "linkit";
	public static final String CBL_KEY_PKG = "pkg";// include all package
	public static final String CBL_KEY_STATUS = "status";// include all package
	public static final String CBL_KEY_QR = "qrcodechannel";// include all
															// package
	public static final String CBL_KEY_DATA_CHANNEL = "datachannel";
	public static final String CBL_KEY_CMD_CHANNEL = "cmdchannel";
	public static final String CBL_KEY_DOC_TYPE = "doctype";
	public static final String CBL_KEY_CREATE = "created_at";

	private long mCmdSeq = 0;
	private static List<String> mDocsHistory = new ArrayList<String>();
	private boolean mReconnect = false;
	public static final String CBL_KEY_CHANNELS = "channels";// No need change

	private String mDataChannelId = "";
	private String mCmdChannelId = "";
	private String mHandShakeDocId = "";
	private String mCmdDocId = "";
	private List<String> mListDocIds = new ArrayList<String>();
	private Thread shakeThread ; 
	// CBL
	protected static Manager manager;
	private Database database;
	private LiveQuery liveQuery;

	public CBRestManager(Context context, URI svrUri, Handler handler) {

		mSyncUri = svrUri;
		mContext = context;
		mServiceHandler = handler;
		mCache = SynchronizeCache.getInstance();
	}

	protected void startCBLite() throws Exception {

		Manager.enableLogging(TAG, Log.VERBOSE);
		Manager.enableLogging(Log.TAG, Log.VERBOSE);
		Manager.enableLogging(Log.TAG_SYNC_ASYNC_TASK, Log.VERBOSE);
		Manager.enableLogging(Log.TAG_SYNC, Log.VERBOSE);
		Manager.enableLogging(Log.TAG_QUERY, Log.VERBOSE);
		Manager.enableLogging(Log.TAG_VIEW, Log.VERBOSE);
		Manager.enableLogging(Log.TAG_DATABASE, Log.VERBOSE);

		manager = new Manager(new AndroidContext(mContext),
				Manager.DEFAULT_OPTIONS);

		database = manager.getDatabase(CBL_DATABASE_NAME);

		// we need to delete database when pair with web.
		// clearAllDocs();

		com.couchbase.lite.View viewItemsByDate = database.getView(String
				.format("%s/%s", CBL_DESIGN_DOC_NAME, CBL_BY_DATE_VIEW_NAME));
		viewItemsByDate.setMap(new Mapper() {
			@Override
			public void map(Map<String, Object> document, Emitter emitter) {
				Object createdAt = document.get(CBL_KEY_CREATE);
				if (createdAt != null) {
					emitter.emit(createdAt.toString(), null);
				}
			}
		}, "1.0");

		startLiveQuery(viewItemsByDate);

		startSync();

		// create handshake document for web using it to get the data channel
		createHandshakeRest();
	}

	public void clearAllDocs() {

		List<String> list;
		try {
			Gson gson = new Gson();
			String ids = UserSetting.getDocumentIds(mContext);
			if (ids.isEmpty()) {
				return;
			}
			list = gson.fromJson(ids, new TypeToken<List<String>>() {
			}.getType());
			for (String id : list)
				try {
					Document doc = database.getDocument(id);
					doc.delete();

				} catch (CouchbaseLiteException e) {
					e.printStackTrace();
				} catch (Exception e) {
					e.printStackTrace();
				}
		} catch (JsonSyntaxException e1) {
			e1.printStackTrace();
		}
	}

	public void close() {
		FLog.i(TAG, "Web socket closed!");

		sendMessageToService(Constants.HANDLER_WS_DISCONNECTED, null);

		mPCConnect = false;
		mConnectServer = false;
		if (manager != null) {
			manager.close();
		}
	}

	private void startSync() {

		try {
			Replication pullReplication = database
					.createPullReplication(mSyncUri.toURL());
			pullReplication.setChannels(mChannels);
			pullReplication.setContinuous(true);

			Replication pushReplication = database
					.createPushReplication(mSyncUri.toURL());
			pushReplication.setChannels(mChannels);
			pushReplication.setContinuous(true);

			pullReplication.start();
			pushReplication.start();

			pullReplication.addChangeListener(this);
			pushReplication.addChangeListener(this);

		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	private void startLiveQuery(com.couchbase.lite.View view) throws Exception {
		if (liveQuery == null) {
			FLog.i(TAG, "startLiveQuery addChangeListener");
			liveQuery = view.createQuery().toLiveQuery();
			liveQuery.setDescending(true);
			liveQuery.setIncludeDeleted(false);

			liveQuery.addChangeListener(new LiveQuery.ChangeListener() {
				public void changed(final LiveQuery.ChangeEvent event) {
					new Thread(new Runnable() {
						public void run() {
							for (Iterator<QueryRow> it = event.getRows(); it
									.hasNext();) {
								QueryRow row = it.next();
								if (null != row) {
									Document doc = row.getDocument();

									try {
										// 处理其他设备发来的命令
										if (!isAnalyzedDoc(doc)) {
											processCmdDoc(doc);
										}

										// 处理其他设备刷新命令
										// processRefresh(doc);
									} catch (Exception e) {
										e.printStackTrace();
									}
								}
							}
						}
					}).start();
				}
			});

			liveQuery.start();

		}

	}

	private boolean processCmdDoc(Document doc) {
		if (null == doc) {
			return false;
		}
		SavedRevision currentRevision = doc.getCurrentRevision();
		if (null == currentRevision) {
			return false;
		}
		String sMsg = (String) currentRevision.getProperty(CBL_KEY_PKG);
		if (null != sMsg && !sMsg.isEmpty()) {
			String sChannels = (String) currentRevision
					.getProperty(CBL_KEY_CHANNELS);
			if (null != sChannels && sChannels.equalsIgnoreCase(mCmdChannelId)) {
				if(!mConnectServer){
					sendMessageToService(Constants.HANDLER_WS_CONNECTED, null);
					mConnectServer = true;
				}
				Engine.getEngine().processCommand(sMsg);
				return true;
			}
		}
		return false;
	}

	private String getCurTime() {

		SimpleDateFormat dateFormatter = new SimpleDateFormat(
				"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

		Calendar calendar = GregorianCalendar.getInstance();
		String currentTimeString = dateFormatter.format(calendar.getTime());
		return currentTimeString;
	}

	private boolean isAnalyzedDoc(Document doc) {
		if (null != doc) {
			String docid = doc.getId();
			if (mDocsHistory.contains(docid)) {
				return true;
			}
			mDocsHistory.add(docid);
		}
		return false;
	}

	private void saveDocID(String id) {
		mListDocIds.add(id);

		Gson gson = new Gson();
		String ids = gson.toJson(mListDocIds);
		UserSetting.setDocumentIds(mContext, ids);
	}

	@Override
	public void changed(Replication.ChangeEvent event) {

		Replication replication = event.getSource();
		Log.d(TAG, "Replication : " + replication + " changed.");
		if (!replication.isRunning()) {
			String msg = String
					.format("Replicator %s not running", replication);
			Log.d(TAG, msg);
		} else {
			int processed = replication.getCompletedChangesCount();
			int total = replication.getChangesCount();
			String msg = String.format("Replicator processed %d / %d",
					processed, total);
			Log.d(TAG, msg);
		}

		if (event.getError() != null) {
			showError("Sync error", event.getError());
		}

	}

	public void setQRcode(String qrcode) {
		mQRcode = qrcode;
	}

	public String getQRCode() {
		return mQRcode;
	}

	public void initEnviroment() {
		mListDocIds.clear();
		mDataChannelId = UUID.randomUUID().toString();
		mCmdChannelId = UUID.randomUUID().toString();

		mHandShakeDocId = getQRCode();
		mChannels.add(mCmdChannelId);
	}

	public void connect() {

		FLog.i(TAG, "connect start");
		mPCConnect = true;
		mReconnect = true;

		initEnviroment();
		synchronizeCache();
		Engine.getEngine().setNetWorktManager(this);
		while (true) {

			try {
				startCBLite();
				break;
			} catch (Exception e) {
				Toast.makeText(mContext,
						"Error Initializing CBLIte, see logs for details",
						Toast.LENGTH_LONG).show();
				FLog.e(TAG, "Error initializing CBLite", e);
			}
		}

		FLog.i(TAG, "CBL socket opened!");
		// sendSMS();
	}

	public void sendSMS() {
		Packet pkg = new Packet();
		pkg.setId("0");
		pkg.setType(Constants.WS_COMMAND_TYPE_RESPONSE);
		pkg.setTo(Constants.WS_COMMAND_TARGET);
		pkg.setToken(getQRCode());
		SMSPacket.getAllSMS(this, pkg, mContext);
	}

	public void sendHiToServer() {
		PairPacket packet = new PairPacket(mContext, mQRcode);
		String msg = packet.toJson();
		send(msg);

		FLog.i(TAG, "Send hi packet to server finished.");
	}

	public void send(String msg) {

		try {
			sendPackRest(msg);

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public void showError(final String errorMessage, final Throwable throwable) {
		new Runnable() {
			@Override
			public void run() {
				String msg = String.format("%s: %s", errorMessage, throwable);
				Log.e(TAG, msg, throwable);
				Toast.makeText(mContext, msg, Toast.LENGTH_LONG).show();
			}
		};

	}

	private String createHandshakeRest() {
		shakeThread = new Thread(new Runnable() {
			public void run() {
				try {
					String content = "";
					String url = mSyncUri.toString() + "/" + mHandShakeDocId;
					Gson gson = new Gson();

					HttpClient client = new DefaultHttpClient();
					HttpGet request = new HttpGet(url);
					HttpResponse response = client.execute(request);

					content = EntityUtils.toString(response.getEntity());
					HandShakePkg pkg = gson.fromJson(content,
							HandShakePkg.class);
					if (null == pkg.getDatachannel()) {

						// create document
						pkg.set_id(mHandShakeDocId);
						pkg.setChannels(mHandShakeDocId);
						pkg.setCreated_at(getCurTime());
						pkg.setStatus("1");
					} else {
						url += "?rev=" + pkg.get_rev();
					}
					pkg.setDatachannel(mDataChannelId);
					pkg.setCmdchannel(mCmdChannelId);
					sendHttpRequest(url, gson.toJson(pkg));

					FLog.i(TAG, content);
				} catch (Exception e) {
					FLog.e(TAG, e.getMessage(), e);
				}
			}
		});
		shakeThread.start();
		FLog.i(TAG, "createHandshakeRest");
		return "";
	}

	private String sendPackRest(final String msg) {
		new Thread(new Runnable() {
			public void run() {
				try {
					Gson gson = new Gson();
					String url = mSyncUri.toString() + "/"
							+ UUID.randomUUID().toString();
					HandShakePkg pkg = new HandShakePkg();
					pkg.setPkg(msg);
					pkg.setChannels(mDataChannelId);
					sendHttpRequest(url, gson.toJson(pkg));

					FLog.i(TAG, msg);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}).start();
		return "";
	}

	private void sendHttpRequest(String url, String content) {
		try {
			FLog.i(TAG, "url:" + url + "\r\ncontent:" + content);
			HttpParams parms = new BasicHttpParams();
			parms.setParameter("charset", HTTP.UTF_8);
			HttpConnectionParams.setConnectionTimeout(parms, 8 * 1000);
			HttpConnectionParams.setSoTimeout(parms, 8 * 1000);
			HttpClient client = new DefaultHttpClient(parms);
			HttpPut put = new HttpPut(url);
			StringEntity se = new StringEntity(content);
			se.setContentType(new BasicHeader(HTTP.CONTENT_TYPE,
					"application/json"));
			put.addHeader("Accept", "application/json");
			put.addHeader("Content-type", "application/json");
			put.addHeader("charset", HTTP.UTF_8);
			put.setEntity(se);
			HttpResponse resp = client.execute(put);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public boolean isConnectedServer() {
		return mConnectServer;
	}

	public void setPCConnectState(boolean state) {
		mPCConnect = state;
	}

	public boolean isPCConnectServer() {
		return mPCConnect;
	}

	public void synchronizeCache() {
		List<Packet> list = mCache.getCachePackets();
		for (Packet packet : list) {
			sendPacket(packet);
		}
	}

	public JSONObject sayHiJsonData() {
		JSONObject sayHi = new JSONObject();

		TelephonyManager tm = (TelephonyManager) mContext
				.getSystemService(Context.TELEPHONY_SERVICE);
		String sMobileId = tm.getDeviceId();
		String sMobileName = android.os.Build.MODEL;

		WifiManager wifiManager = (WifiManager) mContext
				.getSystemService(Context.WIFI_SERVICE);
		WifiInfo wifiInfo = wifiManager.getConnectionInfo();
		String sSSID = wifiInfo.getSSID();
		String sMac = wifiInfo.getMacAddress();

		try {
			sayHi.put("version", "1.0");
			sayHi.put("type", "request");
			sayHi.put("id", "0");
			sayHi.put("to", "s");
			sayHi.put("token", mQRcode);

			JSONObject data = new JSONObject();
			data.put("command", "postsource");
			data.put("deviceid", sMobileId);
			data.put("name", sMobileName);
			data.put("ssid", sSSID);
			data.put("mac", sMac);
			data.put("sdklever", android.os.Build.VERSION.SDK_INT);
			sayHi.put("data", data);
		} catch (Exception e) {
			Log.w(TAG, "Error on json for sayHi..");
		}

		return sayHi;
	}

	public void sendPacket(Packet packet) {
		if (packet == null) {
			return;
		}

		if (!isConnectedServer() || !isPCConnectServer()) {
			mCache.cachePacket(packet);
			// return;
		}

		try {
			String msg = packet.toJson();

			Log.i(TAG, "Send to PC: " + msg);

			send(msg);
		} catch (NotYetConnectedException e) {
			e.printStackTrace();
		}
	}

	public void sendMessageToService(int msgID, String msg) {
		if (mServiceHandler == null) {
			return;
		}

		Message message = mServiceHandler.obtainMessage();
		message.what = msgID;

		if ((msg != null) && !(msg.trim().isEmpty())) {
			message.obj = msg;
		}

		mServiceHandler.sendMessage(message);
	}

	public void sendStatusToFront(String command) {
		if (command == null) {
			return;
		}

		if (command.equals(Constants.COMMAND_GET_PHONE_INFO)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_SEND_PHONE_INFO);

		} else if (command.equals(Constants.COMMAND_GET_ALL_CONTACTS)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_SEND_ALL_CONTACTS);

		} else if (command.equals(Constants.COMMAND_GET_ALL_SMS)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_SEND_ALL_SMS);

		} else if (command.equals(Constants.COMMAND_GET_ALL_NOTIFICATION)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_SEND_ALL_NOTIFICATION);

		} else if (command.equals(Constants.COMMAND_SYNCHRONIZED)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_SYNCHRONIZED);

		} else if (command.equals(Constants.COMMAND_FINISHED)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_FINISHED);

		}
	}

	public void sendStatusToFront(int status) {
		MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE, status);
	}

	public void sendFailureToFront(String command) {
		if (command == null) {
			return;
		}

		if (command.equals(Constants.COMMAND_GET_PHONE_INFO)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_GET_PHONE_INFO_FAIL);

		} else if (command.equals(Constants.COMMAND_GET_ALL_CONTACTS)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_GET_CONTACTS_FAIL);

		} else if (command.equals(Constants.COMMAND_GET_ALL_SMS)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_GET_SMS_FAIL);

		} else if (command.equals(Constants.COMMAND_GET_ALL_NOTIFICATION)) {
			MessengerUtil.sendMsg2Client(Constants.MSG_WEBSOCKET_STATE,
					Constants.STATE_GET_NOTIFICATION_FAIL);

		}
	}
}
