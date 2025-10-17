import { Chat, FriendRequest, FriendRequestStatus, Message, User } from "@shared/api";
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "echo_message_v1";

export interface MessengerState {
  users: Record<string, User>;
  friendRequests: Record<string, FriendRequest>;
  friendships: Record<string, string[]>; // map of userId -> friendIds
  chats: Record<string, Chat>;
  chatIndex: Record<string, string>; // key(me,other) -> chatId
  messagesByChat: Record<string, Message[]>;
  currentUserId?: string;
  ui: { selectedChatId?: string };
}

let state: MessengerState = load() ?? createDemoState();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load(): MessengerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function createDemoState(): MessengerState {
  const me: User = { id: crypto.randomUUID(), name: "You", online: true, status: "Ready to chat" };
  const u1: User = { id: crypto.randomUUID(), name: "Ava Stone", online: true, status: "Typing..." };
  const u2: User = { id: crypto.randomUUID(), name: "Liam Park", online: false, status: "Last seen 2h ago" };
  const u3: User = { id: crypto.randomUUID(), name: "Noah Chen", online: true, status: "At work" };
  const u4: User = { id: crypto.randomUUID(), name: "Mia Patel", online: true, status: "Coffee time ☕" };

  const users: Record<string, User> = { [me.id]: me, [u1.id]: u1, [u2.id]: u2, [u3.id]: u3, [u4.id]: u4 };

  const s: MessengerState = {
    users,
    friendRequests: {},
    friendships: { [me.id]: [], [u1.id]: [], [u2.id]: [], [u3.id]: [], [u4.id]: [] },
    chats: {},
    chatIndex: {},
    messagesByChat: {},
    currentUserId: undefined,
    ui: {},
  };
  return s;
}

const listeners = new Set<() => void>();
function notify() {
  persist();
  for (const l of listeners) l();
}
export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState(): MessengerState {
  return state;
}

function setState(patch: Partial<MessengerState>) {
  state = { ...state, ...patch };
  notify();
}

export function useMessengerState<T = MessengerState>(selector?: (s: MessengerState) => T): T {
  return useSyncExternalStore(subscribe, () => (selector ? selector(state) : (state as unknown as T)));
}

function keyFor(a: string, b: string) {
  return [a, b].sort().join(":");
}

export const actions = {
  registerOrLogin(name: string, status?: string) {
    const existing = Object.values(state.users).find((u) => u.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
      setState({ currentUserId: existing.id });
      return existing;
    }
    const id = crypto.randomUUID();
    const user: User = { id, name: name.trim(), online: true, status };
    state.users[id] = user;
    state.friendships[id] = [];
    setState({ users: state.users, friendships: state.friendships, currentUserId: id });
    return user;
  },
  logout() {
    setState({ currentUserId: undefined, ui: { selectedChatId: undefined } });
  },
  updateProfile(partial: Partial<User>) {
    if (!state.currentUserId) return;
    const u = state.users[state.currentUserId];
    state.users[state.currentUserId] = { ...u, ...partial };
    setState({ users: state.users });
  },
  searchUsers(query: string) {
    const me = state.currentUserId;
    const q = query.trim().toLowerCase();
    return Object.values(state.users)
      .filter((u) => u.id !== me && (!q || u.name.toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  relation(meId: string, otherId: string): "friend" | "incoming" | "outgoing" | "none" {
    const friends = new Set(state.friendships[meId] || []);
    if (friends.has(otherId)) return "friend";
    const req = Object.values(state.friendRequests).find(
      (r) => r.status === "pending" && ((r.fromId === meId && r.toId === otherId) || (r.fromId === otherId && r.toId === meId)),
    );
    if (!req) return "none";
    return req.fromId === meId ? "outgoing" : "incoming";
  },
  sendFriendRequest(toId: string) {
    const me = state.currentUserId!;
    const rel = actions.relation(me, toId);
    if (rel !== "none") return;
    const id = crypto.randomUUID();
    const fr: FriendRequest = { id, fromId: me, toId, status: "pending", createdAt: Date.now() };
    state.friendRequests[id] = fr;
    setState({ friendRequests: state.friendRequests });
  },
  cancelOutgoing(toId: string) {
    const me = state.currentUserId!;
    const req = Object.values(state.friendRequests).find((r) => r.status === "pending" && r.fromId === me && r.toId === toId);
    if (!req) return;
    delete state.friendRequests[req.id];
    setState({ friendRequests: state.friendRequests });
  },
  respondToRequest(fromId: string, accept: boolean) {
    const me = state.currentUserId!;
    const req = Object.values(state.friendRequests).find((r) => r.status === "pending" && r.fromId === fromId && r.toId === me);
    if (!req) return;
    req.status = accept ? "accepted" : "declined";
    state.friendRequests[req.id] = req;
    if (accept) {
      state.friendships[me] = [...new Set([...(state.friendships[me] || []), fromId])];
      state.friendships[fromId] = [...new Set([...(state.friendships[fromId] || []), me])];
    }
    setState({ friendRequests: state.friendRequests, friendships: state.friendships });
  },
  ensureChatBetween(a: string, b: string) {
    const k = keyFor(a, b);
    let id = state.chatIndex[k];
    if (!id) {
      id = crypto.randomUUID();
      const chat: Chat = { id, participantIds: [a, b] };
      state.chats[id] = chat;
      state.chatIndex[k] = id;
      state.messagesByChat[id] = [];
      setState({ chats: state.chats, chatIndex: state.chatIndex, messagesByChat: state.messagesByChat });
    }
    return id;
  },
  sendMessage(chatId: string, senderId: string, content: string) {
    const m: Message = { id: crypto.randomUUID(), chatId, senderId, content, timestamp: Date.now() };
    state.messagesByChat[chatId] = [...(state.messagesByChat[chatId] || []), m];
    const c = state.chats[chatId];
    c.lastMessage = m;
    state.chats[chatId] = c;
    setState({ messagesByChat: state.messagesByChat, chats: state.chats });
  },
  selectChat(chatId?: string) {
    state.ui.selectedChatId = chatId;
    setState({ ui: state.ui });
  },
};
