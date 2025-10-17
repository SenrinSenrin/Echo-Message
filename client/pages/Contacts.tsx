import AppShell from "@/components/layout/AppShell";
import { actions, useMessengerState } from "@/state/messenger";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Contacts() {
  const me = useMessengerState((s) => (s.currentUserId ? s.users[s.currentUserId] : undefined));
  const users = useMessengerState((s) => s.users);
  const requests = useMessengerState((s) => s.friendRequests);
  const [q, setQ] = useState("");

  const results = actions.searchUsers(q);

  return (
    <AppShell>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
        <p className="text-sm text-muted-foreground">Find people and manage friend requests.</p>

        {/* Search */}
        <div className="mt-5">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <input
              placeholder="Search by name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Incoming requests */}
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Incoming requests</h2>
          {Object.values(requests)
            .filter((r) => r.status === "pending" && r.toId === me?.id)
            .map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-sm">
                  <span className="font-medium">{users[r.fromId]?.name}</span>
                  <span className="text-muted-foreground"> wants to add you</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90" onClick={() => actions.respondToRequest(r.fromId, true)}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => actions.respondToRequest(r.fromId, false)}>Decline</Button>
                </div>
              </div>
            ))}
        </div>

        {/* Directory */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-muted-foreground">People</h2>
          <div className="mt-3 grid gap-2">
            {results.map((u) => (
              <UserRow key={u.id} userId={u.id} />)
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { actions as A, useMessengerState as useStateStore } from "@/state/messenger";

function UserRow({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const meId = useStateStore((s) => s.currentUserId)!;
  const user = useStateStore((s) => s.users[userId]);
  const relation = A.relation(meId, userId);

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.status}</p>
      </div>
      <div className="flex gap-2">
        {relation === "friend" && (
          <Button size="sm" onClick={() => {
            const chatId = A.ensureChatBetween(meId, userId);
            A.selectChat(chatId);
            navigate("/");
          }}>Message</Button>
        )}
        {relation === "none" && (
          <Button size="sm" className="bg-gradient-to-r from-violet-500 to-blue-500 text-white hover:opacity-90" onClick={() => A.sendFriendRequest(userId)}>Add friend</Button>
        )}
        {relation === "outgoing" && (
          <Button size="sm" variant="outline" onClick={() => A.cancelOutgoing(userId)}>Cancel request</Button>
        )}
        {relation === "incoming" && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => A.respondToRequest(userId, true)}>Accept</Button>
            <Button size="sm" variant="outline" onClick={() => A.respondToRequest(userId, false)}>Decline</Button>
          </div>
        )}
      </div>
    </div>
  );
}
