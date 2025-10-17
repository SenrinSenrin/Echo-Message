import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { actions, useMessengerState } from "@/state/messenger";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const me = useMessengerState((s) => (s.currentUserId ? s.users[s.currentUserId] : undefined));
  const [name, setName] = useState(me?.name || "");
  const [status, setStatus] = useState(me?.status || "");
  const navigate = useNavigate();

  useEffect(() => {
    if (!theme) setTheme("dark");
  }, [theme, setTheme]);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_0_1px_0_rgba(255,255,255,0.2),0_12px_40px_-8px_rgba(0,0,0,0.5)]">
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Personalize your experience.</p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Status</label>
              <input
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm text-muted-foreground">Theme</label>
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant={resolvedTheme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="bg-white/90 text-foreground hover:bg-white"
              >
                Light
              </Button>
              <Button
                variant={resolvedTheme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90"
              >
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <Button
              className="bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90"
              onClick={() => actions.updateProfile({ name, status })}
            >
              Save changes
            </Button>
            <Button variant="outline" onClick={() => { actions.logout(); navigate("/auth"); }}>Log out</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
