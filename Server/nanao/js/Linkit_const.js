//LINKit project const value file

var LINKit_CONST =
{
	//Panel Type
	PANEL_TYPE : {
		MESSAGE	: 0,
		CONTACT	: 1,
		CALL	: 2,
		NOTIFICATION : 3,
		BLESSING: 4,
		LOGIN: 5
	},

	//Data change Event
	DATA_CHANGE : {
		NEW_CONTACT: 'newContact',
		UPDATE_CONTACT: 'updateContact',
		NEW_MESSAGE: 'newMessage',
		UPDATE_MESSAGE: 'updateMessage',
		UPDATE_NOTIFICATION:'updateNotification'
	},

	//Contact property
	CONTACT_PROPERTY : {
		NAME : 0x0001,
		NUMBER : 0x0002,
		AVATAR : 0x0004,
		UNREAD : 0x0008
	},

	MESSAGE_TYPE : {
		UNKNOWN : 0,
		SMS		: 1,
		CALL	: 2
	},
	
	CONTACT_TYPE: {
		UNKNOWN : 0,
		NORMAL  : 1,
		FACEBOOK: 2
	},

	//Message status
	MESSAGE_STATUS : {
		RECEIVE_MSG	: 1,	// message from your friends
		SEND_MSG	: 2,	// message send by yourself
		IN_CALL		: 101,	// Phone Incoming Call
		OUT_CALL	: 102,	// Phone Outgoing Call
		MISSED_CALL	: 103		// missed call
	},
	
	CONNECT_STATE:{
		NOT_CONNECTED: 0,
		CONNECTED: 1
		
		
	}
}