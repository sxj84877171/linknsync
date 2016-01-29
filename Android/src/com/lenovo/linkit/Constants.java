package com.lenovo.linkit;

public class Constants {
	public static final boolean IS_TEST_BUILD = false ;
	
	public static final int WEB_SOCKET_PORT = 8080;
	
	public static final String NUMBER_SPLIT = "#";
	
	public static final int  WS_NETWORK_MGR_WEB_SOCKET = 1;//0 using websocket
	public static final int  WS_NETWORK_MGR_COUCHBASE = 2;// 1 using couchbase 
	public static final String WS_COMMAND_TYPE_REQUEST = "request";
	public static final String WS_COMMAND_TYPE_RESPONSE = "response";	
	public static final String LENOVOID_HEAD = "lenovoid" ;
	public static final String WS_COMMAND_VERSION = "1.1";	
	public static final String WS_COMMAND_TARGET = "c";
	
	public static final String ICON_LOCAL_SP = "NotificationIconUri";
	public static final String CONTACT_AVATAR_LOCAL_SP = "ContactPhotoUri";
	public static final String WS_SP = "WebSocketServer";
	public static final String PHONE_UUID = "phoneuuid";
	public static final String DOCUMENT_IDS = "docids";
	public static final String DOCUMENT_COUNT = "documencount";
	public static final String VERSION = "version" ;
	public static final String DOC_LAST_SEQ = "lastseq";
	
	public static final String LENOVOID_LOGIN_CONFICT = "conflict" ;
	
	public static final int WS_RECONNECT_INTERVAL = 20000;
	public static final int WS_RECONNECT_COUNT = 100;
	
	public static final int MSG_REGISTER_CLIENT_REQ = 1;
	public static final int MSG_REGISTER_CLIENT_RSP = 2;
	public static final int MSG_UNREGISTER_CLIENT = 3;
	public static final int MSG_SET_QCODE_REQ = 4;
	public static final int MSG_SET_QCODE_RSP = 5;
	public static final int MSG_WIFI_STATE = 6;
	public static final int MSG_WEBSOCKET_STATE = 7;
	public static final int MSG_DISCONNECT_PC = 8;
	public static final int MSG_SYNCHRONIZE_WS_STATE = 9;
	public static final int MSG_NOTIFICATIONSERVICE_STATE = 10 ;
	public static final int MSG_QUERY_CMD = 11 ;
	public static final int MSG_QUERY_CMD_REPLY = 12 ;
	
	public static final int MSG_SERVICE_STATE = MSG_WEBSOCKET_STATE ;
	
	public static final int STATE_ERROR = -1;
	public static final int STATE_WS_DISCONNECTED = 0;	
	public static final int STATE_WS_CONNECTING = 1;
	public static final int STATE_WS_CONNECTED = 2;
	public static final int STATE_REQUEST_PAIRING = 3;
	public static final int STATE_FINISHED_PAIRING = 4;
	public static final int STATE_SEND_ALL_CONTACTS = 5;
	public static final int STATE_SEND_ALL_SMS = 6;
	public static final int STATE_SEND_PHONE_INFO = 7;
	public static final int STATE_SEND_ALL_NOTIFICATION = 8;
	public static final int STATE_SEND_SMS_TO_PC = 9;
	public static final int STATE_SEND_NOTIFICATION_TO_PC = 10;
	public static final int STATE_SYNCHRONIZED = 100;
	public static final int STATE_FINISHED = 101;
	public static final int STATE_PHONE_DISCONNECT = 102;
	public static final int STATE_GET_CONTACTS_FAIL = 201;
	public static final int STATE_GET_SMS_FAIL = 202;
	public static final int STATE_GET_NOTIFICATION_FAIL = 203;
	public static final int STATE_GET_PHONE_INFO_FAIL = 204;
	
