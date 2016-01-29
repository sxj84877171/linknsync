package com.lenovo.linkit.database;


public class DBColumnField {
    public final static String PROVIDER = "com.lenovo.linkit.database.provider";

    public final static String DATABASE_NAME = "linkit.db";
    public final static String ASSETS_NAME = "database/linkit.db";

    public final static int COPY_DATABASE_SUCCESS = 1;
    public final static int DATABASE_EXIST = 2;
    public final static int CREATE_DATABASE_PATH_FAIL = 3;

    public final static int SMS_TABLE_QUERY_INDEX = 1;
    public final static int SMS_TABLE_INSERT_INDEX = 2;
    public final static int SMS_TABLE_DELETE_INDEX = 3;

    public final static String SMS_TABLE_QUERY_FLAG = "sms_information_query";
    public final static String SMS_TABLE_INSERT_FLAG = "sms_information_insert";
    public final static String SMS_TABLE_DELETE_FLAG = "sms_information_delete";

    public final static String SMS_TABLE = "sms_information";
    public final static String SMS_PHONE_NUMBER = "s_phone_number";
    public final static String SMS_CONTENT = "s_sms_content";
    public final static String SMS_INPUT_DATE = "input_date";
}
