package com.lenovo.linkit;

import java.net.URI;

import android.annotation.SuppressLint;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;

import com.lenovo.linkit.StateManager.State;
import com.lenovo.linkit.StateManager.StateChange;
import com.lenovo.linkit.core.Engine;
import com.lenovo.linkit.facebook.FacebookChatProxyService;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.network.CBRestManager;
import com.lenovo.linkit.network.INetworkManager;
import com.lenovo.linkit.network.MessengerUtil;
import com.lenovo.linkit.network.NetworkManager;
import com.lenovo.linkit.network.WebSocketManager;
import com.lenovo.linkit.notification.NotificationObject;
import com.lenovo.linkit.notification.NotificationObjectList;

public class MainService extends Service {
	private Engine mEngine;

	static String TAG = "MainService";
	private INetworkManager mWSManager = null;
	private String mQRcode = "";
	private int connectType = -1 ;
	private NLServiceReceiver nlservicereciver;
	private boolean notificationServiceState = false;
	private Messenger mMessenger = null;
	private Messenger mFrontMessenger = null;
	private Thread tempThread ;
	private StateChange stateChange = new StateChange(){

		@Override
		public void onChange(State state) {
			if(mFrontMessenger != null){
				sendStateToUI(state);
			}
			if(state.getState() == State.STATE_CONFICT){
				mQRcode = "";
				connectType = -1;
			}
		}
	};
	

	 private int mNetworkMgrMethod = Constants.WS_NETWORK_MGR_WEB_SOCKET;
//	private int mNetworkMgrMethod = Constants.WS_NETWORK_MGR_COUCHBASE;

	@Override
	public void onCreate() {
		FLog.init(this, "Service_debug.log");
		FLog.i(TAG, "onCreate start.");

		try {
			mEngine = Engine.getEngine();
			mEngine.init(this);
			NetworkManager.getInstance().setContext(this);
			NetworkManager.getInstance().start();
			FLog.i(TAG, "NetworkManager.getInstance().start() success.");
			
			FacebookChatProxyService.getInstance().setContext(this);
			FLog.i(TAG, "FacebookChatProxyService.getInstance() success.");
			
			IntentFilter filter = new IntentFilter();
			filter.addAction(Constants.MAINSERVER_NLSERVICERECEIVER_ACTION);
			nlservicereciver = new NLServiceReceiver();
			registerReceiver(nlservicereciver, filter);

			new AsyncTask<Void, Void, Integer>() {
				@Override
				protected Integer doInBackground(Void... params) {
					mEngine.start();

					return null;
				}
			}.execute();

			HandlerThread handThread = new HandlerThread("MessageObtain");
			handThread.start();

			mMessenger = new Messenger(new IncomingHandler(Looper.getMainLooper()));

			IntentFilter intentFilter = new IntentFilter();
			intentFilter.addAction(Constants.ACTION_STOP_SERVICE);
			intentFilter.addAction(Constants.ACTION_GET_LOG_FROM_SERVICE);
			registerReceiver(mReceiver, intentFilter);

			StateManager.getInstance().pushState(new State(State.STATE_DISCONNECTED));

			Intent sendIntent = new Intent();
			sendIntent
					.setAction(Constants.NOTIFICATIONDAEMONSERVICE_NLSERVICERECEIVER_ACTION);
			sendIntent.putExtra(Constants.NOTIFICATION_COMMAND,
					Constants.COMMAND_SERVICE_STATE);
			sendBroadcast(sendIntent);
		} catch (Exception e) {
			e.printStackTrace();
		}

		FLog.i(TAG, "onCreate finished.");
	}

	BroadcastReceiver mReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			String action = intent.getAction();

