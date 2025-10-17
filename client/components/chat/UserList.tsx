import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Chat, Message, User } from "@shared/api";

export interface UserListItem {
  chat: Chat;
  otherUser: User;
  lastMessage?: Message;
}

export default function UserList({
  items,
  selectedChatId,
  onSelect,
}: {
  items: UserListItem[];
  selectedChatId?: string | null;
  onSelect: (chatId: string) => void;
}) {
  return (
    <div className="h-full overflow-y-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-2 sm:p-3">
      <div className="space-y-1">
        {items.map(({ chat, otherUser, lastMessage }) => (
          <button
            key={chat.id}
            onClick={() => onSelect(chat.id)}
            className={cn(
              "group w-full rounded-xl border border-transparent p-3 text-left transition hover:bg-white/10",
              selectedChatId === chat.id && "bg-white/10 border-white/15"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={otherUser.avatarUrl} alt={otherUser.name} />
                  <AvatarFallback>{initials(otherUser.name)}</AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                    otherUser.online ? "bg-emerald-500" : "bg-zinc-500"
                  )}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">{otherUser.name}</p>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {lastMessage ? lastMessage.content : otherUser.status || ""}
                </p>
              </div>
              {lastMessage && (
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {timeAgo(lastMessage.timestamp)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
