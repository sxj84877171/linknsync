package com.lenovo.linkit.log;

import com.lenovo.linkit.R;
import com.lenovo.linkit.Constants;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.text.Html;
import android.text.method.ScrollingMovementMethod;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;
import android.widget.TextView;

public class LogActivity extends Activity {
	private TextView logView;
	private String mActivityLog;
	private String mServiceLog;
	private String mNoServiceLog;
	private int mFile;
	private int mLevel;

	@Override
	protected void onCreate(Bundle bundle) {
		super.onCreate(bundle);
		setContentView(R.layout.activity_log);

		Spinner fileSpinner = (Spinner) this.findViewById(R.id.change_file);
		String[] files = getResources().getStringArray(R.array.log_file);
		ArrayAdapter<String> adapter = new ArrayAdapter<String>(this,
				android.R.layout.simple_spinner_item, files);
		adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		fileSpinner.setAdapter(adapter);
		fileSpinner.setVisibility(View.VISIBLE);

		fileSpinner
				.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {

					@Override
					public void onItemSelected(AdapterView<?> parent,
							View view, int position, long id) {
						mFile = position;

						showLog();
					}

					@Override
					public void onNothingSelected(AdapterView<?> parent) {
						// TODO Auto-generated method stub

					}
				});

		Spinner spinner = (Spinner) this.findViewById(R.id.change_level);
		String[] levels = getResources().getStringArray(R.array.log_level);
		adapter = new ArrayAdapter<String>(this,
				android.R.layout.simple_spinner_item, levels);
		adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		spinner.setAdapter(adapter);
		spinner.setVisibility(View.VISIBLE);

		spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {

			@Override
			public void onItemSelected(AdapterView<?> parent, View view,
					int position, long id) {

				mLevel = position;

				showLog();
			}

			@Override
			public void onNothingSelected(AdapterView<?> parent) {
				// TODO Auto-generated method stub

			}
		});

		logView = (TextView) this.findViewById(R.id.log_content);
		logView.setMovementMethod(ScrollingMovementMethod.getInstance());

		mActivityLog = FLog.getHtmlLogByLevel(Constants.LOG_LEVEL_VERBOSE);

		IntentFilter filter = new IntentFilter(
				Constants.ACTION_SEND_LOG_FROM_SERVICE);
		filter.addAction(Constants.ACTION_SEND_NOTIFICATION_LOG_FROM_SERVICE);
		registerReceiver(mReceiver, filter);

		String[] actions = { Constants.ACTION_GET_LOG_FROM_SERVICE,
				Constants.ACTION_GET_LOG_FROM_NOTIFICATION_SERVICE };
		for (String action : actions) {
			requestLogFromOtherProcess(action);
		}

		mLevel = Constants.LOG_LEVEL_VERBOSE;
		mFile = Constants.LOG_FILE_ACTIVITY;
	}

	@Override
	protected void onDestroy() {
		unregisterReceiver(mReceiver);
		super.onDestroy();
	}
	
	private void showLog() {
		String logMsg = "";
		switch (mFile) {
		case Constants.LOG_FILE_ACTIVITY: {
			if (mActivityLog != null) {
				logMsg = FLog.filterByLevel(mActivityLog,
						mLevel);
			}
			break;
		}
		case Constants.LOG_FILE_SERVICE: {
			if (mServiceLog != null) {
				logMsg = FLog
						.filterByLevel(mServiceLog, mLevel);
			}
			break;
		}
		case Constants.LOG_FILE_NO_SERVICE: {
			if (mNoServiceLog != null) {
				logMsg = FLog
						.filterByLevel(mNoServiceLog, mLevel);
			}
			break;
		}
		}

		logView.setText(Html.fromHtml(logMsg));
	}

	private void requestLogFromOtherProcess(String action) {
		Intent intent = new Intent();
		intent.setAction(action);
		sendBroadcast(intent);
	}

	BroadcastReceiver mReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			String action = intent.getAction();
			if (action.equals(Constants.ACTION_SEND_LOG_FROM_SERVICE)) {
				Bundle bundle = intent.getExtras();
				if (bundle != null) {
					mServiceLog = bundle.getString("log");
				}
			} else if (action
					.equals(Constants.ACTION_SEND_NOTIFICATION_LOG_FROM_SERVICE)) {
				Bundle bundle = intent.getExtras();
				if (bundle != null) {
					mNoServiceLog = bundle.getString("log");
				}
			}
		}
	};
}
