package com.lenovo.linkit.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import android.content.Context;
import android.content.res.AssetManager;

public class AssetUtil {
	private static final int BUFFER_SIZE = 4096;

	public static final InputStream read(Context context, String path) {
		AssetManager assetManager = context.getAssets();
		InputStream inputStream = null;

		try {
			inputStream = assetManager.open(path);
		} catch (IOException e) {
		}

		return inputStream;
	}

	public static final String readAsString(Context context, String path) {
		AssetManager assetManager = context.getAssets();
		InputStream inputStream = null;
		try {
			inputStream = assetManager.open(path);
			return loadTextFile(inputStream);
		} catch (IOException e) {
			return "";
		} finally {
			if (inputStream != null) {
				try {
					inputStream.close();
				} catch (IOException e) {
				}
			}
		}
	}

	private static String loadTextFile(InputStream inputStream) throws IOException {
		ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
		byte[] bytes = new byte[BUFFER_SIZE];
		int len = 0;
		while ((len = inputStream.read(bytes)) > 0) {
			byteStream.write(bytes, 0, len);
		}
		return new String(byteStream.toByteArray(), "UTF8");
	}
}
