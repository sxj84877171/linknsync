package com.lenovo.linkit;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.util.DisplayMetrics;
import android.view.GestureDetector;
import android.view.GestureDetector.OnGestureListener;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnLongClickListener;
import android.view.ViewGroup.LayoutParams;
import android.view.Window;
import android.view.animation.AnimationUtils;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.PopupWindow;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ViewFlipper;

import com.lenovo.linkit.StateManager.State;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.log.LogActivity;
import com.lenovo.linkit.network.NetworkManager;
import com.lenovo.linkit.network.NetworkManager.NetworkChangerListener;
import com.lenovo.linkit.notification.NotificationDaemonService;
import com.lenovo.linkit.util.ServiceUtil;
import com.lenovo.lsf.lenovoid.LOGIN_STATUS;
import com.lenovo.lsf.lenovoid.LenovoIDApi;

public class MainActivity extends Activity {

	public static final String TAG = MainActivity.class.getSimpleName();
	
	private static final String RID = "www.thelinkit.com";
	private LINKitApplication app = null ;
	private Thread tempThread ;

	private View splish;
	private ViewFlipper viewFlipper;
	private View main;

	private View page1;
	private View page2;
	private View page3;

	private TextView version;

	private LayoutInflater inflater;
	private GestureDetector detector;

	private View connect = null;
	private TextView btnActionText;
	private TextView stateContent;
	private TextView iphost;
	private ImageView state;
	private View lenovoid ;
	private View stateImage ;
	private TextView login ;
	private int stateImageIndex = 0;
	private View menu;
	private int pageState;

	private View openNotification;
	private View ignore;

	private ServiceStateReceiver sReceiver;
	private boolean facebookstate;

	private Messenger mService = null;
	private final Messenger mMessenger = new Messenger(new IncomingHandler());

	private String versionCode;

	private PopupWindow popup;
	private View menuAbout;
	private View menuNotification;
	private View menuDeveloper;
	private View menuUpdate;
	private View menuLog;
	private View menuExit;
	private TextView menuLoginFacebook;
	private View topLogo;
	private View notificationSetting;
	private ProgressDialog procgressDialog;
	private int oldWifiState = 1;

	private AlertDialog facebookLoginDialog;

	private Handler handler = new Handler() {

		@Override
		public void dispatchMessage(Message msg) {
			super.dispatchMessage(msg);
		}
	};

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		LenovoIDApi.init(this, "1", null);
		FLog.init(this, "Activity_debug.log");
		FLog.i(TAG, "onCreate start.");
		LenovoIDApi.init(this, RID, null);
		setContentView(R.layout.activity_main);
		inflater = this.getLayoutInflater();
		initFindViewById();
		
		app = (LINKitApplication) getApplication();
		registerServiceStateReceiver();
		NetworkManager.getInstance().setContext(this);
		NetworkManager.getInstance().start();
		NetworkManager.getInstance().registerNetworkChangeListener(
				new NetworkChangerListener() {
					boolean cState = true;

					@Override
					public void onChange(int state) {
						if (state > 0) {
							if (!cState) {
								stateContent.setText(R.string.state_ws_disconnected);
								connect.setClickable(true);
								lenovoid.setClickable(true);
								cState = true;
								connect.setBackgroundColor(Color.parseColor("#0d811e"));
								lenovoid.setBackgroundColor(Color.parseColor("#0d811e"));
							}
						} else {
							if (cState) {
								stateContent.setText(R.string.wifi_state_disconnected);
								connect.setClickable(false);
								lenovoid.setClickable(false);
								cState = false ;
								connect.setBackgroundColor(Color.parseColor("#999999"));
								lenovoid.setBackgroundColor(Color.parseColor("#999999"));
							}
						}
					}
				});
		handler.postDelayed(new Runnable() {
			public void run() {
				splish.setVisibility(View.GONE);
				if (!getVersionValue(versionCode)) {
					viewFlipper.setVisibility(View.VISIBLE);
					pageState = 1;
				} else {
					main.setVisibility(View.VISIBLE);
					viewFlipper.setVisibility(View.GONE);
					pageState = 4;
				}
			}
		}, 3000);
		
