package com.lenovo.linkit.facebook;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.jivesoftware.smack.Chat;
import org.jivesoftware.smack.ChatManager;
import org.jivesoftware.smack.ChatManagerListener;
import org.jivesoftware.smack.ConnectionConfiguration;
import org.jivesoftware.smack.ConnectionListener;
import org.jivesoftware.smack.MessageListener;
import org.jivesoftware.smack.Roster;
import org.jivesoftware.smack.RosterEntry;
import org.jivesoftware.smack.RosterListener;
import org.jivesoftware.smack.SASLAuthentication;
import org.jivesoftware.smack.XMPPConnection;
import org.jivesoftware.smack.XMPPException;
import org.jivesoftware.smack.packet.Message;
import org.jivesoftware.smack.packet.Presence;
import org.jivesoftware.smack.provider.ProviderManager;
import org.jivesoftware.smackx.packet.VCard;

import android.content.Context;
import android.content.Intent;

import com.lenovo.linkit.Constants;
import com.lenovo.linkit.UserSetting;
import com.lenovo.linkit.contact.ContactInfo;
import com.lenovo.linkit.contact.ContactManager;
import com.lenovo.linkit.contact.ContactPacket;
import com.lenovo.linkit.facebook.bean.FacebookMessagePacket;
import com.lenovo.linkit.facebook.bean.FacebookMessagePacket.FacebookMessage;
import com.lenovo.linkit.facebook.bean.FacebookMessagePacket.FacebookMessages;
import com.lenovo.linkit.facebook.bean.FbContact;
import com.lenovo.linkit.http.IconHelper;
import com.lenovo.linkit.http.IconResponser;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.network.INetworkManager;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.sasl.SASLFacebookMechanism;

public class FacebookChatProxyService {

	public final static String TAG = FacebookChatProxyService.class
			.getSimpleName();

	private Context mContext;

	private Packet packet = null;
	private int index = 0;
	private ConnectionListener connectionListenerImpl = new ConnectionListenerImpl();

	private String username, password;

	private FacebookChatProxyService() {

	}

	private static final FacebookChatProxyService instance = new FacebookChatProxyService();

	public static final FacebookChatProxyService getInstance() {
		return instance;
	}

	public void setPacket(Packet packet) {
		this.packet = packet;
	}

	public void setContext(Context context) {
		this.mContext = context;
	}

	private XMPPConnection mXMPPConn;
	private Roster roster;
	private ChatManager chatMngr;
	private INetworkManager manager;
	private List<FbContact> contactList;
	private Map<String, String> icons = new HashMap<String, String>();

	private boolean login = false;

	private void initXMPPConn() {
		FLog.i(TAG, "initXMPPConn start");
		
		String ip = Constants.FACEBOOK_HOST_ADDRESS_NAME ;
		try {
			FLog.i(TAG, "old ip:" + ip);
			InetAddress address = InetAddress.getByName(ip);
			ip = address.getHostAddress();
			FLog.i(TAG, "paser ip:" + ip);
		} catch (UnknownHostException e) {
			e.printStackTrace();
		}
		FLog.i(TAG, "ip:" + ip);
		ProviderManager.getInstance().addIQProvider("vCard", "vcard-temp",
				new org.jivesoftware.smackx.provider.VCardProvider());
		SASLAuthentication.registerSASLMechanism(SASLFacebookMechanism.NAME,
				SASLFacebookMechanism.class);
		SASLAuthentication.supportSASLMechanism(SASLFacebookMechanism.NAME, 0);
		ConnectionConfiguration config = new ConnectionConfiguration(ip, Constants.FACEBOOK_HOST_PORT);
		config.setSASLAuthenticationEnabled(true);
		config.setSecurityMode(ConnectionConfiguration.SecurityMode.enabled);
		mXMPPConn = new XMPPConnection(config);
		XMPPConnection.DEBUG_ENABLED = true;
		FLog.i(TAG, "initXMPPConn end");
	}
	
	private void initXMPPConn2() {
		FLog.i(TAG, "initXMPPConn start");
		ProviderManager.getInstance().addIQProvider("vCard", "vcard-temp",
				new org.jivesoftware.smackx.provider.VCardProvider());
		SASLAuthentication.registerSASLMechanism(SASLFacebookMechanism.NAME,
				SASLFacebookMechanism.class);
		SASLAuthentication.supportSASLMechanism(SASLFacebookMechanism.NAME, 0);
		ConnectionConfiguration config = new ConnectionConfiguration(Constants.FACEBOOK_HOST_ADDRESS, Constants.FACEBOOK_HOST_PORT);
		config.setSASLAuthenticationEnabled(true);
		config.setSecurityMode(ConnectionConfiguration.SecurityMode.enabled);
		mXMPPConn = new XMPPConnection(config);
		XMPPConnection.DEBUG_ENABLED = true;
		FLog.i(TAG, "initXMPPConn end");
	}