	public static final int HANDLER_ERROR = -1;
	public static final int HANDLER_MESSAGE = 0;
	public static final int HANDLER_WS_DISCONNECTED = 1;
	public static final int HANDLER_WS_CONNECTED = 2;
	public static final int HANDLER_RECEIVED_MSG = 4;
	public static final int HANDLER_PAIR_SUCCESS = 5;
	public static final int HANDLER_PAIR_FAIL = 6;
	public static final int HANDLER_PC_DISCONNECT = 8;
	
	public static final String ACTION_STOP_SERVICE = "com.lenovo.linkit.stopservice";
	public static final String ACTION_MSG_TO_SERVICE = "com.lenovo.linkit.sendmessage";
	public static final String ACTION_GET_LOG_FROM_SERVICE = "com.lenovo.linkit.getservicelog";
	public static final String ACTION_SEND_LOG_FROM_SERVICE = "com.lenovo.linkit.sendservicelog";
	public static final String ACTION_GET_LOG_FROM_NOTIFICATION_SERVICE = "com.lenovo.linkit.getnotificationlog";
	public static final String ACTION_SEND_NOTIFICATION_LOG_FROM_SERVICE = "com.lenovo.linkit.sendnotificationlog";
	public static final String ACTION_FACEBOOK_LOGIN= "com.lenovo.linkit.facebook.login";
	public static final String ACTION_FACEBOOK_LOGOUT= "com.lenovo.linkit.facebook.logout";
	
	public static final String MESSAGE_CONFLICT = "kConflict";
	public static final String COMMAND_HEARTBEAT = "kHeartbeat";
	public static final String NOTIFICATION_COMMAND = "kCommand";
	public static final String COMMAND_FINISHED_PAIRED = "kPaired";
	public static final String COMMAND_PC_DISCONNECTED = "kPCDisconnected";
	public static final String COMMAND_GET_PHONE_INFO = "kGetPhoneInformation";
	public static final String COMMAND_GET_ALL_CONTACTS = "kGetAllContacts";
	public static final String COMMAND_GET_ALL_SMS = "kGetAllMessages";
	public static final String COMMAND_SEND_SMS = "kSendMessages";
	public static final String COMMAND_UPDATE_SMS = "kUpdateMessages";
	public static final String COMMAND_DELETE_SMS = "kDeleteMessages";
	public static final String COMMAND_NOPERMISSION_SMS = "kNoSMSPermissions";
	public static final String COMMAND_PERMISSION_SMS =    "kSMSPermissions";
	public static final String COMMAND_NEW_ONE_NOTIFICATION = "kNewNotification" ;
	public static final String COMMAND_GET_ALL_NOTIFICATION = "kGetAllNotification";
	public static final String COMMAND_DELETE_NOTIFICATION = "kDeleteNotification";
	public static final String COMMAND_SYNCHRONIZED = "kSynchronized";
	public static final String COMMAND_FINISHED = "kFinished";
		
	public static final String COMMAND_NEW_NOTIFICATION = "kNewNotification" ;
	public static final String COMMAND_REMOVE_NOTIFICATION = "kDeleteNotification";
	public static final String COMMAND_DISMISS_NOTIFICATION = "kDismissNotification";
	public static final String COMMAND_ALL_NOTIFICATION = "kAllNotification";
	public static final String COMMAND_SERVICE_STATE = "commandServiceState" ;
	public static final String COMMAND_GET_CONTACT_AVATAR = "kGetContactAvatar" ;
	public static final String COMMAND_GET_FACEBOOK_CONTACT_AVATAR = "kGetFacebookContactAvatar" ;
	public static final String COMMAND_PHONE_DISCONNECT = "kPhoneDisconnected" ;
	
	public static final String COMMAND_NEW_FACEBOOKMESSAGE = "kNewFacebookMsg" ;
	public static final String COMMAND_FACEBOOK_AVATAR = "kGetFacebookAvatar" ;
	public static final String COMMAND_SEND_FACEBOOKMESSAGE = "kSendFacebookMsg" ;
	public static final String FACEBOOK_HOST_ADDRESS = "173.252.107.17";//"chat.facebook.com" ;//173.252.107.17 //141.0.17.57
	public static final String FACEBOOK_HOST_ADDRESS_NAME = "chat.facebook.com" ;
	public static final int FACEBOOK_HOST_PORT = 5222 ;
	public static final String CONTACT_FACEBOOK_FLAG = "2" ;
	public static final String FACEBOOK_SENDMESSAGE_STATE = "1" ;
	
	
	
