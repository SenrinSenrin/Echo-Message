/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Chat Messenger domain models
 */
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  online: boolean;
  status?: string;
}

export type MessageStatus = "sent" | "delivered" | "read";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string; // supports emoji characters
  timestamp: number; // epoch ms
  status?: MessageStatus;
}

export interface Chat {
  id: string;
  participantIds: string[]; // Includes current user and others
  lastMessage?: Message;
  name?: string; // Group or computed name
}

export type FriendRequestStatus = "pending" | "accepted" | "declined";

export interface FriendRequest {
  id: string;
  fromId: string;
  toId: string;
  status: FriendRequestStatus;
  createdAt: number;
}