	public INetworkManager getManager() {
		return manager;
	}

	public void setManager(INetworkManager manager) {
		this.manager = manager;
	}

	public boolean login(String username, String password) {
		return login(username, password, null);
	}

	public synchronized boolean login(String username, String password,
			String applicationName) {
		try {
			if (login) {
				return true;
			}
			initXMPPConn();
			this.username = username;
			this.password = password;
			FLog.i(TAG, "login");
			mXMPPConn.connect();
			afterConnect(username, password);
			// getFacebookContacts();
		} catch (Exception e) {
			e.printStackTrace();
			FLog.e(TAG, "login fail." , e);
			login = false;
			
			try {
				initXMPPConn2();
				mXMPPConn.connect();
				afterConnect(username, password);
			} catch (Exception e1) {
				e1.printStackTrace();
			}
		}
		if(login){
			FLog.i(TAG, "facebook has login success,accout:" + username);
		}
		return login;
	}

	private void afterConnect(String username, String password)
			throws XMPPException {
		mXMPPConn.login(username, password);
		mXMPPConn.addConnectionListener(connectionListenerImpl);
		chatMngr = mXMPPConn.getChatManager();
		chatMngr.addChatListener(new ChatManagerListener() {
			@Override
			public void chatCreated(Chat arg0, boolean arg1) {
				if (arg0.getListeners()== null || arg0.getListeners().size() == 0) {
					arg0.addMessageListener(new IncomingMessageListener());
				}
			}
		});
		FLog.i(TAG, "login success!");
		login = true;
	}

	public List<FbContact> getFacebookContacts() {
		ArrayList<FbContact> contacts = null;
		FLog.i(TAG, "getFacebookContacts start");
		if (login) {
			FLog.i(TAG, "has login");
			roster = mXMPPConn.getRoster();
			Collection<RosterEntry> rosterEntries = roster.getEntries();
			contacts = new ArrayList<FbContact>();
			for (RosterEntry re : rosterEntries) {
				FbContact fb = new FbContact(re);
				contacts.add(fb);
				/*
				 * Chat chat = chatMngr.getUserChat(fb.getJid()); if (chat ==
				 * null) { chat = chatMngr.createChat(fb.getJid(), new
				 * IncomingMessageListener()); } if (chat.getListeners() ==
				 * null) { chat.addMessageListener(new
				 * IncomingMessageListener()); } if (chat.getListeners().size()
				 * <= 0 || chat.getListeners().size() > 1) {
				 * chat.getListeners().clear(); chat.addMessageListener(new
				 * IncomingMessageListener()); }
				 */
			}
			roster.addRosterListener(new ContactsListener());
			FLog.i(TAG, "get contacts" + contacts.size());

		}
		contactList = contacts;
		return contacts;
	}

	public byte[] getFacebookAvatar(String jid) {
		VCard vCard = new VCard();
		try {
			vCard.load(mXMPPConn, jid);
			byte[] avatarBytes = vCard.getAvatar();
			return avatarBytes;
		} catch (XMPPException e) {
			FLog.e(TAG, "Failed to load avatar for " + jid, e);
		}
		return null;
	}

	public InputStream getFacebookAvatarInputStream(String jid) {

		VCard vCard = new VCard();
		try {
			vCard.load(mXMPPConn, jid);
			byte[] avatarBytes = vCard.getAvatar();
			if (avatarBytes != null) {
				InputStream inputStream = new ByteArrayInputStream(avatarBytes);
				return inputStream;
			}
		} catch (XMPPException e) {
			FLog.e(TAG, "Failed to load avatar for " + jid, e);
		}
		return null;

	}

	public synchronized boolean sendMessage(String jid, String message) {
		if (!login) {
			if (this.username != null && this.password != null) {
				login(this.username, this.password);
			}
		}
		if (login) {
			Chat chat = chatMngr.getUserChat(jid);
			try {
				if (chat != null) {
					chat.sendMessage(message);
					return true;
				} else {
					chat = chatMngr.createChat(jid, null);
					chat.sendMessage(message);
				}
			} catch (XMPPException e) {
				e.printStackTrace();
			}
		}
		return false;

	}

