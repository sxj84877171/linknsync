package com.lenovo.linkit.util;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import android.content.Context;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.res.Resources;
import android.content.res.Resources.NotFoundException;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;

public class ResourceUtil {
	public static String getString(final Context context, final int id) {
		return context.getResources().getString(id);
	}

	public static Drawable getIcon(final Context context, String packageName,
			final int id) {

		//return context.getPackageManager().getDrawable(packageName, id, null);
		Drawable d = null ;
		try {
			Resources r = context.getPackageManager().getResourcesForApplication(packageName);
			if(r != null){
				try {
					d = r.getDrawable(id);
				} catch (NotFoundException e) {
					if(d == null){
						throw new Exception();
					}
				}
			}
			if(d == null){
				throw new Exception();
			}
			
		} catch (Exception e1) {
			try {
				d = context.getPackageManager().getApplicationIcon(packageName);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		
		
		return d;
	}

	public static File drawableTofile(Drawable drawable, CompressFormat cf, String path) {
		File file = new File(path);
		Bitmap bitmap = ((BitmapDrawable) drawable).getBitmap();
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		bitmap.compress(cf, 100, bos);
		byte[] bitmapdata = bos.toByteArray();
		FileOutputStream fos;
		try {
			fos = new FileOutputStream(file);
			fos.write(bitmapdata);
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return file;

	}
}
