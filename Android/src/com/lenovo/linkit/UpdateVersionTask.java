package com.lenovo.linkit;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import org.xmlpull.v1.XmlPullParser;

import com.lenovo.linkit.R;
import com.lenovo.linkit.log.FLog;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;
import android.util.Xml;
import android.widget.Toast;

public class UpdateVersionTask implements Runnable {

	private String TAG = UpdateVersionTask.class.getName();
	private final int UPDATA_NONEED = 0;
	private final int UPDATA_CLIENT = 1;
	private final int GET_UNDATAINFO_ERROR = 2;
	private final int SDCARD_NOMOUNTED = 3;
	private final int DOWN_ERROR = 4;

	public static final int UPDATE_TYPE_NORMAL = 0;
	public static final int UPDATE_TYPE_CHECK = 1;

	private UpdateInfo info;
	Context mContent;
	private int mUpdateType;

	UpdateVersionTask(Context context, int type) {
		mContent = context;
		mUpdateType = type;
	}

	private String getVersionName() throws Exception {
		PackageManager packageManager = mContent.getPackageManager();
		PackageInfo packInfo = packageManager.getPackageInfo(
				mContent.getPackageName(), 0);

		return packInfo.versionName;
	}

	@Override
	public void run() {
		try {
			UserSetting.initSetting(mContent);
			String httpServer = UserSetting.getHttpServerAddress();

			String path = String.format("http://%s/update.xml", httpServer);

			FLog.i(TAG, "Upgrade path: " + path);

			URL url = new URL(path);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			if (conn == null) {
				FLog.e(TAG, "Can not connect upgrade server: " + httpServer);
				return;
			}

			conn.setConnectTimeout(5000);

			InputStream is = conn.getInputStream();
			info = getUpdateInfo(is);
			String sLocalVersion = getVersionName();

			if (compareVersion(sLocalVersion, info.getVersion()) >= 0) {
				if (mUpdateType == UPDATE_TYPE_CHECK) {
					Message msg = new Message();
					msg.what = UPDATA_NONEED;
					handler.sendMessage(msg);
				}
			} else {
				Message msg = new Message();
				msg.what = UPDATA_CLIENT;
				handler.sendMessage(msg);
			}
		} catch (Exception e) {
			Message msg = new Message();
			msg.what = GET_UNDATAINFO_ERROR;
			handler.sendMessage(msg);
			e.printStackTrace();
		}
	}

	private int compareVersion(String version1, String version2) {
		String[] v1s = version1.split("\\.");
		String[] v2s = version2.split("\\.");
		for (int i = 0; i < v1s.length; i++) {
			if (Integer.parseInt(v1s[i]) > Integer.parseInt(v2s[i])) {
				return 1;
			} else if (Integer.parseInt(v1s[i]) < Integer.parseInt(v2s[i])) {
				return -1;
			}
		}
		if (v2s.length > v1s.length) {
			return -1;
		}
		return 0;
	}

	private UpdateInfo getUpdateInfo(InputStream is) throws Exception {
		XmlPullParser parser = Xml.newPullParser();
		parser.setInput(is, "utf-8");
		int type = parser.getEventType();
		UpdateInfo info = new UpdateInfo();

		while (type != XmlPullParser.END_DOCUMENT) {
			switch (type) {
			case XmlPullParser.START_TAG:
				if ("version".equals(parser.getName())) {
					info.setVersion(parser.nextText()); // get version number
					
				} else if (!Constants.IS_TEST_BUILD && "url".equals(parser.getName())) {
					info.setUrl(parser.nextText()); // get the updated apk file

				} else if (Constants.IS_TEST_BUILD && ("testUrl".equals(parser.getName()))) {
					info.setUrl(parser.nextText()); // get the updated test apk file
					
				} else if ("description".equals(parser.getName())) {
					info.setDescription(parser.nextText()); // get the
															// description file
				}
				break;
			}
			type = parser.next();
		}
		return info;
	}

