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
  read: boolean;
  readAt: string | null;
  createdAt: string;
  ownMessage: boolean;
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