	public static final String NOTIFICATION_PROCESS_NAME = "com.lenovo.linkit:notificationService"; 
	
	public static final String QUERY_SERVICE_STATE = "queryServiceState" ;
	
	public static final String REASON_SUCCESS = "0";
	public static final String REASON_GET_CONTACTS_FAIL = "kGetContactsFailed";
	public static final String REASON_GET_SMS_FAIL = "kGetSMSFailed";
	public static final String REASON_SEND_SMS_FAIL = "kSendSMSFailed";
	public static final String REASON_UPDATE_SMS_FAIL = "kUpdateSMSFailed";
	public static final String REASON_DELETE_SMS_FAIL = "kDeleteSMSFailed";
	public static final String REASON_GET_NOTIFICATION_FAIL = "kGetNotificationFailed";
	public static final String REASON_GET_PHONE_INFO_FAIL = "kGetPhoneInformationFailed";
	public static final String REASON_DELETE_NOTIFICATION_FAIL = "kDeleteNotificationFailed";
	
	public static final String DESC_GET_PHONE_INFO_FAIL = "get phone information failed";
	public static final String DESC_GET_ALL_CONTACTS_FAIL = "get all contacts failed";
	public static final String DESC_GET_ALL_SMS_FAIL = "get all sms failed";
	public static final String DESC_SEND_SMS_FAIL = "send sms failed";
	public static final String DESC_UPDATE_SMS_FAIL = "update sms failed";
	public static final String DESC_DELETE_SMS_FAIL = "delete sms failed";
	public static final String DESC_GET_ALL_NOTIFICATION_FAIL = "get all notification failed";
	public static final String DESC_DELETE_NOTIFICATION_FAIL = "delete notification failed, system version is too low";
	
	
	public static final String NOTIFICATIONDAEMONSERVICE_NLSERVICERECEIVER_ACTION = "com.lenovo.linkit.NotificationDaemonService.NLServiceReceiver" ;
	public static final String MAINSERVER_NLSERVICERECEIVER_ACTION = "com.lenovo.linkit.MainActivity.NLServiceReceiver" ;
	public static final int MAINSERVER_NLSERVICERECEIVER_ACTION_CMD = 100 ;
	public static final String MAINACTIVITY_NLSERVICERECEIVER_ACTION = "com.lenovo.linkit.MainService.NLServiceReceiver" ;
	public static final String ACTION_NOTIFICATION_LISTENER_SETTINGS = "android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS" ;
	
	public static final String LEVEL_VERBOSE = "VERBOSE";
	public static final String LEVEL_DEBUG = "DEBUG";
	public static final String LEVEL_INFO = "INFO";
	public static final String LEVEL_WARN = "WARN";
	public static final String LEVEL_ERROR = "ERROR";
	public static final String LEVEL_SUCCESS = "SUCCESS";
	
	public static final int LOG_LEVEL_VERBOSE = 0;
	public static final int LOG_LEVEL_DEBUG = 1;
	public static final int LOG_LEVEL_INFO = 2;
	public static final int LOG_LEVEL_WARN = 3;
	public static final int LOG_LEVEL_ERROR = 4;
	public static final int LOG_LEVEL_SUCCESS = 5;
	
	public static final int LOG_FILE_ACTIVITY = 0;
	public static final int LOG_FILE_SERVICE = 1;
	public static final int LOG_FILE_NO_SERVICE = 2;
	
	public static final int PHONE_NUMBER_LENGTH = 14;
	
	public static final int INCOMING_CALL = 101 ;
	public static final int OUTGOING_CALL = 102 ;
	public static final int MISSED_CALL = 103 ;
	
	public static final int REQUEST_CODE_CONNECTION_STATUS = 1;
}
