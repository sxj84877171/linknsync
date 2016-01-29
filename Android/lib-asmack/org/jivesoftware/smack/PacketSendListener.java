package org.jivesoftware.smack;

import org.jivesoftware.smack.packet.Packet;

public interface PacketSendListener {

	public void onPacketSendSuccess(Packet packet);

	public void onPacketSendFailed(Packet packet);

}
