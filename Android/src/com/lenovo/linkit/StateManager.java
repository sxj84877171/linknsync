package com.lenovo.linkit;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

import com.lenovo.linkit.log.FLog;

public class StateManager {

	public static final String TAG = StateManager.class.getName();

	public static class State implements Serializable{
		private static final long serialVersionUID = 1L;
		public static final int STATE_DISCONNECTED = 0 , // 未连接
		STATE_CONNECTING = 1, // 正在连接
		STATE_RECONNECTING = 2, // 正在重连
		STATE_CONNECTED = 3, // 已链接
		STATE_PAIRING = 4 , // 正在配对
		STATE_PAIRED = 5, // 已配对
		STATE_CONTACTS = 6, // 同步联系人
		STATE_ALL_SMS = 7, // 同步短信
		STATE_PHONE_INFO = 8, // 同步手机信息
		STATE_ALL_NOTIFICATION = 9, // 同步通知
		STATE_SMS_TOPC= 10, // 推送信息给pc
		STATE_NOTIFICATION_TOPC = 11, // 推送通知给手机
		STATE_SYNCHRONIZED = 12, // 同步完成
		STATE_FINISHED = 13, // 已完成 ？？ 和上面一个什么区别
		STATE_PC_DISCONNECT = 14, // pc 已断开
		STATE_CONTACTS_FAIL = 15, // 同步联系人失败
		STATE_SMS_FAIL = 16, // 同步短信失败
		STATE_NOTIFICATION_FAIL = 17, // 同步通知失败
		STATE_PHONE_INFO_FAIL = 18, // 同步手机信息失败
		STATE_FACEBOOK_AVATAR = 19,// 同步facebook头像
		STATE_CONFICT = 20 ;//手机登录冲突
				
		private int state = 0 ;
		
		public State(int state){
			this.state = state ;
		}
		
		public final int getState(){
			return state ;
		}
		
		@Override
		public boolean equals(Object o) {
			if(o instanceof State){
				return this.state == ((State)o).getState();
			}
			return super.equals(o);
		}

		public String toString() {
			switch (state) {
			case STATE_DISCONNECTED:
				return "未连接";
			case STATE_CONNECTING:
				return "正在连接";
			case STATE_RECONNECTING:
				return "正在重连";
			case STATE_CONNECTED:
				return "已链接";
			case STATE_PAIRING:
				return "正在配对";
			case STATE_PAIRED:
				return "已配对";
			case STATE_CONTACTS:
				return "同步联系人";
			case STATE_ALL_SMS:
				return "同步短信";
			case STATE_PHONE_INFO:
				return "同步手机信息";
			case STATE_ALL_NOTIFICATION:
				return "同步通知";
			case STATE_SMS_TOPC:
				return "推送信息给pc";
			case STATE_NOTIFICATION_TOPC:
				return "推送通知给手机";
			case STATE_SYNCHRONIZED:
				return "同步完成";
			case STATE_FINISHED:
				return "已完成 ";// ？？ 和上面一个什么区别
			case STATE_PC_DISCONNECT:
				return "pc 已断开";
			case STATE_CONTACTS_FAIL:
				return "同步联系人失败";
			case STATE_SMS_FAIL:
				return "同步短信失败";
			case STATE_NOTIFICATION_FAIL:
				return "同步通知失败";
			case STATE_PHONE_INFO_FAIL:
				return "同步手机信息失败";
			case STATE_FACEBOOK_AVATAR:
				return "同步facebook头像";
			case STATE_CONFICT:
				return "另外的设备连接用此账号";
			}
			return "";
		}
	}

	private StateManager() {

	}

	public static StateManager getInstance() {
		return instance;
	}

	private static StateManager instance = new StateManager();

	private Stack<State> stateStack = new Stack<State>();
	private List<StateChange> stateChangeList = new ArrayList<StateChange>();

	public static interface StateChange {
		public void onChange(State state);
	}

	private void notifyStateChange() {
		for (StateChange stateChange : stateChangeList) {
			stateChange.onChange(getCurrentState());
		}
	}

	public void pushState(State state) {
		stateStack.push(state);
		if(stateStack.size() >100){
			for(int i = 0 ; i < 50 ; i++){
				stateStack.remove(0);
			}
		}
		notifyStateChange();
	}

	public void pullState(State state) {
		if (!stateStack.isEmpty()) {
			if (stateStack.peek() != state) {
				FLog.w(TAG, "Warming: the state is not right. old state:"
						+ stateStack.peek() + ", remove state:" + state);
			}
			stateStack.remove(state);
		}
		notifyStateChange();
	}

	public void pullState() {
		State state = new State(State.STATE_DISCONNECTED);
		if (!stateStack.isEmpty()) {
			state = stateStack.peek();
		}
		if (state != null) {
			pullState(state);
		}
	}

	public State getCurrentState() {
		State state = new State(State.STATE_DISCONNECTED);
		if (!stateStack.isEmpty()) {
			state = stateStack.peek();
		}
		return state;
	}

	public void clearState() {
		stateStack.clear();
	}

	public void registerListener(StateChange stateChange) {
		for (StateChange sc : stateChangeList) {
			if (sc.equals(stateChange)) {
				return;
			}
		}
		stateChangeList.add(stateChange);
	}

	public void unRegisterListener(StateChange stateChange) {
		for (StateChange sc : stateChangeList) {
			if (sc.equals(stateChange)) {
				stateChangeList.remove(sc);
			}
		}
	}
}
