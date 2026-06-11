import type { CallSession, ChatMessage, ChatTarget, Conversation, PageResponse } from "../types/chat";
import { apiRequest } from "./client";

export function getConversations() {
  return apiRequest<Conversation[]>("/api/v1/chat/conversations");
}

export function createConversation(target: number | Pick<ChatTarget, "participantId" | "userId" | "id" | "coachProfileId">) {
  const body = typeof target === "number"
    ? { participantId: target }
    : {
        participantId: target.participantId ?? target.userId ?? undefined,
        coachProfileId: target.coachProfileId,
      };
  return apiRequest<Conversation>("/api/v1/chat/conversations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getConversationMessages(conversationId: number, page = 0, size = 20) {
  return apiRequest<PageResponse<ChatMessage>>(
    `/api/v1/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`,
  );
}

export function getConversationCalls(conversationId: number, page = 0, size = 10) {
  return apiRequest<PageResponse<CallSession>>(
    `/api/v1/chat/conversations/${conversationId}/calls?page=${page}&size=${size}`,
  );
}

export function sendConversationMessage(conversationId: number, content: string) {
  return apiRequest<ChatMessage>(`/api/v1/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export function getChatUnreadCount() {
  return apiRequest<{ unreadCount: number }>("/api/v1/chat/unread-count");
}

export function markConversationRead(conversationId: number) {
  return apiRequest<void>(`/api/v1/chat/conversations/${conversationId}/read`, {
    method: "PUT",
    allowEmptyData: true,
  });
}

export function deleteConversation(conversationId: number) {
  return apiRequest<void>(`/api/v1/chat/conversations/${conversationId}`, {
    method: "DELETE",
    allowEmptyData: true,
  });
}
