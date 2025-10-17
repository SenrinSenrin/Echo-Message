import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { actions, useMessengerState } from "@/state/messenger";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Hey there! I am using Nebula Chat ✨");
  const current = useMessengerState((s) => s.currentUserId);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-[0_0_1px_0_rgba(255,255,255,0.2),0_12px_40px_-8px_rgba(0,0,0,0.5)]">
          
          {/* Tabs */}
          <div className="flex mb-6 border-b border-white/10">
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "register"
                  ? "border-b-2 border-blue-500 text-white font-semibold"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Create Account
            </button>
            <button
              className={`flex-1 py-2 text-center ${
                activeTab === "login"
                  ? "border-b-2 border-blue-500 text-white font-semibold"
                  : "text-gray-400"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
          </div>

          {activeTab === "register" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Display name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Kim"
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
              <div className="flex gap-2 pt-2">
                <Button
                  className="bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90"
                  onClick={() => {
                    if (!name.trim()) return;
                    actions.registerOrLogin(name, status);
                    navigate("/");
                  }}
                >
                  Create Account
                </Button>
                {current && (
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Continue as current user
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeTab === "login" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Display name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Kim"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/20"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:opacity-90"
                  onClick={() => {
                    if (!name.trim()) return;
                    actions.registerOrLogin(name);
                    navigate("/");
                  }}
                >
                  Login
                </Button>
                {current && (
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Continue as current user
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