	@SuppressLint("HandlerLeak")
	Handler handler = new Handler() {

		@Override
		public void handleMessage(Message msg) {
			// TODO Auto-generated method stub
			super.handleMessage(msg);
			switch (msg.what) {
			case UPDATA_NONEED:
				Toast.makeText(mContent, R.string.s_update_version_match,
						Toast.LENGTH_SHORT).show();
				break;
			case UPDATA_CLIENT:
				showUpdateDialog();
				break;
			case GET_UNDATAINFO_ERROR:
				Toast.makeText(mContent,
						R.string.s_update_get_server_information_failed,
						Toast.LENGTH_SHORT).show();
				break;
			case SDCARD_NOMOUNTED:
				Toast.makeText(mContent, R.string.s_update_sd_card_unavailable,
						Toast.LENGTH_SHORT).show();
				break;
			case DOWN_ERROR:
				Toast.makeText(mContent, R.string.s_update_download_failed,
						Toast.LENGTH_SHORT).show();
				break;
			}
		}
	};

	protected void showUpdateDialog() {
		AlertDialog.Builder builder = new AlertDialog.Builder(mContent);
		builder.setTitle(R.string.s_update_title);
		builder.setMessage(info.getDescription());

		builder.setPositiveButton(R.string.s_smart_confirm,
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						downLoadApk();
					}
				});

		builder.setNegativeButton(R.string.s_smart_cancel,
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
					}
				});

		AlertDialog dialog = builder.create();
		dialog.show();
	}

	protected void downLoadApk() {
		final ProgressDialog pd; // 进度条对话框
		pd = new ProgressDialog(mContent);
		pd.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
		pd.setMessage(mContent.getString(R.string.s_update_download));
		pd.setCancelable(false);

		if (!Environment.getExternalStorageState().equals(
				Environment.MEDIA_MOUNTED)) {
			Message msg = new Message();
			msg.what = SDCARD_NOMOUNTED;
			handler.sendMessage(msg);
		} else {
			pd.show();

			new Thread() {
				@Override
				public void run() {
					try {
						File file = getFileFromServer(info.getUrl(), pd);
						sleep(1000);
						installApk(file);
						pd.dismiss();

					} catch (Exception e) {
						Message msg = new Message();
						msg.what = DOWN_ERROR;
						handler.sendMessage(msg);
						e.printStackTrace();
					}
				}
			}.start();
		}
	}

	protected void installApk(File file) {
		Intent intent = new Intent();
		intent.setAction(Intent.ACTION_VIEW);
		intent.setDataAndType(Uri.fromFile(file),
				"application/vnd.android.package-archive");
		mContent.startActivity(intent);
	}

	File getFileFromServer(String path, ProgressDialog pd) throws Exception {

		if (Environment.getExternalStorageState().equals(
				Environment.MEDIA_MOUNTED)) {
			URL url = new URL(path);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
			conn.setConnectTimeout(5000);
			// get file size
			pd.setMax(conn.getContentLength());
			InputStream is = conn.getInputStream();
			File file = new File(Environment.getExternalStorageDirectory(),
					"update.apk");
			FileOutputStream fos = new FileOutputStream(file);
			BufferedInputStream bis = new BufferedInputStream(is);
			byte[] buffer = new byte[1024];
			int len;
			int total = 0;
			while ((len = bis.read(buffer)) != -1) {
				fos.write(buffer, 0, len);
				total += len;
				pd.setProgress(total);
			}
			fos.close();
			bis.close();
			is.close();
			return file;
		} else {
			return null;
		}
	}

	private class UpdateInfo {
		private String version;
		private String url;
		private String description;

		public String getVersion() {
			return version;
		}

		public void setVersion(String version) {
			this.version = version;
		}

		public String getUrl() {
			return url;
		}

		public void setUrl(String url) {
			this.url = url;
		}

		public String getDescription() {
			return description;
		}

		public void setDescription(String description) {
			this.description = description;
		}
	}
}