			if (action.equals(Constants.ACTION_STOP_SERVICE)) {
				FLog.i(TAG, "Stop service myself!");

				MainService.this.stopSelf();
			} else if (action.equals(Constants.ACTION_GET_LOG_FROM_SERVICE)) {
				String logmsg = FLog
						.getHtmlLogByLevel(Constants.LOG_LEVEL_VERBOSE);
				if ((logmsg != null) && (logmsg.trim().length() > 0)) {
					Bundle bundle = new Bundle();
					bundle.putString("log", logmsg);

					Intent sendbackIntent = new Intent();
					sendbackIntent
							.setAction(Constants.ACTION_SEND_LOG_FROM_SERVICE);
					sendbackIntent.putExtras(bundle);

					sendBroadcast(sendbackIntent);
				}
			}
		}

	};

	private void createNewSwClient() {
		try {
			String serverIp = UserSetting
					.getWebSocketAddress(getApplicationContext());
			String server = "ws://" + serverIp;
			if (!serverIp.contains(":")) {
				server += ":" + Constants.WEB_SOCKET_PORT;
			}
			if (Constants.WS_NETWORK_MGR_COUCHBASE == mNetworkMgrMethod) {
				mWSManager = new CBRestManager/* CBLManager */(getBaseContext(),
						new URI(UserSetting.getSyncUrl()), mConnectHandler);

				FacebookChatProxyService.getInstance().setManager(mWSManager);
			} else if (Constants.WS_NETWORK_MGR_WEB_SOCKET == mNetworkMgrMethod) {
				mWSManager = new WebSocketManager(getBaseContext(), new URI(
						server), mConnectHandler);
				FacebookChatProxyService.getInstance().setManager(mWSManager);
			}

			FLog.i(TAG, "createNewSwClient finish, WS address: " + server);

		} catch (Exception e) {
			FLog.w(TAG, "Error on createNewSwClient");
		}
	}

	private void closeSwClient() {
		if ((mWSManager != null) && mWSManager.isConnectedServer()) {
			FLog.i(TAG, "closeSwClient");
			mWSManager.close();
		}

	}

	private void connectServer() {
		FLog.i(TAG, "connectServer");
		closeSwClient();
		createNewSwClient();

		if ((mWSManager != null) && !mWSManager.isConnectedServer()) {
			FLog.i(TAG, "Try to connect to http server, QRCode:" + mQRcode);
			StateManager.getInstance().pushState(new State(State.STATE_CONNECTING));
			mWSManager.setQRcode(mQRcode);
			try {
				mWSManager.connect();
			} catch (Exception e) {
				FLog.e(TAG, "Web socket connect server exception.");
			}
		}
	}

	private void reconnectServer() {
		FLog.i(TAG, "reconnectServer");
		closeSwClient();
		createNewSwClient();
		if ((mWSManager != null) && !mWSManager.isConnectedServer()) {
			FLog.i(TAG, "Try to connect to http server, QRCode:" + mQRcode);
			mWSManager.setQRcode(mQRcode);
			StateManager.getInstance().pushState(new State(State.STATE_RECONNECTING));
			try {
				mWSManager.connect();
			} catch (Exception e) {
				FLog.e(TAG, "Web socket reconnect server exception.");
			}
		}
	}

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
			Intent sendIntent = new Intent();
			sendIntent
					.setAction(Constants.MAINACTIVITY_NLSERVICERECEIVER_ACTION);
			sendIntent.putExtra("data", notificationServiceState);
			sendBroadcast(sendIntent);
		} else {
			FLog.w(TAG, "LINKit can't get the notification message");
		}

		return START_STICKY;
	}

	@Override
	public void onDestroy() {
		FLog.i(TAG, "onDestroy");
		NetworkManager.getInstance().stop();
		this.unregisterReceiver(mReceiver);
		unregisterReceiver(nlservicereciver);

		mEngine.stop();

		closeSwClient();
		mWSManager = null;
		StateManager.getInstance().clearState();
	}

	@Override
	public IBinder onBind(final Intent intent) {
		FLog.i(TAG, "onBind");
		mFrontMessenger = null;
		return mMessenger.getBinder();
	}

	@Override
	public void onRebind(Intent intent) {
		FLog.i(TAG, "onRebind");
		mFrontMessenger = null;
		super.onRebind(intent);
	}

	private class IncomingHandler extends Handler {
		public IncomingHandler(Looper loop) {
			super(loop);
		}

		// Handler of incoming messages from clients.
		@Override
		public void handleMessage(Message msg) {
			FLog.i(TAG, "Get message: " + msg.what);
			switch (msg.what) {
			case Constants.MSG_REGISTER_CLIENT_REQ: {
				if (msg.replyTo != null) {
					mFrontMessenger = msg.replyTo;
					MessengerUtil.setMessenger(mFrontMessenger);
					StateManager.getInstance().registerListener(stateChange);
					FLog.i(TAG, "Client register.");
				} else {
					FLog.i(TAG, "Client register. But front messenger is null.");
				}

				break;
			}
			case Constants.MSG_SET_QCODE_REQ: {
				if ((msg != null) && (msg.getData() != null)) {
					String sQCode = msg.getData().getString("QCode");
					FLog.i(TAG, "Set QCode, QCode=" + sQCode);
					mQRcode = sQCode;
					connectType = msg.arg1;
					connectServer();
				}

				break;
			}
			case Constants.MSG_WEBSOCKET_STATE: {
				if (null != msg.replyTo) {
					stateChange.onChange(StateManager.getInstance()
							.getCurrentState());
				}
				break;
			}

			case Constants.MSG_DISCONNECT_PC: {
				if (connectType == msg.arg1) {
					FLog.i(TAG, "Disconnect PC.");
					closeSwClient();
					mQRcode = "";
					connectType = -1;
					StateManager.getInstance().pushState(
							new State(State.STATE_PC_DISCONNECT));
				}
				break;
			}

			case Constants.MSG_UNREGISTER_CLIENT: {
				FLog.i(TAG, "Unregister client!");
				mFrontMessenger = null;
				MessengerUtil.setMessenger(null);
				StateManager.getInstance().unRegisterListener(stateChange);
				break;
			}
			}
		}
	}

	@SuppressLint("HandlerLeak")
	private Handler mConnectHandler = new Handler() {
		public void handleMessage(Message msg) {
			FLog.i(TAG, "Connect Handler get message:" + msg.what);

			switch (msg.what) {
			case Constants.HANDLER_MESSAGE: {
				if (msg.obj != null) {
				}

				break;
			}

			case Constants.HANDLER_WS_DISCONNECTED: {
				StateManager.getInstance().pushState(new State(State.STATE_DISCONNECTED));
				if(mQRcode != null && !"".equals(mQRcode)){
					FLog.i(TAG, "Web socket disconnected. Reconnect...");
					mConnectHandler.postDelayed(runnable,
							Constants.WS_RECONNECT_INTERVAL);
				}

				break;
			}

			case Constants.HANDLER_WS_CONNECTED: {
				StateManager.getInstance().pushState(new State(State.STATE_CONNECTED));
				mWSManager.sendHiToServer();
				FLog.i(TAG, "Send pair request to PC!");
				break;
			}

			case Constants.HANDLER_PAIR_SUCCESS: {
				if (mWSManager != null) {
					mWSManager.setPCConnectState(true);
				}

				break;
			}

			case Constants.HANDLER_PC_DISCONNECT: {
				StateManager.getInstance().pushState(new State(State.STATE_PC_DISCONNECT));
				if (mWSManager != null) {
					mWSManager.setPCConnectState(false);
				}
				break;
			}

			case Constants.HANDLER_RECEIVED_MSG: {
				break;
			}

			default:
				break;

			}

			super.handleMessage(msg);
		}
	};

	Runnable runnable = new Runnable() {
		public void run() {
			if (!mWSManager.isConnectedServer()) {
				tempThread = new Thread() {
					public void run() {
						autoReconnect();
					}
				};
				tempThread.start();
			}
		}
	};

	private void autoReconnect() {
		if(NetworkManager.getInstance().getState() > 0){
			reconnectServer();
		}
		if (!mWSManager.isConnectedServer()) {
			mConnectHandler.postDelayed(runnable,
					Constants.WS_RECONNECT_INTERVAL);
		}
	}


	private void sendStateToUI(State state) {
		try {
			Message msgBack = Message.obtain(null, Constants.MSG_SERVICE_STATE);
			if (msgBack != null) {
				msgBack.arg1 = state.getState() ;
				msgBack.arg2 = connectType ;
				mFrontMessenger.send(msgBack);
				FLog.i(TAG, "sendStateToUI:" + state.toString());
			}
		} catch (RemoteException e) {
			e.printStackTrace();
		}
	}
	

	class NLServiceReceiver extends BroadcastReceiver {

		@Override
		public void onReceive(Context context, final Intent intent) {
			tempThread = new Thread() {
				public void run() {
					try {
						FLog.i(TAG,
								Constants.NOTIFICATION_COMMAND
										+ " : "
										+ intent.getStringExtra(Constants.NOTIFICATION_COMMAND));
						if (intent.getStringExtra(
								Constants.NOTIFICATION_COMMAND).equals(
								Constants.COMMAND_ALL_NOTIFICATION)) {
							Bundle extras = intent.getExtras();
							NotificationObjectList nol = (NotificationObjectList) extras
									.get("result");
							Engine.getEngine().onAllNotification(
									nol.getNotificationObject());

							FLog.i(TAG, "get all notification msg. length:"
									+ nol.getNotificationObject().length);
						} else if (intent.getStringExtra(
								Constants.NOTIFICATION_COMMAND).equals(
								Constants.COMMAND_DISMISS_NOTIFICATION)) {

						} else if (intent.getStringExtra(
								Constants.NOTIFICATION_COMMAND).equals(
								Constants.COMMAND_NEW_NOTIFICATION)) {
							NotificationObject no = (NotificationObject) intent
									.getExtras().get("result");
							Engine.getEngine().onNotificationPosted(no);

							FLog.i(TAG, "new notification msg." + no.getTitle());
						} else if (intent.getStringExtra(
								Constants.NOTIFICATION_COMMAND).equals(
								Constants.COMMAND_REMOVE_NOTIFICATION)) {
							NotificationObject no = (NotificationObject) intent
									.getExtras().get("result");
							Engine.getEngine().onNotificationRemoved(no);

							FLog.i(TAG, "new notification msg." + no.getTitle());
						} else if (intent.getStringExtra(
								Constants.NOTIFICATION_COMMAND).equals(
								Constants.COMMAND_SERVICE_STATE)) {
							notificationServiceState = intent.getExtras()
									.getBoolean("data");

							FLog.i(TAG, Constants.COMMAND_SERVICE_STATE
									+ "notificationServiceState : "
									+ notificationServiceState);

							Intent sendIntent = new Intent();
							sendIntent
									.setAction(Constants.MAINACTIVITY_NLSERVICERECEIVER_ACTION);
							sendIntent.putExtra("data",
									notificationServiceState);
							sendBroadcast(sendIntent);
						} else if (intent.getStringExtra(
								Constants.NOTIFICATION_COMMAND).equals(
								Constants.QUERY_SERVICE_STATE)) {
							Intent sendIntent = new Intent();
							sendIntent
									.setAction(Constants.MAINACTIVITY_NLSERVICERECEIVER_ACTION);
							sendIntent.putExtra("data",
									notificationServiceState);
							sendIntent.putExtra("facebookstate",
									FacebookChatProxyService.getInstance()
											.isLogin());
							sendBroadcast(sendIntent);
						} else if (intent.getStringExtra(
								Constants.NOTIFICATION_COMMAND).equals(
								Constants.ACTION_FACEBOOK_LOGIN)) {
							final String username = intent
									.getStringExtra("username");
							final String password = intent
									.getStringExtra("password");
							tempThread = new Thread() {
								public void run() {
									FacebookChatProxyService.getInstance()
											.login(username, password);

									Intent sendIntent = new Intent();
									sendIntent
											.setAction(Constants.MAINACTIVITY_NLSERVICERECEIVER_ACTION);
									sendIntent.putExtra("data",
											notificationServiceState);
									sendIntent.putExtra("login", ""
											+ FacebookChatProxyService
													.getInstance().isLogin());
									sendIntent.putExtra("facebookstate",
											FacebookChatProxyService
													.getInstance().isLogin());
									sendBroadcast(sendIntent);
									FacebookChatProxyService.getInstance()
											.getFacebookContacts();
								}
							};
							tempThread.start();

						} else if (intent.getStringExtra(
								Constants.NOTIFICATION_COMMAND).equals(
								Constants.ACTION_FACEBOOK_LOGOUT)) {
							FacebookChatProxyService.getInstance().logout();
							Intent sendIntent = new Intent();
							sendIntent
									.setAction(Constants.MAINACTIVITY_NLSERVICERECEIVER_ACTION);
							sendIntent.putExtra("data",
									notificationServiceState);
							sendIntent.putExtra("facebookstate",
									FacebookChatProxyService.getInstance()
											.isLogin());
							sendBroadcast(sendIntent);
						}
					} catch (Exception e) {
						FLog.e(TAG,
								"notification error" + e.getMessage()
										+ e.getStackTrace());
					}
				}
			};
			tempThread.start();
		}
	}
}
