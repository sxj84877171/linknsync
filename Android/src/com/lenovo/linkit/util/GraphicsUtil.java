package com.lenovo.linkit.util;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;

import android.content.Context;
import android.content.pm.PackageManager.NameNotFoundException;
import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;

public class GraphicsUtil {
	public static Drawable getDrawable(final Context context, final String packageName,
			final int resourceID) {
		Drawable drawable = null;
		Context remoteContext = null;

		try {
			remoteContext = context.createPackageContext(packageName, 0);
			drawable = remoteContext.getResources().getDrawable(resourceID);
		} catch (final NameNotFoundException e) {
			e.printStackTrace();
		}

		return drawable;
	}

	public static Bitmap convertToBitmap(final Drawable drawable) {
		return ((BitmapDrawable) drawable).getBitmap();
	}

	public static OutputStream getOutputStream(final Bitmap bitmap) {
		final ByteArrayOutputStream stream = new ByteArrayOutputStream();
		bitmap.compress(Bitmap.CompressFormat.JPEG, 100, stream);
		return stream;
	}
}
