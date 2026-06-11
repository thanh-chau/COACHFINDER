import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken, getAuthSession } from "../utils/authSession";
import { useEffect, useRef } from "react";
import type { CallType, ChatMessage as ApiChatMessage } from "../types/chat";

export interface ApiNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface VideoCallSignal {
  callId?: number;
  conversationId?: number;
  type:
    | "CALL_INVITE"
    | "CALL_ACCEPT"
    | "CALL_REJECT"
    | "CALL_CANCEL"
    | "CALL_END"
    | "OFFER"
    | "ANSWER"
    | "ICE"
    | "BUSY"
    | "TIMEOUT";
  callType?: CallType;
  targetUsername: string;
  senderUsername?: string;
  senderFullName?: string | null;
  payload?: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

const API_BASE_URLS = (
  import.meta.env.VITE_API_BASE_URLS
    ? String(import.meta.env.VITE_API_BASE_URLS).split(",").map(value => value.trim()).filter(Boolean)
    : [
        import.meta.env.VITE_API_BASE_URL || "https://be.minhthien.io.vn",
        "https://www.be.minhthien.io.vn",
      ]
);

const WS_URL = import.meta.env.VITE_WS_URL || `${API_BASE_URLS[0]}/ws/chat`;

class ChatWebSocketService {
  private client: Client | null = null;
  private messageSubscribers: Set<(message: ApiChatMessage) => void> = new Set();
  private notifSubscribers: Set<(notif: ApiNotification) => void> = new Set();
  private callSubscribers: Set<(signal: VideoCallSignal) => void> = new Set();
  private pendingCallSignals: VideoCallSignal[] = [];
  private isConnected = false;

  public connect() {
    if (this.client && this.client.active) return;
    
    const token = getAccessToken();
    if (!token) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (msg) => console.log("[STOMP]", msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.isConnected = true;
        this.client?.subscribe("/user/queue/messages", (message: IMessage) => {
          if (message.body) {
            try {
              const body = JSON.parse(message.body);
              if (body.data) {
                const apiMsg = body.data as ApiChatMessage;
                // STOMP backend might broadcast `ownMessage=true` to the receiver by mistake, 
                // so we evaluate it here on the client based on the logged-in user.
                const session = getAuthSession();
                if (session?.userId) {
                  apiMsg.ownMessage = apiMsg.senderId === session.userId;
                }
                this.messageSubscribers.forEach(cb => cb(apiMsg));
              }
            } catch (e) {
              console.error("Error parsing websocket message", e);
            }
          }
        });

        this.client?.subscribe("/user/queue/notifications", (message: IMessage) => {
          if (message.body) {
            try {
              const body = JSON.parse(message.body);
              if (body.data) {
                const notif = body.data as ApiNotification;
                this.notifSubscribers.forEach(cb => cb(notif));
              }
            } catch (e) {
              console.error("Error parsing notification", e);
            }
          }
        });

        this.client?.subscribe("/user/queue/call", (message: IMessage) => {
          if (message.body) {
            try {
              const signal = JSON.parse(message.body) as VideoCallSignal;
              this.callSubscribers.forEach(cb => cb(signal));
            } catch (e) {
              console.error("Error parsing video call signal", e);
            }
          }
        });

        this.flushPendingCallSignals();
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers['message']);
        console.error("Additional details: " + frame.body);
      },
      onWebSocketClose: () => {
        this.isConnected = false;
      }
    });

    this.client.activate();
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.isConnected = false;
  }

  public subscribe(callback: (message: ApiChatMessage) => void) {
    this.messageSubscribers.add(callback);
    if (!this.isConnected) {
      this.connect();
    }
    return () => {
      this.messageSubscribers.delete(callback);
      if (this.messageSubscribers.size === 0 && this.notifSubscribers.size === 0 && this.callSubscribers.size === 0) {
        this.disconnect();
      }
    };
  }

  public subscribeNotif(callback: (notif: ApiNotification) => void) {
    this.notifSubscribers.add(callback);
    if (!this.isConnected) {
      this.connect();
    }
    return () => {
      this.notifSubscribers.delete(callback);
      if (this.messageSubscribers.size === 0 && this.notifSubscribers.size === 0 && this.callSubscribers.size === 0) {
        this.disconnect();
      }
    };
  }

  public subscribeCall(callback: (signal: VideoCallSignal) => void) {
    this.callSubscribers.add(callback);
    if (!this.isConnected) {
      this.connect();
    }
    return () => {
      this.callSubscribers.delete(callback);
      if (this.messageSubscribers.size === 0 && this.notifSubscribers.size === 0 && this.callSubscribers.size === 0) {
        this.disconnect();
      }
    };
  }

  public sendCallSignal(signal: VideoCallSignal) {
    if (!this.client || !this.client.active) {
      this.pendingCallSignals.push(signal);
      this.connect();
      return;
    }

    if (!this.isConnected) {
      this.pendingCallSignals.push(signal);
      return;
    }

    this.publishCallSignal(signal);
  }

  private flushPendingCallSignals() {
    if (!this.client || !this.isConnected || this.pendingCallSignals.length === 0) return;
    const signals = [...this.pendingCallSignals];
    this.pendingCallSignals = [];
    signals.forEach(signal => this.publishCallSignal(signal));
  }

  private publishCallSignal(signal: VideoCallSignal) {
    this.client?.publish({
      destination: "/app/call.signal",
      body: JSON.stringify(signal)
    });
  }
}

export const chatWebSocketService = new ChatWebSocketService();

export function useChatWebSocket(onMessage: (message: ApiChatMessage) => void) {
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    const unsubscribe = chatWebSocketService.subscribe(message => callbackRef.current(message));
    return () => unsubscribe();
  }, []);
}

export function useNotificationWebSocket(onNotif: (notif: ApiNotification) => void) {
  const callbackRef = useRef(onNotif);
  callbackRef.current = onNotif;

  useEffect(() => {
    const unsubscribe = chatWebSocketService.subscribeNotif(notif => callbackRef.current(notif));
    return () => unsubscribe();
  }, []);
}

export function useVideoCallWebSocket(onSignal: (signal: VideoCallSignal) => void) {
  const callbackRef = useRef(onSignal);
  callbackRef.current = onSignal;

  useEffect(() => {
    const unsubscribe = chatWebSocketService.subscribeCall(signal => callbackRef.current(signal));
    return () => unsubscribe();
  }, []);
}
