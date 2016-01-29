package com.lenovo.linkit;

import java.io.IOException;

import android.content.Context;
import android.hardware.Camera;
import android.hardware.Camera.Parameters;
import android.hardware.Camera.PreviewCallback;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

import com.lenovo.linkit.log.FLog;

public class CameraPreview extends SurfaceView implements SurfaceHolder.Callback {
	private static final String TAG = CameraPreview.class.getSimpleName();
	private final SurfaceHolder mHolder;
	private Camera mCamera;
	private PreviewCallback mPreviewCallback;

	public CameraPreview(final Context context) {
		super(context);

		mHolder = getHolder();
		mHolder.addCallback(this);
	}

	public CameraPreview setCamera(final Camera camera) {
		mCamera = camera;

		final Camera.Parameters parameters = camera.getParameters();
		parameters.setFocusMode(Parameters.FOCUS_MODE_CONTINUOUS_PICTURE); // auto focus
		mCamera.setParameters(parameters);
		
		/*if (parameters.getSupportedFocusModes().contains(Parameters.FOCUS_MODE_AUTO)) {
			parameters.setFocusMode(Parameters.FOCUS_MODE_AUTO);
			mCamera.setParameters(parameters);
		}*/
		return this;
	}

	public CameraPreview setPreviewCallback(final PreviewCallback previewCallback) {
		mPreviewCallback = previewCallback;
		return this;
	}

	@Override
	public void surfaceCreated(final SurfaceHolder holder) {
		try {
			mCamera.setPreviewDisplay(holder);
		} catch (final IOException e) {
			FLog.w(TAG, "Error setting camera preview surface holder.");
		}
	}

	@Override
	public void surfaceDestroyed(final SurfaceHolder holder) {
	}

	@Override
	public void surfaceChanged(final SurfaceHolder holder, final int format, final int width,
			final int height) {
		if (mHolder.getSurface() == null) {
			return;
		}

		try {
			mCamera.stopPreview();
		} catch (final Exception e) {
		}

		try {
			mCamera.setDisplayOrientation(90);
			mCamera.setPreviewDisplay(mHolder);
			mCamera.setPreviewCallback(mPreviewCallback);			
			mCamera.startPreview();
		} catch (final Exception e) {
			FLog.w(TAG, "Error starting camera preview: " + e.getMessage());
		}
	}

	@Override
	public boolean onTouchEvent(final MotionEvent event) {
		if (event.getAction() == MotionEvent.ACTION_DOWN) {
			mCamera.autoFocus(null);
		}
		return true;
	}
}