	private class IncomingMessageListener implements MessageListener {
		public void processMessage(Chat chat, Message message) {
			String body = message.getBody();
			String from = message.getFrom();
			if (message.getError() != null && message.getError().getCode() > 0) {
				return;
			}
			if (body != null) {
				FLog.i(TAG, "from:" + from + " say: " + body);

				FacebookMessagePacket fmp = new FacebookMessagePacket();
				fmp.setId(packet.getId());
				fmp.setType(Constants.WS_COMMAND_TYPE_REQUEST);
				fmp.setTo(Constants.WS_COMMAND_TARGET);
				fmp.setCmd(Constants.COMMAND_NEW_FACEBOOKMESSAGE);
				if (packet != null) {
					fmp.setToken(packet.getToken());
				}
				fmp.setCompressed("0");
				List<FacebookMessages> data = new ArrayList<FacebookMessages>();
				FacebookMessages fms = new FacebookMessages();
				String name = from;
				if (contactList != null) {
					for (FbContact fc : contactList) {
						if (fc.getJid().contains(from)) {
							name = fc.getName();
							break;
						}
					}
				}
				fms.setName(name);
				fms.setIncontact(Constants.CONTACT_FACEBOOK_FLAG);
				fms.setNumber(from);
				FacebookMessage fm = new FacebookMessage();
				fm.setId("" + index++);
				fm.setMessage(body);
				fm.setPerson(from);
				fm.setRead(false);
				fm.setStatus(Constants.FACEBOOK_SENDMESSAGE_STATE);
				fm.setTime("" + System.currentTimeMillis());
				List<FacebookMessage> list = new ArrayList<FacebookMessage>();
				list.add(fm);
				fms.setMsg(list);
				if (manager != null && packet != null) {
					data.add(fms);
					fmp.setData(data);
					manager.sendPacket(fmp);
				}
			}

		}

	}

	public void reconnect() {

	}

	public boolean isLogin() {
		return login;
	}

	public void logout() {
		mXMPPConn.removeConnectionListener(connectionListenerImpl);
		if (mXMPPConn != null) {
			mXMPPConn.disconnect();
		}
		FLog.i(TAG, "Facebook has logout, accout:" + username);
		login = false;
	}

	public String getIconUri(Context context, String jid) {
		try {
			byte[] reuslt = getFacebookAvatar(jid);
			if (reuslt != null) {
				return ContactManager.getContactManager().getAvatarUri(context,
						"facebook", roundJid(jid), reuslt);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return null;
	}

	private String roundJid(String jid) {
		jid = jid.replace("-", "");
		jid = jid.replace(".", "");
		return jid;
	}

	private String sendIcon2Server(Context context, String jid) {
		String serverIP = UserSetting.getWebSocketAddress(context);

		InputStream is = getFacebookAvatarInputStream(jid);
		if (is != null) {
			IconResponser responser = IconHelper.uploadByStream(serverIP,
					jid, "1.0" + roundJid(jid), jid, is);
			return responser.url;
		}
		return null;
	}

	public void sendAvatars(String token, Packet packet) {
		if (contactList != null) {
			for (FbContact fc : contactList) {
				if (icons.get(fc.getJid()) == null) {
					icons.put(fc.getJid(), getIconUri(mContext, fc.getJid()));
				}

				if (icons.get(fc.getJid()) != null) {
					ContactInfo info = new ContactInfo();
					info.setNumber(fc.getJid());
					info.setAvatar(icons.get(fc.getJid()));
					ContactPacket contactPacket = new ContactPacket(token);
					contactPacket.setId(packet.getId());
					contactPacket.setSingleData(info);
					contactPacket.setCid(packet.getCid());
					manager.sendPacket(contactPacket);
				}
			}
		}
	}

	private class ContactsListener implements RosterListener {

		@Override
		public void entriesAdded(Collection<String> arg0) {

		}

		@Override
		public void entriesDeleted(Collection<String> arg0) {

		}

		@Override
		public void entriesUpdated(Collection<String> arg0) {

		}

		@Override
		public void presenceChanged(Presence pres) {

		}

		@Override
		public void entriesLoaded(Collection<RosterEntry> values) {
			// TODO Auto-generated method stub

		}
	}

	public class ConnectionListenerImpl implements ConnectionListener {

		@Override
		public void connectionClosed() {
			sendFacebookState();
			/*logout();
			if(login(username,password)){
				sendFacebookState();
			}*/
		}

		@Override
		public void connectionClosedOnError(Exception e) {
			sendFacebookState();
			logout();
			if(login(username,password)){
				sendFacebookState();
			}
		}

		@Override
		public void reconnectingIn(int seconds) {
		}

		@Override
		public void reconnectionSuccessful() {
			sendFacebookState();
		}

		@Override
		public void reconnectionFailed(Exception e) {
			logout();
			sendFacebookState();
			if(login(username,password)){
				sendFacebookState();
			}
		}

		@Override
		public void onAccountConflicted() {
			logout();
			sendFacebookState();
			if(login(username,password)){
				sendFacebookState();
			}
		}

	}

	private void sendFacebookState() {
		Intent sendIntent = new Intent();
		sendIntent.setAction(Constants.MAINACTIVITY_NLSERVICERECEIVER_ACTION);
		sendIntent.putExtra("facebookstate", isLogin());
		mContext.sendBroadcast(sendIntent);
	}

	public static final int FACEBOOK_CONNECTED = 1;
	public static final int FACEBOOK_CONNECT_FAIL = -1;
	public static final int FACEBOOK_RECONNECTED = 2;
	public static final int FACEBOOK_RECONNECT_FAIL = -2;
	public static final int FACEBOOK_EXCEPTION = -3;

}
