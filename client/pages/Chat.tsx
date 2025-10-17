import AppShell from "@/components/layout/AppShell";
import ChatWindow from "@/components/chat/ChatWindow";
import UserList, { type UserListItem } from "@/components/chat/UserList";
import { actions, useMessengerState } from "@/state/messenger";
import { useMemo } from "react";

export default function ChatPage() {
  const meId = useMessengerState((s) => s.currentUserId)!;
  const me = useMessengerState((s) => s.users[s.currentUserId!]);
  const friendIds = useMessengerState((s) => s.friendships[s.currentUserId!] || []);
  const friends = useMemo(() => new Set(friendIds), [friendIds]);
  const users = useMessengerState((s) => s.users);
  const chats = useMessengerState((s) => s.chats);
  const messagesByChat = useMessengerState((s) => s.messagesByChat);
  const selectedChatId = useMessengerState((s) => s.ui.selectedChatId);

  const friendChats = useMemo(() => {
    // Build chat list for friends; ensure chat exists lazily when opening
    const items: UserListItem[] = [];
    for (const friendId of friends) {
      const chatId = actions.ensureChatBetween(meId, friendId);
      const chat = { ...chats[chatId] };
      const msgs = messagesByChat[chatId] || [];
      items.push({ chat, otherUser: users[friendId], lastMessage: msgs[msgs.length - 1] });
    }
    // Sort by last message time desc
    items.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
    return items;
  }, [friends, chats, messagesByChat, users, meId]);

  const currentChatId = selectedChatId || friendChats[0]?.chat.id;
  const chat = currentChatId ? chats[currentChatId] : undefined;
  const messages = currentChatId ? messagesByChat[currentChatId] || [] : [];

  return (
    <AppShell>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        {/* User list */}
        <div className={"sm:col-span-1" + (currentChatId ? " hidden sm:block" : " block") }>
          <UserList
            items={friendChats}
            selectedChatId={currentChatId || null}
            onSelect={(id) => actions.selectChat(id)}
          />
        </div>

        {/* Chat window or empty state */}
        <div className={"sm:col-span-2" + (currentChatId ? " block" : " hidden sm:block") }>
          {chat ? (
            <ChatWindow
              me={me}
              chat={chat}
              users={users}
              messages={messages}
              onSend={(text) => actions.sendMessage(chat.id, meId, text)}
              onBack={() => actions.selectChat(undefined)}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-muted-foreground">
              Add a friend to start chatting.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
