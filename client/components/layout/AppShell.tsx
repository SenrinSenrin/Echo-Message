import { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { MessageSquareText, Users2, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(1200px_600px_at_10%_-10%,hsl(260_80%_18%/.6),transparent),radial-gradient(1000px_500px_at_100%_20%,hsl(220_80%_18%/.5),transparent)] bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-2 sm:px-4 py-3 sm:py-6">
        <div className="flex gap-3 sm:gap-6">
          {/* Sidebar */}
          <aside className="hidden sm:flex sticky top-3 h-[calc(100vh-1.5rem)] w-16 flex-col items-center justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 shadow-[0_0_1px_0_rgba(255,255,255,0.2),0_12px_40px_-8px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <nav className="flex flex-col items-center gap-2">
              <SideLink to="/" title="Chats" icon={<MessageSquareText />} />
              <SideLink to="/contacts" title="Contacts" icon={<Users2 />} />
              <SideLink to="/settings" title="Settings" icon={<Settings />} />
            </nav>
            <div />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SideLink({ to, title, icon }: { to: string; title: string; icon: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "group relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition hover:text-foreground",
          "hover:bg-white/10",
          isActive && "text-primary shadow-[0_0_0_1px_hsl(var(--primary)/.5)] bg-white/10"
        )
      }
      title={title}
    >
      <span className="sr-only">{title}</span>
      <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
    </NavLink>
  );
}
