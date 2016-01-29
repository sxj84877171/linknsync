package com.lenovo.linkit.database;

import com.lenovo.linkit.log.FLog;

import android.content.ContentProvider;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.UriMatcher;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.net.Uri;
import android.os.Environment;

public class DBProvider extends ContentProvider {
	private String TAG = DBProvider.class.getSimpleName();
	private SQLiteDatabase mSqlDb = null;
	private static final UriMatcher sUriMatcher = new UriMatcher(
			UriMatcher.NO_MATCH);

	static {
		sUriMatcher.addURI(DBColumnField.PROVIDER,
				DBColumnField.SMS_TABLE_QUERY_FLAG,
				DBColumnField.SMS_TABLE_QUERY_INDEX);
		sUriMatcher.addURI(DBColumnField.PROVIDER,
				DBColumnField.SMS_TABLE_INSERT_FLAG,
				DBColumnField.SMS_TABLE_INSERT_INDEX);
		sUriMatcher.addURI(DBColumnField.PROVIDER,
				DBColumnField.SMS_TABLE_DELETE_FLAG,
				DBColumnField.SMS_TABLE_DELETE_INDEX);
	}

	@Override
	public boolean onCreate() {
		String outFileName = Environment.getExternalStorageDirectory()
				+ "/linkit/" + DBColumnField.DATABASE_NAME;

		mSqlDb = openDB(outFileName);

		return null != mSqlDb;
	}

	private SQLiteDatabase openDB(String file) {
		try {
			int flag = SQLiteDatabase.OPEN_READWRITE;

			SQLiteDatabase db = SQLiteDatabase.openDatabase(file, null, flag);
			if (db == null) {
				FLog.e(TAG, "Open database fail, SQLiteDatabase null.");
			}

			return db;
		} catch (Throwable e) {
			FLog.e(TAG, "Open database fail, exception.");

			return null;
		}
	}

	@Override
	public Cursor query(Uri uri, String[] projection, String selection,
			String[] selectionArgs, String sortOrder) {
		Cursor cursor = null;

		if (null == mSqlDb) {
			return null;
		}

		switch (sUriMatcher.match(uri)) {
		case DBColumnField.SMS_TABLE_INSERT_INDEX: {
			cursor = mSqlDb.query(DBColumnField.SMS_TABLE, projection,
					selection, selectionArgs, null, null, null);

			break;
		}
		default:
			break;
		}

		return cursor;
	}

	@Override
	public String getType(Uri uri) {
		return null;
	}

	@Override
	public Uri insert(Uri uri, ContentValues values) {

		switch (sUriMatcher.match(uri)) {
		case DBColumnField.SMS_TABLE_INSERT_INDEX: {
			long raw_ID = mSqlDb.insert(DBColumnField.SMS_TABLE, null, values);

			if (raw_ID >= 0) {
				Uri newUri = ContentUris.withAppendedId(uri, raw_ID);
				return newUri;
			}
			break;
		}
		}

		return null;
	}

	@Override
	public int update(Uri uri, ContentValues values, String selection,
			String[] selectionArgs) {

		return 0;
	}

	@Override
	public int delete(Uri uri, String selection, String[] selectionArgs) {

		int iCount = 0;

		switch (sUriMatcher.match(uri)) {
		case DBColumnField.SMS_TABLE_DELETE_INDEX: {
			iCount = mSqlDb.delete(DBColumnField.SMS_TABLE, selection,
					selectionArgs);
			break;
		}
		}

		return iCount;
	}
}
