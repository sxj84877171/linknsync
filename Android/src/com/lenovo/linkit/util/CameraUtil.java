package com.lenovo.linkit.util;

import android.hardware.Camera;

public class CameraUtil {
	public static Camera getCameraInstance() {
		Camera c = null;

		try {
			c = Camera.open();
		} catch (final Exception e) {
		}

		return c;
	}
}
