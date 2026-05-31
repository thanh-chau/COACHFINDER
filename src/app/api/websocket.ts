import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAccessToken, getAuthSession } from "../utils/authSession";
import { useEffect, useState } from "react";
import type { ChatMessage as ApiChatMessage } from "../types/chat";

export interface ApiNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface VideoCallSignal {
  type: "offer" | "answer" | "ice" | "end" | "call";
  targetUsername: string;
  senderUsername?: string;
  payload?: any;
}

const API_BASE_URL = "https://be.minhthien.io.vn";

class ChatWebSocketService {
  private client: Client | null = null;
  private messageSubscribers: Set<(message: ApiChatMessage) => void> = new Set();
  private notifSubscribers: Set<(notif: ApiNotification) => void> = new Set();
  private callSubscribers: Set<(signal: VideoCallSignal) => void> = new Set();
  private isConnected = false;

  public connect() {
    if (this.client && this.client.active) return;
    
    const token = getAccessToken();
    if (!token) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws/chat`),
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
      if (this.messageSubscribers.size === 0 && this.notifSubscribers.size === 0) {
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
    if (this.client && this.isConnected) {
      this.client.publish({
        destination: "/app/call.signal",
        body: JSON.stringify(signal)
      });
    }
  }
}

export const chatWebSocketService = new ChatWebSocketService();

export function useChatWebSocket(onMessage: (message: ApiChatMessage) => void) {
  useEffect(() => {
    const unsubscribe = chatWebSocketService.subscribe(onMessage);
    return () => unsubscribe();
  }, [onMessage]);
}

export function useNotificationWebSocket(onNotif: (notif: ApiNotification) => void) {
  useEffect(() => {
    const unsubscribe = chatWebSocketService.subscribeNotif(onNotif);
    return () => unsubscribe();
  }, [onNotif]);
}

export function useVideoCallWebSocket(onSignal: (signal: VideoCallSignal) => void) {
  useEffect(() => {
    const unsubscribe = chatWebSocketService.subscribeCall(onSignal);
    return () => unsubscribe();
  }, [onSignal]);
}
