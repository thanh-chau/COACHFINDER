export interface Conversation {
  id: number;
  participantId: number;
  participantUsername: string;
  participantFullName: string;
  participantAvatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  senderFullName: string;
  receiverId: number;
  receiverUsername: string;
  receiverFullName: string;
  content: string;
  messageType?: "TEXT" | "IMAGE" | "PDF" | "VIDEO" | "FILE";
  attachmentUrl?: string | null;
  attachmentPublicId?: string | null;
  attachmentFileName?: string | null;
  attachmentMimeType?: string | null;
  attachmentSizeBytes?: number | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  ownMessage: boolean;
}

export type CallType = "audio" | "video";

export function normalizeCallType(value: unknown): CallType {
  const type = String(value || "").toLowerCase();

  if (type === "video" || type === "video-call" || type === "videocall") {
    return "video";
  }

  return "audio";
}

export type CallSessionStatus =
  | "RINGING"
  | "ACCEPTED"
  | "REJECTED"
  | "MISSED"
  | "CANCELLED"
  | "ENDED"
  | "FAILED";

export interface CallSession {
  id: number;
  conversationId: number;
  callerId: number;
  callerUsername: string;
  callerFullName: string | null;
  calleeId: number;
  calleeUsername: string;
  calleeFullName: string | null;
  callType: CallType;
  status: CallSessionStatus;
  startedAt: string;
  acceptedAt: string | null;
  endedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
  ownCall: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface ChatTarget {
  id?: number;
  userId?: number;
  participantId?: number;
  coachProfileId?: number;
  name?: string;
  username?: string;
  avatar?: string | null;
}
