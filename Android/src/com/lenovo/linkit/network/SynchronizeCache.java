package com.lenovo.linkit.network;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.lenovo.linkit.Constants;
import com.lenovo.linkit.contact.ContactPacket;
import com.lenovo.linkit.log.FLog;
import com.lenovo.linkit.notification.NotificationData;
import com.lenovo.linkit.notification.NotificationPacket;
import com.lenovo.linkit.protocol.Packet;
import com.lenovo.linkit.sms.SMSData;
import com.lenovo.linkit.sms.SMSMessage;
import com.lenovo.linkit.sms.SMSPacket;

/**
 * cache when android is disconnected to Server
 * */
public class SynchronizeCache {
	private static String TAG = "SynchronizeCache";
	private List<Packet> mCache;
	
	private static SynchronizeCache mInstance = null;
	
	public static SynchronizeCache getInstance() {
		if (mInstance == null) {
			mInstance = new SynchronizeCache();
		}
		
		return mInstance;
	}

	private SynchronizeCache() {
		mCache = new ArrayList<Packet>();
	}
	
	public void cachePacket(Packet packet) {
		if (packet == null) {
			return;
		}
		
		FLog.i(TAG, "Get packet, cmd:" + packet.getCmd());
		
		String cmd = packet.getCmd();
		if (cmd.equals(Constants.COMMAND_SEND_SMS)) {
			addPacket(packet);
			
		} else if (cmd.equals(Constants.COMMAND_UPDATE_SMS)) {
			updatePacket(packet);
			
		} else if (cmd.equals(Constants.COMMAND_DELETE_SMS)) {
			deletePacket(packet);
			
		} else if (cmd.equals(Constants.COMMAND_NEW_ONE_NOTIFICATION)) {
			addPacket(packet);
			
		} else if (cmd.equals(Constants.COMMAND_DELETE_NOTIFICATION)) {
			deletePacket(packet);
		}
	}

	private void addPacket(Packet packet) {
		synchronized (this) {
			mCache.add(packet);
		}
	}

	private void updatePacket(Packet packet) {
		synchronized (this) {
			Class<? extends Packet> cls = packet.getClass();
			for (Packet p : mCache) {
				if (cls == p.getClass()) {
					if (cls == SMSPacket.class) {
						List<SMSData> oldList = ((SMSPacket) p).data;
						List<SMSData> updateList = ((SMSPacket) packet).data;

						for (SMSData newData : updateList) {
							for (SMSData oldData : oldList) {
								if (newData.getNumber().equals(
										oldData.getNumber())) {
									List<SMSMessage> oldMsgList = oldData
											.getMsg();
									List<SMSMessage> newMsgList = newData
											.getMsg();

									for (SMSMessage newMsg : newMsgList) {
										for (SMSMessage oldMsg : oldMsgList) {
											if (newMsg.getTime().equals(
													oldMsg.getTime())) {
												if (newMsg.isRead()) {
													oldMsg.setRead(true);
													break;
												}
											}
										}
									}
								}
							}
						}

						return;
					} else if (cls == NotificationPacket.class) {
						// there no notification update
					} else if (cls == ContactPacket.class) {
						// no contact update yet
					}
				}
			}
		}
	}

	private void deletePacket(Packet packet) {
		Class<? extends Packet> cls = packet.getClass();
		for (Packet p : mCache) {
			if (cls == p.getClass()) {
				if (cls == SMSPacket.class) {
					List<SMSData> oldList = ((SMSPacket) p).data;
					List<SMSData> deleteList = ((SMSPacket) packet).data;

					for (SMSData deleteData : deleteList) {
						for (SMSData oldData : oldList) {
							if (deleteData.getNumber().equals(
									oldData.getNumber())) {
								List<SMSMessage> oldMsgList = oldData.getMsg();
								List<SMSMessage> deleteMsgList = deleteData
										.getMsg();

								for (SMSMessage deleteMsg : deleteMsgList) {
									Iterator<SMSMessage> iterator = oldMsgList
											.iterator();
									while (iterator.hasNext()) {
										SMSMessage msg = iterator.next();
										if (msg.getTime().equals(
												deleteMsg.getTime())) {
											iterator.remove();
											break;
										}
									}
								}
							}
						}
					}

					return;
				} else if (cls == NotificationPacket.class) {
					List<NotificationData> oldList = ((NotificationPacket)p).data;
					List<NotificationData> deleteList = ((NotificationPacket)packet).data;
					
					for (NotificationData data : deleteList) {
						Iterator<NotificationData> iterator = oldList.iterator();
						while (iterator.hasNext()) {
							NotificationData oldData = iterator.next();
							if (oldData.time == data.time) {
								iterator.remove();
								break;
							}
						}
					}
					
					return;
				} else if (cls == ContactPacket.class) {
					// no contact delete now
				}
			}
		}
	}

	public List<Packet> getCachePackets() {
		synchronized (this) {
			List<Packet> list = new ArrayList<Packet>(mCache);
			mCache.clear();
			
			FLog.i(TAG, "Packet count: " + list.size());
			
			return list;
		}
	}
}
