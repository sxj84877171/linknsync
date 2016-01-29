package com.lenovo.linkit.log;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.Log;

import com.lenovo.linkit.Constants;

@SuppressLint("SimpleDateFormat")
public class FLog {
	// format: 2014-10-01 12:00:01 DEBUG|TAG msg
	private static Context mContext = null;
	private static String mFileName = null;
	private static FileOutputStream mOutputStream = null;
	private static FileInputStream mInputStream = null;
	private static BufferedReader mReader = null;
	private static boolean mIsInit = false;

	private static final String CORLOR_GRAY = "gray";
	private static final String CORLOR_BLUE = "blue";
	private static final String CORLOR_GREEN = "green";
	private static final String CORLOR_OLIVE = "olive";
	private static final String CORLOR_RED = "red";
	private static final String CORLOR_PURPLE = "Purple";

	public static void init(Context context, String fileName) {
		if (mIsInit) {
			return;
		}

		mContext = context;
		mOutputStream = null;
		mInputStream = null;
		mReader = null;

		mFileName = fileName;
		createFile(mFileName);

		mIsInit = true;
	}

	public static void uninit() {
		if (!mIsInit) {
			return;
		}

		if (mOutputStream != null) {
			try {
				mOutputStream.close();
				mOutputStream = null;
			} catch (IOException e) {
				e.printStackTrace();
			}
		}

		if (mInputStream != null) {
			try {
				mInputStream.close();
				mInputStream = null;

				mReader.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	@SuppressWarnings("deprecation")
	private static void createFile(String name) {
		try {
			mOutputStream = mContext.openFileOutput(name,
					Context.MODE_WORLD_READABLE | Context.MODE_MULTI_PROCESS);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static void readyForRead() {
		try {
			mInputStream = mContext.openFileInput(mFileName);

			mReader = new BufferedReader(new InputStreamReader(mInputStream));
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
	}

	private static String readLogByLine() {
		if (mReader == null) {
			return null;
		}
		try {
			if (mReader.ready()) {
				String aline = mReader.readLine();

				if (aline != null) {
					Log.i("FLog", aline);
				}

				return aline;
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		return null;
	}

	private static String CorlorFilter(String msg) {
		int level = Constants.LOG_LEVEL_VERBOSE;

		if (msg.contains((Constants.LEVEL_VERBOSE + "|"))) {
			level = Constants.LOG_LEVEL_VERBOSE;
			msg = "<font color=\"" + CORLOR_GRAY + "\">" + msg + "</font>";
		} else if (msg.contains((Constants.LEVEL_DEBUG + "|"))) {
			level = Constants.LOG_LEVEL_DEBUG;
			msg = "<font color=\"" + CORLOR_BLUE + "\">" + msg + "</font>";
		} else if (msg.contains((Constants.LEVEL_INFO + "|"))) {
			level = Constants.LOG_LEVEL_INFO;
			msg = "<font color=\"" + CORLOR_GREEN + "\">" + msg + "</font>";
		} else if (msg.contains((Constants.LEVEL_WARN + "|"))) {
			level = Constants.LOG_LEVEL_WARN;
			msg = "<font color=\"" + CORLOR_OLIVE + "\">" + msg + "</font>";
		} else if (msg.contains((Constants.LEVEL_ERROR + "|"))) {
			level = Constants.LOG_LEVEL_ERROR;
			msg = "<font color=\"" + CORLOR_RED + "\">" + msg + "</font>";
		} else if (msg.contains((Constants.LEVEL_SUCCESS + "|"))) {
			level = Constants.LOG_LEVEL_SUCCESS;
			msg = "<font color=\"" + CORLOR_PURPLE + "\">" + msg + "</font>";
		}

		if (mLevel > level) {
			return "";
		}

		return msg + "<br>";
	}

	public static String filterByLevel(String msg, int level) {
		String[] levels = { Constants.LEVEL_VERBOSE, Constants.LEVEL_DEBUG,
				Constants.LEVEL_INFO, Constants.LEVEL_WARN,
				Constants.LEVEL_ERROR, Constants.LEVEL_SUCCESS };
		int startpos = 0;
		String logString = msg;
		while (true) {
			int start = logString.indexOf('<', startpos);
			if (start < 0) {
				break;
			}

			int end = logString.indexOf("<br>", start + 1);
			if (end < 0) {
				break;
			}

			startpos = end + 4;

			String subString = logString.substring(start, end + 4);
			for (int i = 0; i < level; i++) {
				if (subString.contains(levels[i] + "|")) {
					logString = logString.substring(startpos);
					startpos = 0;
					break;
				}
			}
		}

		return logString;
	}

	private static int mLevel = Constants.LOG_LEVEL_VERBOSE;

	public static String getHtmlLogByLevel(int level) {
		StringBuilder builder = new StringBuilder();

		mLevel = level;
		readyForRead();
		while (true) {
			String aline = readLogByLine();
			if (aline == null) {
				break;
			}
			builder.append(CorlorFilter(aline));
		}

		return builder.toString();
	}

	private static void writeLine(String msg) {
		if ((msg != null) && (mOutputStream != null)) {
			try {
				mOutputStream.write(msg.getBytes());
				mOutputStream.write("\r\n".getBytes());
				mOutputStream.flush();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	private static void logMessageFormat(String level, String tag, String msg) {
		String logmsg = getTimeStamp();

		logmsg += " " + level + "|" + tag + " " + msg;
		writeLine(logmsg);
	}

	private static String getTimeStamp() {
		SimpleDateFormat sDateFormat = new SimpleDateFormat(
				"yyyy-MM-dd hh:mm:ss:SSS");

		return sDateFormat.format(new java.util.Date());
	}

	public static void verbose(String tag, String msg) {
		Log.v(tag, msg);
		logMessageFormat(Constants.LEVEL_VERBOSE, tag, msg);
	}

	public static void v(String tag, String msg) {
		Log.v(tag, msg);
		logMessageFormat(Constants.LEVEL_VERBOSE, tag, msg);
	}

	public static void debug(String tag, String msg) {
		Log.d(tag, msg);
		logMessageFormat(Constants.LEVEL_DEBUG, tag, msg);
	}

	public static void d(String tag, String msg) {
		Log.d(tag, msg);
		logMessageFormat(Constants.LEVEL_DEBUG, tag, msg);
	}

	public static void info(String tag, String msg) {
		Log.i(tag, msg);
		logMessageFormat(Constants.LEVEL_INFO, tag, msg);
	}

	public static void i(String tag, String msg) {
		Log.i(tag, msg);
		logMessageFormat(Constants.LEVEL_INFO, tag, msg);
	}

	public static void warn(String tag, String msg) {
		Log.w(tag, msg);
		logMessageFormat(Constants.LEVEL_WARN, tag, msg);
	}

	public static void w(String tag, String msg) {
		Log.w(tag, msg);
		logMessageFormat(Constants.LEVEL_WARN, tag, msg);
	}

	public static void w(String tag, String msg, Throwable e) {
		msg = msg + "\r\n" + getStackTraceMessage(e);
		Log.w(tag, msg);
		logMessageFormat(Constants.LEVEL_WARN, tag, msg);
	}

	public static void error(String tag, String msg) {
		Log.e(tag, msg);
		logMessageFormat(Constants.LEVEL_ERROR, tag, msg);
	}

	public static void e(String tag, String msg) {
		Log.e(tag, msg);
		logMessageFormat(Constants.LEVEL_ERROR, tag, msg);
	}

	public static void e(String tag, String msg, Throwable e) {
		msg = msg + "\r\n" + getStackTraceMessage(e);
		Log.e(tag, msg);
		logMessageFormat(Constants.LEVEL_ERROR, tag, msg);
	}

	public static void success(String tag, String msg) {
		Log.i(tag + "-SUCCESS", msg);
		logMessageFormat(Constants.LEVEL_SUCCESS, tag, msg);
	}

	public static void s(String tag, String msg) {
		Log.i(tag + "-SUCCESS", msg);
		logMessageFormat(Constants.LEVEL_SUCCESS, tag, msg);
	}

	private static String getStackTraceMessage(Throwable e) {
		StringBuilder sb = new StringBuilder();
		if (e != null) {
			StackTraceElement[] ste = e.getStackTrace();
			if (ste != null) {
				for (StackTraceElement s : ste) {
					sb.append("ClassName:").append(s.getClassName())
							.append("\r\n");
					sb.append("MethodName:").append(s.getMethodName())
							.append("\r\n");
					sb.append("LineNumber:").append(s.getLineNumber())
							.append("\r\n");
				}
			}
			sb.append(e.getMessage());
		}
		return sb.toString();
	}
}
