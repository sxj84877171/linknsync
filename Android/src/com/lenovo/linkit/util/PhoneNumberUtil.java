package com.lenovo.linkit.util;

import android.telephony.PhoneNumberUtils;

import com.lenovo.linkit.Constants;

public class PhoneNumberUtil {	
	public static String getNoPrefixNumber(String numbers, String prefixNumber, int digit) {
		String[] nums = numbers.split(Constants.NUMBER_SPLIT);
		
		for (String num : nums) {
			if (isEqualNumber(num, prefixNumber, digit)) {
				return num;
			}
		}
		
		return null;
	}
	
	public static boolean isEqualNumber(String sLeft, String sRight, int nSub) {
		if (null == sLeft || null == sRight) {
			return false;
		}

		sLeft = PhoneNumberUtils.stripSeparators(sLeft);
		sRight = PhoneNumberUtils.stripSeparators(sRight);

		if (sLeft.equalsIgnoreCase(sRight)) {
			return true;
		}
		int lenLeft = sLeft.length();
		if (lenLeft < nSub) {
			return false;
		}
		int lenRight = sRight.length();
		if (lenRight < nSub) {
			return false;
		}
		// 1234567890
		String sLeftTemp = sLeft.substring(lenLeft - nSub, lenLeft);
		String sRightTemp = sRight.substring(lenRight - nSub, lenRight);
		if (sLeftTemp.equalsIgnoreCase(sRightTemp)) {
			return true;
		}
		return false;
	}
}
