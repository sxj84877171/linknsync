package com.lenovo.linkit;

import net.sourceforge.zbar.Config;
import net.sourceforge.zbar.Image;
import net.sourceforge.zbar.ImageScanner;
import net.sourceforge.zbar.Symbol;
import net.sourceforge.zbar.SymbolSet;
import android.app.Activity;
import android.content.Intent;
import android.hardware.Camera;
import android.hardware.Camera.Parameters;
import android.hardware.Camera.PreviewCallback;
import android.hardware.Camera.Size;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;

import com.lenovo.linkit.util.CameraUtil;

public class CaptureActivity extends Activity implements PreviewCallback {
	public static final String ACTION_SCAN_QRCODE = "linkit.intent.action.SCAN_QRCODE";
	public static final String EXTRA_CONNECTION_STATUS = "linkit.intent.extra.CONNECTION_STATUS";
	private Camera mCamera;
	private CameraPreview mPreview;
	
	private ImageScanner mScanner;

	static {
		System.loadLibrary("iconv");
	}

	private final PreviewCallback mPreviewCallback = new PreviewCallback() {
		@Override
		public void onPreviewFrame(final byte[] data, final Camera camera) {
			final Parameters parameters = camera.getParameters();
			final Size size = parameters.getPreviewSize();

			final Image image = new Image(size.width, size.height, "Y800");
			image.setData(data);

			final int scan = mScanner.scanImage(image);

			if (scan != 0) {
				final SymbolSet symbols = mScanner.getResults();
				for (final Symbol symbol : symbols) {
					if (symbol.getType() == Symbol.QRCODE) {
						String address = symbol.getData();
						if (address
								.matches("^\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}$") || address.startsWith(Constants.LENOVOID_HEAD)) {
							mCamera.stopPreview();
							Intent resultIntent = new Intent();
							Bundle bundle = new Bundle();
							bundle.putString("QCode", address);
							resultIntent.putExtras(bundle);
							setResult(RESULT_OK, resultIntent);

							CaptureActivity.this.finish();
							break;
						} else {
						}
					}
				}
			}
		}
	};

	@Override
	public void onBackPressed() {
		this.finish();
	}
	
	@Override
	public void onCreate(final Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		requestWindowFeature(Window.FEATURE_NO_TITLE);

		this.setContentView(R.layout.activity_capture);

		mCamera = CameraUtil.getCameraInstance();

		mScanner = new ImageScanner();
		mScanner.setConfig(0, Config.X_DENSITY, 3);
		mScanner.setConfig(0, Config.Y_DENSITY, 3);

		mPreview = new CameraPreview(this);
		mPreview.setCamera(mCamera).setPreviewCallback(mPreviewCallback);

		final FrameLayout preview = (FrameLayout) findViewById(R.id.cameraPreview);
		setCameraReviewSize(preview, mCamera);
		preview.addView(mPreview);

		final RelativeLayout layoutFloating = (RelativeLayout) findViewById(R.id.layoutFloating);
		layoutFloating.bringToFront();

	}

	private void setCameraReviewSize(FrameLayout previewLayout, Camera camera) {
		Parameters parameters = camera.getParameters();
		Size size = parameters.getPreviewSize();
		float imageWidth = size.height;
		float imageHeight = size.width;

		DisplayMetrics metric = new DisplayMetrics();
		getWindowManager().getDefaultDisplay().getMetrics(metric);
		float screenWidth = metric.widthPixels;
		float screenHeight = metric.heightPixels;

		float widthScale = screenWidth / imageWidth;
		float heightScale = screenHeight / imageHeight;

		float scale = widthScale;
		if (widthScale > heightScale) {
			scale = heightScale;
		}

		LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
				(int) (imageWidth * scale), (int) (imageHeight * scale));

		previewLayout.setLayoutParams(params);
	}

	@Override
	public void onPause() {
		super.onPause();
		releaseCamera();
	}

	@Override
	public void onResume() {
		super.onResume();

		final Camera c = CameraUtil.getCameraInstance();
		if (null != c) {
			mCamera = c;
			mPreview.setCamera(mCamera);
		}
	}

	private void releaseCamera() {
		if (mCamera != null) {
			mCamera.setPreviewCallback(null);
			mCamera.cancelAutoFocus();
			mCamera.stopPreview();
			mCamera.release();
			mCamera = null;
		}
	}

	@Override
	public void onPreviewFrame(byte[] data, Camera camera) {
		final Parameters parameters = camera.getParameters();
		final Size size = parameters.getPreviewSize();

		final Image image = new Image(size.width, size.height, "Y800");
		image.setData(data);

		final int scan = mScanner.scanImage(image);

		if (scan != 0) {
			mCamera.stopPreview();
			final SymbolSet symbols = mScanner.getResults();
			for (final Symbol symbol : symbols) {
				if (symbol.getType() == Symbol.QRCODE) {
					String address = symbol.getData();
					Intent resultIntent = new Intent();
					Bundle bundle = new Bundle();
					bundle.putString("QCode", address);
					resultIntent.putExtras(bundle);
					this.setResult(RESULT_OK, resultIntent);
					CaptureActivity.this.finish();
				}
			}
		}
	}
}
