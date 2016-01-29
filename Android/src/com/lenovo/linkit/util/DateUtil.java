package com.lenovo.linkit.util;

import java.text.Format;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class DateUtil {
	public static String toReadableDate(final long tick) {
		final Format format = new SimpleDateFormat("yyyy MM dd HH:mm:ss", Locale.US);
		return format.format(tick).toString();
	}
	
	public static long getMillisecondInterval(Date oldTime, Date newTime) {
		return (newTime.getTime() - oldTime.getTime());
	}
}