		checkMainServer();
		doBindService();
	}

	private void initFindViewById() {
		splish = this.findViewById(R.id.splish);
		viewFlipper = (ViewFlipper) this.findViewById(R.id.ViewFlipper1);
		version = (TextView) this.findViewById(R.id.version);
		main = this.findViewById(R.id.main);
		iphost = (TextView) this.findViewById(R.id.iphost);
		menu = this.findViewById(R.id.menu);

		page1 = inflater.inflate(R.layout.loading, null);
		page2 = inflater.inflate(R.layout.loading, null);
		page3 = inflater.inflate(R.layout.loading, null);
		((TextView) page1.findViewById(R.id.message))
				.setText(R.string.message_title);
		((TextView) page2.findViewById(R.id.message))
				.setText(R.string.contact_title);
		((TextView) page3.findViewById(R.id.message))
				.setText(R.string.call_title);
		((ImageView) page1.findViewById(R.id.image_body))
				.setImageResource(R.drawable.guide_img_sms);
		((ImageView) page2.findViewById(R.id.image_body))
				.setImageResource(R.drawable.guide_img_contact);
		((ImageView) page3.findViewById(R.id.image_body))
				.setImageResource(R.drawable.guide_img_call);
		((TextView) page1.findViewById(R.id.loading_title))
				.setText(R.string.sms_loading_title);
		((TextView) page2.findViewById(R.id.loading_title))
				.setText(R.string.contact_loading_title);
		((TextView) page3.findViewById(R.id.loading_title))
				.setText(R.string.call_loading_title);
		((ImageView) page1.findViewById(R.id.point_1))
				.setImageResource(R.drawable.point_guide_sel);
		((ImageView) page2.findViewById(R.id.point_2))
				.setImageResource(R.drawable.point_guide_sel);
		((ImageView) page3.findViewById(R.id.point_3))
				.setImageResource(R.drawable.point_guide_sel);
		viewFlipper.addView(page1);
		viewFlipper.addView(page2);
		viewFlipper.addView(page3);

		notificationSetting = this.findViewById(R.id.notification_setting);
		notificationSetting.setVisibility(View.GONE);
		openNotification = this.findViewById(R.id.openNotification);
		ignore = this.findViewById(R.id.ignore);
		openNotification.setOnClickListener(clickListener);
		ignore.setOnClickListener(clickListener);
		detector = new GestureDetector(listener);
		connect = this.findViewById(R.id.btnAction);
		btnActionText = (TextView) findViewById(R.id.btnActionText);
		stateContent = (TextView) findViewById(R.id.btnActionState);
		stateImage = findViewById(R.id.state_content);
		login = (TextView) findViewById(R.id.login);
		lenovoid =  findViewById(R.id.lenovoid);
		state = (ImageView) findViewById(R.id.state);
		connect.setOnClickListener(clickListener);
		lenovoid.setOnClickListener(clickListener);
		topLogo = findViewById(R.id.top_logo);
		// if (Constants.IS_TEST_BUILD) {
		topLogo.setOnLongClickListener(new OnLongClickListener() {

			@Override
			public boolean onLongClick(View v) {
				if (menuDeveloper.getVisibility() == View.VISIBLE) {
					menuDeveloper.setVisibility(View.GONE);
					menuLog.setVisibility(View.GONE);
					Toast.makeText(MainActivity.this, R.string.developer_close,
							Toast.LENGTH_SHORT).show();
				} else {
					menuDeveloper.setVisibility(View.VISIBLE);
					menuLog.setVisibility(View.VISIBLE);
					Toast.makeText(MainActivity.this, R.string.developer_open,
							Toast.LENGTH_SHORT).show();

				}
				return false;
			}

		});
		// }
		checkUpdate();

		versionCode = getString(R.string.app_name) + getVersionCode();
		version.setText(versionCode);

		View menuView = inflater.inflate(R.layout.linkit_menu, null);
		menuAbout = menuView.findViewById(R.id.about);
		menuNotification = menuView.findViewById(R.id.notification);
		if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.KITKAT) {
			menuNotification.setVisibility(View.GONE);
		}
		menuDeveloper = menuView.findViewById(R.id.developer);
		menuUpdate = menuView.findViewById(R.id.update);
		menuLog = menuView.findViewById(R.id.log);
		menuLoginFacebook = (TextView) menuView.findViewById(R.id.facebook);
		menuExit = menuView.findViewById(R.id.exit);
		menuAbout.setOnClickListener(menuListener);
		menuNotification.setOnClickListener(menuListener);
		menuDeveloper.setOnClickListener(menuListener);
		menuUpdate.setOnClickListener(menuListener);
		menuLog.setOnClickListener(menuListener);
		menuExit.setOnClickListener(menuListener);
		menuLoginFacebook.setOnClickListener(menuListener);

		popup = new PopupWindow(menuView, 400, LayoutParams.WRAP_CONTENT);
		popup.setOutsideTouchable(true);
		menu.setOnClickListener(clickListener);
		// popup.showAsDropDown(menu);
	}

	@Override
	protected void onStart() {
		super.onStart();
		

	};

	@Override
	protected void onResume() {
		super.onResume();

		UserSetting.initSetting(getBaseContext());
		String httpServer = UserSetting.getHttpServerAddress();
		iphost.setText(String.format(getString(R.string.website_promotion),
				httpServer));
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
			if (app.isShowSetNotification()) {
				Intent sendIntent = new Intent();
				sendIntent
						.setAction(Constants.MAINSERVER_NLSERVICERECEIVER_ACTION);
				sendIntent.putExtra(Constants.NOTIFICATION_COMMAND,
						Constants.QUERY_SERVICE_STATE);
				sendBroadcast(sendIntent);
				FLog.i(TAG,
						"Os version lowwer than 4.4, notification service is now setting.");
				
				/*if(!ServiceUtil.isServiceRunning(this, NotificationDaemonService.class.getName())){
					
				}*/
			}else{
				notificationSetting.setVisibility(View.GONE);
			}
		}
		
		if (!"lenovoid"
				.equals(getSharedPreferencesKeyValue(Constants.LENOVOID_LOGIN_CONFICT))) {
			LOGIN_STATUS status = LenovoIDApi.getStatus(this);
			if (status == LOGIN_STATUS.ONLINE) {
				login.setText(R.string.logout);
				connect.setVisibility(View.GONE);
				stateImage.setVisibility(View.VISIBLE);
				FLog.i(TAG, "LOGIN_STATUS.ONLINE");
				FLog.i(TAG, "app.isHasLogin()" + app.isHasLogin());
				if (!app.isHasLogin()) {
					tempThread = new Thread() {
						public void run() {
							String uid = LenovoIDApi
									.getUserId(MainActivity.this, LenovoIDApi
											.getStData(MainActivity.this, RID,
													false), RID);
							sendLenovoid2Service("QCode", Constants.LENOVOID_HEAD
									+ uid, Constants.MSG_SET_QCODE_REQ);
							
							LenovoID.uploadLoginInfo(/**/uid, LenovoIDApi
									.getUserName(MainActivity.this),
									LenovoIDApi.getStData(MainActivity.this,
											RID, false));
						}
					};
					tempThread.start();
					app.setHasLogin(true);
				}
			} else {
				FLog.i(TAG, "LOGIN_STATUS.OFFLINE");
				if (mService != null) {
					try {
						Message msg = Message.obtain(null,
								Constants.MSG_DISCONNECT_PC);
						msg.replyTo = mMessenger;
						msg.arg1 = 1;
						mService.send(msg);
					} catch (RemoteException e) {
						e.printStackTrace();
					}
				} else {
					FLog.e(TAG, "Disconnect PC error!");
				}
				app.setHasLogin(false);
				login.setText(R.string.login);
				connect.setVisibility(View.VISIBLE);
				stateImage.setVisibility(View.GONE);
			}
		}
		
		
		if(NetworkManager.getInstance().getState() <= 0){
			stateContent.setText(R.string.wifi_state_disconnected);
			connect.setClickable(false);
			lenovoid.setClickable(false);
			
			connect.setBackgroundColor(Color.parseColor("#999999"));
			lenovoid.setBackgroundColor(Color.parseColor("#999999"));
		}
	}

	@Override
	public void onDestroy() {
		unregisterReceiver(sReceiver);
		NetworkManager.getInstance().stop();
		try {
			doUnbindService();
		} catch (Throwable t) {

		}
		super.onDestroy();
	}

	@Override
	public void onStop() {

		super.onStop();

		
	}

	@Override
	public void onBackPressed() {
		if (notificationSetting.getVisibility() == View.VISIBLE) {
			notificationSetting.setVisibility(View.GONE);
			return;
		}
		this.finish();
	}

	@Override
	public boolean onMenuOpened(int featureId, Menu menu) {
		if (popup.isShowing()) {
			popup.dismiss();
		} else {
			popup.showAtLocation(getWindow().getDecorView(), Gravity.TOP
					| Gravity.RIGHT, 5, dpToPx(55));
		}
		return false;
	}

	@Override
	public void onActivityResult(final int requestCode, final int resultCode,
			final Intent data) {

		FLog.i(TAG, "onActivityResult, requestCode=" + requestCode
				+ ",resultCode=" + resultCode);

		if (requestCode == Constants.REQUEST_CODE_CONNECTION_STATUS) {
			if (resultCode == RESULT_OK) {
				Bundle bundleInfo = data.getExtras();
				if (null != bundleInfo) {
					String sQCode = bundleInfo.getString("QCode");
					FLog.i(TAG, "sQCode=" + sQCode);
					if (null != sQCode) {
						sendQCode2Service("QCode", sQCode,
								Constants.MSG_SET_QCODE_REQ);
					}
					btnActionText.setText(getString(R.string.scan_qrcode_disconnect));
					
					connect.setOnClickListener(disconnectListener);
				}
			}
		}
	}
	
	private View.OnClickListener disconnectListener = new View.OnClickListener() {
		@Override
		public void onClick(View v) {
			if (mService != null) {
				try {
					Message msg = Message.obtain(null,
							Constants.MSG_DISCONNECT_PC);
					msg.replyTo = mMessenger;
					msg.arg1 = 0 ;
					mService.send(msg);
				} catch (RemoteException e) {
					e.printStackTrace();
				}
			} else {
				FLog.e(TAG, "Disconnect PC error!");
			}
		}
	};

	private OnGestureListener listener = new OnGestureListener() {

		@Override
		public boolean onDown(MotionEvent e) {
			return false;
		}

		@Override
		public void onShowPress(MotionEvent e) {

		}

		@Override
		public boolean onSingleTapUp(MotionEvent e) {
			return false;
		}

		@Override
		public boolean onScroll(MotionEvent e1, MotionEvent e2,
				float distanceX, float distanceY) {
			return false;
		}

		@Override
		public void onLongPress(MotionEvent e) {

		}

		@Override
		public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX,
				float velocityY) {
			if (e1.getX() - e2.getX() > 120) {
				if (pageState == 1) {
					viewFlipper.setInAnimation(AnimationUtils.loadAnimation(
							MainActivity.this, R.anim.push_left_in));
					viewFlipper.setOutAnimation(AnimationUtils.loadAnimation(
							MainActivity.this, R.anim.push_left_out));
					viewFlipper.showNext();
					pageState = 2;
				} else if (pageState == 2) {
					viewFlipper.setInAnimation(AnimationUtils.loadAnimation(
							MainActivity.this, R.anim.push_left_in));
					viewFlipper.setOutAnimation(AnimationUtils.loadAnimation(
							MainActivity.this, R.anim.push_left_out));
					viewFlipper.showNext();
					pageState = 3;
				} else if (pageState == 3) {
					viewFlipper.setOutAnimation(AnimationUtils.loadAnimation(
							MainActivity.this, R.anim.push_right_out));
					main.setVisibility(View.VISIBLE);
					viewFlipper.setVisibility(View.GONE);
					setVersionValue(versionCode, true);
					pageState = 4;
				}
				return true;
			} else if (e1.getX() - e2.getX() < -120) {
				if (pageState == 1) {

				} else if (pageState == 2) {
					viewFlipper.setInAnimation(AnimationUtils.loadAnimation(
							MainActivity.this, R.anim.push_right_in));
					viewFlipper.setOutAnimation(AnimationUtils.loadAnimation(
							MainActivity.this, R.anim.push_right_out));
					viewFlipper.showPrevious();
					pageState = 1;
				} else if (pageState == 3) {
					viewFlipper.setInAnimation(AnimationUtils.loadAnimation(
							MainActivity.this, R.anim.push_right_in));
					viewFlipper.setOutAnimation(AnimationUtils.loadAnimation(
							MainActivity.this, R.anim.push_right_out));
					viewFlipper.showPrevious();
					pageState = 2;
				}

				return true;
			}

			return false;
		}

	};

	@Override
	public boolean onTouchEvent(MotionEvent event) {
		if (popup.isShowing()) {
			popup.dismiss();
			return true;
		}
		if (pageState > 0 && pageState < 4) {
			return this.detector.onTouchEvent(event);
		}

		return super.onTouchEvent(event);
	}

	private OnClickListener clickListener = new OnClickListener() {

		@Override
		public void onClick(View v) {
			if (v != null && v.getId() == R.id.btnAction
					|| v.getId() == R.id.btnActionText) {
				Intent intent = new Intent(MainActivity.this,
						CaptureActivity.class);
				startActivityForResult(intent,
						Constants.REQUEST_CODE_CONNECTION_STATUS);
			}
			if (v != null && v.getId() == R.id.openNotification) {
				Intent intent = new Intent(
						Constants.ACTION_NOTIFICATION_LISTENER_SETTINGS);
				startActivity(intent);
//				notificationSetting.setVisibility(View.GONE);
			}

			if (v != null && v.getId() == R.id.ignore) {
				notificationSetting.setVisibility(View.GONE);
			}
			if (v != null && v.getId() == R.id.menu) {
				if (popup.isShowing()) {
					popup.dismiss();
				} else {
					// popup.showAsDropDown(menu,30,30);
					int[] xy = { 0, 0 };
					findViewById(R.id.title).getLocationInWindow(xy);

					popup.showAtLocation(getWindow().getDecorView(),
							Gravity.TOP | Gravity.RIGHT, 5, xy[1] + dpToPx(55));
				}
			}
			if (v != null && v.getId() == R.id.lenovoid) {
				LOGIN_STATUS status = LenovoIDApi.getStatus(MainActivity.this);
				if (status == LOGIN_STATUS.ONLINE) {
					login.setText(R.string.logout);
					connect.setVisibility(View.GONE);
					stateImage.setVisibility(View.VISIBLE);
					FLog.i(TAG, "app.isHasLogin()" + app.isHasLogin());
					if (!app.isHasLogin()) {
						tempThread = new Thread() {
							public void run() {
								String uid = LenovoIDApi
										.getUserId(MainActivity.this, LenovoIDApi
												.getStData(MainActivity.this, RID,
														false), RID);
								sendLenovoid2Service("QCode", Constants.LENOVOID_HEAD
										+ uid, Constants.MSG_SET_QCODE_REQ);
								LenovoID.uploadLoginInfo(/**/uid, LenovoIDApi
										.getUserName(MainActivity.this),
										LenovoIDApi.getStData(MainActivity.this,
												RID, false));
							}
						};
						tempThread.start();
						app.setHasLogin(true);
					}else{
						LenovoIDApi.showAccountPage(MainActivity.this, RID);
					}
				} else {
					LenovoIDApi.showAccountPage(MainActivity.this, RID);
				}
				if(login.getText().toString().equals(getString(R.string.login))){
					putSharedPreferencesKeyValue(Constants.LENOVOID_LOGIN_CONFICT, "no");
				}
			}
			//
		}

	};

	private OnClickListener menuListener = new OnClickListener() {

		@Override
		public void onClick(View v) {
			if (v.getId() == R.id.about) {
				AlertDialog.Builder builder = new AlertDialog.Builder(
						MainActivity.this);
				builder.setTitle(R.string.about);
				UserSetting.initSetting(getBaseContext());
				String httpServer = UserSetting.getHttpServerAddress();
				String strMsg = String.format(
						getString(R.string.about_message), getVersionCode()
								+ "\n" + httpServer);
				builder.setMessage(strMsg);
				builder.setCancelable(false);
				builder.setPositiveButton(R.string.ok, null);

				final AlertDialog dialog = builder.create();
				dialog.show();

			} else if (v.getId() == R.id.exit) {

				Intent stop = new Intent(Constants.ACTION_STOP_SERVICE);
				sendBroadcast(stop);
				app.setShowSetNotification(true);
				finish();

			} else if (v.getId() == R.id.update) {
				UpdateVersionTask cv = new UpdateVersionTask(MainActivity.this,
						UpdateVersionTask.UPDATE_TYPE_CHECK);
				new Thread(cv).start();
			} else if (v.getId() == R.id.developer) {
				Intent tvIntent = new Intent(MainActivity.this,
						SettingsActivity.class);
				tvIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
				startActivity(tvIntent);
			}else if(v.getId() == R.id.lenovoid){
				LenovoIDApi.showAccountPage(MainActivity.this, RID);
				
				
			} else if (v.getId() == R.id.notification) {
				if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
					// notificationSetting.setVisibility(View.VISIBLE);
					Intent intent = new Intent(
							Constants.ACTION_NOTIFICATION_LISTENER_SETTINGS);
					startActivity(intent);
					FLog.i(TAG,
							"User open notification setting to set the notification service state.");
				}
			} else if (v.getId() == R.id.log) {
				final Intent intent = new Intent(MainActivity.this,
						LogActivity.class);
				startActivity(intent);
			} else if (v.getId() == R.id.facebook) {
				if (menuLoginFacebook.getText().toString()
						.equals(getString(R.string.login_facebook))) {
					if (facebookLoginDialog == null) {
						View facebookview = inflater.inflate(
								R.layout.facebook_login, null);
						final EditText username = (EditText) facebookview
								.findViewById(R.id.username);
						final EditText password = (EditText) facebookview
								.findViewById(R.id.password);
						/*
						 * final CheckBox save = (CheckBox)
						 * facebookview.findViewById(R.id.savepassword); final
						 * CheckBox auto = (CheckBox)
						 * facebookview.findViewById(R.id.autologin);
						 */
						String saveUserName = getSharedPreferencesKeyValue("facebook_username");
						String saveUserPass = getSharedPreferencesKeyValue("facebook_password");

						if (saveUserName != null) {
							username.setText(saveUserName);
						}
						if (saveUserPass != null) {
							password.setText(saveUserPass);
						}

						facebookLoginDialog = new AlertDialog.Builder(
								MainActivity.this)
								.setTitle(R.string.login_facebook)
								.setView(facebookview)
								.setPositiveButton(R.string.login,
										new DialogInterface.OnClickListener() {

											@Override
											public void onClick(
													DialogInterface arg0,
													int arg1) {
												String user_name = username
														.getText().toString();
												String user_pass = password
														.getText().toString();
												if ("".equals(user_name.trim())
														|| "".equals(user_pass
																.trim())) {
													Toast.makeText(
															getApplicationContext(),
															"username or password is null",
															Toast.LENGTH_SHORT)
															.show();
													return;
												}

												/* if(save.isChecked()){ */
												putSharedPreferencesKeyValue(
														"facebook_username",
														user_name);
												putSharedPreferencesKeyValue(
														"facebook_password",
														user_pass);
												/*
												 * }
												 * putSharedPreferencesKeyValue
												 * ("facebook_autologin","" +
												 * auto.isChecked());
												 */Intent sendIntent = new Intent();
												sendIntent
														.setAction(Constants.MAINSERVER_NLSERVICERECEIVER_ACTION);
												sendIntent
														.putExtra(
																Constants.NOTIFICATION_COMMAND,
																Constants.ACTION_FACEBOOK_LOGIN);
												sendIntent.putExtra("username",
														user_name);
												sendIntent.putExtra("password",
														user_pass);
												sendBroadcast(sendIntent);

												procgressDialog = ProgressDialog
														.show(MainActivity.this,
																getString(R.string.login_facebook),
																"wait");
											}

										})
								.setNegativeButton(R.string.cancel, null).

								create();
						;
					}
					facebookLoginDialog.show();
				} else {
					Intent sendIntent = new Intent();
					sendIntent
							.setAction(Constants.MAINSERVER_NLSERVICERECEIVER_ACTION);
					sendIntent.putExtra(Constants.NOTIFICATION_COMMAND,
							Constants.ACTION_FACEBOOK_LOGOUT);
					sendBroadcast(sendIntent);
				}
			}
			popup.dismiss();
		}

	};

	private void checkUpdate() {
		UpdateVersionTask cv = new UpdateVersionTask(this,
				UpdateVersionTask.UPDATE_TYPE_NORMAL);
		new Thread(cv).start();
	}

	private void checkMainServer() {
		if (!ServiceUtil.isServiceRunning(this, MainService.class.getName())) {
			Intent i = new Intent(this, MainService.class);
			startService(i);
			FLog.i(TAG, "Service is not running, start it.");
		}
	}

	private void registerServiceStateReceiver() {
		sReceiver = new ServiceStateReceiver();
		IntentFilter filter = new IntentFilter();
		filter.addAction(Constants.MAINACTIVITY_NLSERVICERECEIVER_ACTION);
		registerReceiver(sReceiver, filter);
	}

	private void doBindService() {
		bindService(new Intent(this, MainService.class), mConnection,
				Context.BIND_AUTO_CREATE);
	}

	private void doUnbindService() {
		if (mService != null) {
			try {
				Message msg = Message.obtain(null,
						Constants.MSG_UNREGISTER_CLIENT);
				msg.replyTo = mMessenger;
				mService.send(msg);
			} catch (RemoteException e) {
				FLog.w(TAG, "Unregister client fail.");
			}
		}

		unbindService(mConnection);

		FLog.i(TAG, "Unbind service finish.");
	}

	private ServiceConnection mConnection = new ServiceConnection() {
		public void onServiceConnected(ComponentName className, IBinder service) {
			if (null == mService) {
				mService = new Messenger(service);
			}
			try {
				Message msg = Message.obtain(null,
						Constants.MSG_REGISTER_CLIENT_REQ);
				msg.replyTo = mMessenger;
				mService.send(msg);
			} catch (RemoteException e) {
				e.printStackTrace();
			}
			// check websocket state
			try {
				Message msg = Message.obtain(null,
						Constants.MSG_WEBSOCKET_STATE);
				msg.replyTo = mMessenger;
				mService.send(msg);
			} catch (RemoteException e) {
				e.printStackTrace();
			}
			FLog.i(TAG, "Service connected, register client finished.");
		}

		public void onServiceDisconnected(ComponentName className) {
			mService = null;

			FLog.w(TAG, "Service disconnected.");
		}
	};

	class ServiceStateReceiver extends BroadcastReceiver {
		@Override
		public void onReceive(Context context, final Intent intent) {
			
			facebookstate = intent.getExtras().getBoolean("facebookstate");
			String login = intent.getExtras().getString("login");
			if (login != null) {
				try {
					boolean loginb = Boolean.parseBoolean(login);
					if (procgressDialog != null) {
						procgressDialog.dismiss();
					}
					if (loginb) {
						Toast.makeText(MainActivity.this,
								"facebook accout login success",
								Toast.LENGTH_LONG).show();
					} else {
						Toast.makeText(MainActivity.this,
								"facebook accout login fail", Toast.LENGTH_LONG)
								.show();
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
			}

			if (facebookstate) {
				menuLoginFacebook.setText(R.string.logout_facebook);
			} else {
				menuLoginFacebook.setText(R.string.login_facebook);
			}

			if (intent.getExtras().containsKey("data")) {
				boolean ret = intent.getExtras().getBoolean("data");
				FLog.i(TAG,
						"ServiceStateReceiver notification serverice state :"
								+ (ret == true ? "  running." : " stop"));

				if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.KITKAT) {
					if (!ret && app.isShowSetNotification()) {
						notificationSetting.setVisibility(View.VISIBLE);
					} else if (ret) {
						notificationSetting.setVisibility(View.GONE);
					}
				}
				app.setShowSetNotification(false);
			}
		}

	}

	private class IncomingHandler extends Handler {
		@Override
		public void handleMessage(Message msg) {
			FLog.i(TAG, "Message type: " + msg.what);
			switch (msg.what) {
			case Constants.MSG_SERVICE_STATE: {
				int s =  msg.arg1;
				FLog.i(TAG, "state:" +s + ": " + new State(s).toString());
				showView(msg.arg2);
				switch (s) {
				case State.STATE_DISCONNECTED: {
					stateContent.setTextColor(getResources().getColor(
							R.color.state_default_color));
					if(NetworkManager.getInstance().getState() > 0){
						stateContent
							.setText(getString(R.string.state_ws_disconnected));
					}else{
						stateContent
						.setText(getString(R.string.wifi_state_disconnected));
					}
					state.setImageResource(R.drawable.connet_nol);
					stateImageIndex = 0;
					break;
				}
				case State.STATE_CONNECTING: {
					stateContent.setTextColor(getResources().getColor(
							R.color.state_working_color));
					stateContent
							.setText(getString(R.string.state_ws_connecting));

					FLog.i(TAG, getString(R.string.state_ws_connecting));
					stateImageIndex = 1;
					handler.post(run);
					break;
				}
				case State.STATE_RECONNECTING: {
					stateContent.setTextColor(getResources().getColor(
							R.color.state_working_color));
					stateContent
							.setText(getString(R.string.state_ws_reconnecting));

					FLog.i(TAG, getString(R.string.state_ws_reconnecting));
					stateImageIndex = 1;
					handler.post(run);
					break;
				}
				case State.STATE_CONNECTED: {
					//Android 与服务器建立连接成功. 此处没有要提示用户的？
					
					break;
				}
				case State.STATE_PAIRING: {
					stateContent.setTextColor(getResources().getColor(
							R.color.state_working_color));
					stateContent.setText(getString(R.string.state_pairing));
					break;
				}
				case State.STATE_PAIRED: {
					stateContent.setTextColor(getResources().getColor(
							R.color.state_working_color));
					stateContent.setText(getString(R.string.state_finished));
					state.setImageResource(R.drawable.conneted);
					stateImageIndex = 0;
					FLog.i(TAG, getString(R.string.state_finished));
					break;
				}
				case State.STATE_CONTACTS: {
					break;
				}
				case State.STATE_ALL_SMS: {

					stateContent.setTextColor(getResources().getColor(
							R.color.state_working_color));
					stateContent
							.setText(getString(R.string.state_send_all_sms));
					break;
				}
				case State.STATE_PHONE_INFO: {
					break;
				}
				case State.STATE_ALL_NOTIFICATION: {
					stateContent.setTextColor(getResources().getColor(
							R.color.state_working_color));
					stateContent
							.setText(getString(R.string.state_send_all_notification));
					break;
				}
				case State.STATE_SMS_TOPC: {
//					stateContent.setTextColor(getResources().getColor(
//							R.color.state_working_color));
//					stateContent
//							.setText(getString(R.string.state_send_sms_info_to_pc));
					break;
				}
				case State.STATE_NOTIFICATION_TOPC: {
//					stateContent.setTextColor(getResources().getColor(
//							R.color.state_working_color));
//					stateContent
//							.setText(getString(R.string.state_send_notification_info_to_pc));

					FLog.i(TAG,
							getString(R.string.state_send_notification_info_to_pc));

					break;
				}
				case State.STATE_SYNCHRONIZED: {
					stateContent.setTextColor(getResources().getColor(
							R.color.state_working_color));
					stateContent
							.setText(getString(R.string.state_synchronized));
					state.setImageResource(R.drawable.conneted);
					stateImageIndex = 0;
					break;
				}
				case State.STATE_FINISHED: {
					stateContent.setTextColor(getResources().getColor(
							R.color.state_working_color));
					stateContent.setText(getString(R.string.state_synchronized));
					state.setImageResource(R.drawable.conneted);
					stateImageIndex = 0;
					FLog.i(TAG, getString(R.string.state_finished));
					break;
				}
				case State.STATE_PC_DISCONNECT: {
					stateContent.setTextColor(getResources().getColor(
							R.color.state_working_color));
					stateContent.setText(getString(R.string.state_pc_disconnect));
					state.setImageResource(R.drawable.conneted);
					stateImageIndex = 0;
					break;
				}
				case State.STATE_CONTACTS_FAIL: {
//					stateContent.setTextColor(getResources().getColor(
//							R.color.state_fail_color));
//					stateContent
//							.setText(getString(R.string.state_get_all_contacts_fail));
					break;
				}
				case State.STATE_SMS_FAIL: {
//					stateContent.setTextColor(getResources().getColor(
//							R.color.state_fail_color));
//					stateContent
//							.setText(getString(R.string.state_get_all_sms_fail));
					break;
				}
				case State.STATE_NOTIFICATION_FAIL: {
//					stateContent.setTextColor(getResources().getColor(
//							R.color.state_fail_color));
//					stateContent
//							.setText(getString(R.string.state_get_all_notification_fail));
					break;
				}
				case State.STATE_PHONE_INFO_FAIL: {
//					stateContent.setTextColor(getResources().getColor(
//							R.color.state_fail_color));
//					btnActionText
//							.setText(getString(R.string.state_get_phone_info_fail));
					break;
				}
				case State.STATE_CONFICT: {
					app.setHasLogin(false);
					
					if("lenovoid".equals(getSharedPreferencesKeyValue(Constants.LENOVOID_LOGIN_CONFICT))){
						AlertDialog  confictDialog = new AlertDialog.Builder(MainActivity.this)
						.setTitle(R.string.lenovoid_confict_title)
						.setMessage(R.string.lenovoid_confict_message)
						.setPositiveButton(R.string.lenovoid_confict_ok, null).create();
						confictDialog.show();
					}
					break;
				}

				}
			}
			case Constants.MSG_QUERY_CMD_REPLY: {
				Bundle extras = msg.getData();
				int wifiState = extras.getInt("WifiState", -1);
				if (MainActivity.this.oldWifiState > 0 && wifiState > 0) {

				} else {
					if (wifiState > 0) {
						stateContent.setTextColor(getResources().getColor(
								R.color.state_default_color));
						stateContent
								.setText(getString(R.string.state_ws_disconnected));

						btnActionText
								.setText(getString(R.string.scan_qrcode_connect));
						connect.setOnClickListener(clickListener);
//						lenovoid.setVisibility(View.VISIBLE);
//						stateImage.setVisibility(View.GONE);
						state.setImageResource(R.drawable.connet_nol);
						stateImageIndex = 0;
					} else if (wifiState == 0) {
						stateContent.setTextColor(getResources().getColor(
								R.color.state_default_color));
						stateContent
								.setText(getString(R.string.state_network_disconnected));

						btnActionText
								.setText(getString(R.string.scan_qrcode_connect));
						// connect.setBackgroundColor(0);
						connect.setOnClickListener(null);
						state.setImageResource(R.drawable.connet_nol);
						stateImageIndex = 0;
					}
				}
				MainActivity.this.oldWifiState = wifiState;
				break;
			}

			default:
				super.handleMessage(msg);
			}
		}
	}

	private void sendMsg2Service(int msgID, int arg, Bundle extras) {
		if (mService != null) {
			try {
				Message msg = Message.obtain(null, msgID);
				if (null != msg) {
					msg.arg1 = arg;
					msg.replyTo = mMessenger;
					msg.setData(extras);
					mService.send(msg);
				}
			} catch (RemoteException ignored) {
				FLog.w(TAG, "Send message to service fail.");
			}
		}else{
			FLog.e(TAG, "can't send message to service.");
		}
	}

	private void sendQCode2Service(String sKey, String sParam, int iMsgId) {
		Bundle extras = new Bundle();
		extras.putString(sKey, sParam);
		sendMsg2Service(iMsgId, 0, extras);
		FLog.i(TAG, "send qrcode to connect.");
	}
	
	private void sendLenovoid2Service(String sKey, String sParam, int iMsgId) {
		Bundle extras = new Bundle();
		extras.putString(sKey, sParam);
		sendMsg2Service(iMsgId, 1, extras);
		FLog.i(TAG, "send lenovoid to connect.");
	}

	private String getVersionCode() {
		String version = "";
		try {
			PackageManager manager = this.getPackageManager();
			PackageInfo info = manager.getPackageInfo(getPackageName(), 0);
			version = info.versionName;
		} catch (NameNotFoundException e) {
			e.printStackTrace();
		}
		return version;
	}

	private boolean getVersionValue(String versionCode) {
		boolean ret = false;
		SharedPreferences sh = getSharedPreferences(Constants.VERSION,
				Context.MODE_PRIVATE);
		ret = sh.getBoolean(versionCode, false);
		return ret;
	}

	private void setVersionValue(String key, boolean value) {
		SharedPreferences sh = getSharedPreferences(Constants.VERSION,
				Context.MODE_PRIVATE);
		Editor editor = sh.edit();
		editor.putBoolean(key, value);
		editor.commit();
	}

	private String getSharedPreferencesKeyValue(String key) {
		SharedPreferences sh = getSharedPreferences(Constants.VERSION,
				Context.MODE_PRIVATE);
		return sh.getString(key, null);
	}

	private void putSharedPreferencesKeyValue(String key, String value) {
		SharedPreferences sh = getSharedPreferences(Constants.VERSION,
				Context.MODE_PRIVATE|Context.MODE_MULTI_PROCESS );
		Editor editor = sh.edit();
		editor.putString(key, value);
		editor.commit();
	}

	public int dpToPx(int dp) {
		DisplayMetrics displayMetrics = getResources().getDisplayMetrics();
		int px = Math.round(dp
				* (displayMetrics.xdpi / DisplayMetrics.DENSITY_DEFAULT));
		return px;
	}

	private Runnable run = new Runnable() {

		@Override
		public void run() {
			if (stateImageIndex == 4) {
				state.setImageResource(R.drawable.conneting_4);
				stateImageIndex = 1;
				handler.postDelayed(run, 500);
				return;
			}
			if (stateImageIndex == 3) {
				state.setImageResource(R.drawable.conneting_3);
				stateImageIndex++;
				handler.postDelayed(run, 1500);
				return;
			}
			if (stateImageIndex == 2) {
				state.setImageResource(R.drawable.conneting_2);
			}
			if (stateImageIndex == 1) {
				state.setImageResource(R.drawable.conneting_1);
			}
			if (stateImageIndex != 0) {
				handler.postDelayed(run, 500);
				stateImageIndex++;
			}
		}

	};
	
	
	private void showView(int connectType){
		switch(connectType){
		case -1:
			connect.setVisibility(View.VISIBLE);
			connect.setOnClickListener(clickListener);
			lenovoid.setVisibility(View.VISIBLE);
			lenovoid.setOnClickListener(clickListener);
			stateImage.setVisibility(View.GONE);
			btnActionText.setText(getString(R.string.scan_qrcode_connect));
			login.setText(R.string.login);
			app.setHasLogin(false);
			break;
		case 0:
			connect.setVisibility(View.VISIBLE);
			connect.setOnClickListener(disconnectListener);
			lenovoid.setVisibility(View.GONE);
			stateImage.setVisibility(View.VISIBLE);
			btnActionText.setText(getString(R.string.scan_qrcode_disconnect));
			break;
		case 1:
			connect.setVisibility(View.GONE);
			lenovoid.setVisibility(View.VISIBLE);
			stateImage.setVisibility(View.VISIBLE);
			login.setText(R.string.logout);
			app.setHasLogin(true);
			break;
		}
	}
	
}