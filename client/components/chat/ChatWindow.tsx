import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import { Chat, Message, User } from "@shared/api";
import { Button } from "@/components/ui/button";
import { animate, stagger } from "motion";
import { cn } from "@/lib/utils";
import TypingDots from "./TypingDots";

export default function ChatWindow({
  me,
  chat,
  users,
  messages,
  onSend,
  onBack,
}: {
  me: User;
  chat: Chat;
  users: Record<string, User>;
  messages: Message[];
  onSend: (text: string) => void;
  onBack?: () => void;
}) {
  const other = useMemo(
    () => users[chat.participantIds.find((id) => id !== me.id)!],
    [chat, me.id, users],
  );
  const listRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // Animate message bubbles appearing
  useEffect(() => {
    const bubbles = document.querySelectorAll(".bubble");
    if (!bubbles.length) return;
    animate(
      bubbles,
      { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0px)"] },
      { duration: 0.3, delay: stagger(0.02) },
    );
  }, [messages.length]);

  // Typing indicator animation
  useEffect(() => {
    if (!typing) return;
    const dots = document.querySelectorAll(".typing-dot");
    if (!dots.length) return;

    const controls = animate(
      dots,
      { y: [0, -3, 0] },
      {
        duration: 0.8,
        delay: stagger(0.12),
        repeat: Infinity,
        easing: "ease-in-out",
      },
    );

    return () => (controls as any)?.cancel?.();
  }, [typing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    setTyping(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_1px_0_rgba(255,255,255,0.2),0_12px_40px_-8px_rgba(0,0,0,0.5)]">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-white/10 px-3 sm:px-5 py-3">
        <button
          onClick={onBack}
          className={cn(
            "mr-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 sm:hidden",
            onBack ? "" : "hidden",
          )}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                other.online ? "bg-emerald-500" : "bg-zinc-500",
              )}
            />
            <p className="truncate font-semibold">{other.name}</p>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {other.online ? "Online" : other.status || "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3"
      >
        {messages.map((m) => {
          const mine = m.senderId === me.id;
          return (
            <div
              key={m.id}
              className={cn("flex", mine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "bubble max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-md",
                  mine
                    ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-violet-500/20"
                    : "bg-white/10 text-foreground border border-white/10 backdrop-blur",
                )}
              >
                <span className="whitespace-pre-wrap break-words">
                  {m.content}
                </span>
                <div
                  className={cn(
                    "mt-1 text-[10px] opacity-70",
                    mine ? "text-white" : "text-muted-foreground",
                  )}
                >
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 p-2 sm:p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:border-white/20">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setTyping(e.target.value.length > 0);
            }}
            placeholder="Type a message... 😊"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90"
          >
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
