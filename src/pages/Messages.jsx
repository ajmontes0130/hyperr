import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation } from "react-router-dom";
import { Send, Loader2, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function makeThreadId(a, b) {
  return [a, b].sort().join("_");
}

export default function Messages() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const withId = params.get("with");
  const withName = params.get("name");
  const withAvatar = params.get("avatar");

  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]); // list of { threadId, otherName, otherAvatar, otherId, lastMessage, unread }
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [allProfiles, setAllProfiles] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(async (me) => {
      setUser(me);

      // Load all messages involving this user
      const [sent, received, creators, users] = await Promise.all([
        base44.entities.Message.filter({ sender_id: me.id }),
        base44.entities.Message.filter({ recipient_id: me.id }),
        base44.entities.CreatorProfile.list(),
        base44.entities.BusinessProfile ? base44.entities.BusinessProfile.filter({ created_by_id: me.id }) : Promise.resolve([]),
      ]);

      // Build profile lookup
      const profileMap = {};
      creators.forEach((c) => {
        // map creator_profile created_by_id → display info
        if (c.created_by_id) profileMap[c.created_by_id] = { name: c.display_name, avatar: c.avatar_url, id: c.created_by_id };
        // also map by creator profile id itself for direct id references
        profileMap[c.id] = { name: c.display_name, avatar: c.avatar_url, id: c.id };
      });
      setAllProfiles(profileMap);

      const all = [...sent, ...received];

      // Group into threads
      const threadMap = {};
      all.forEach((msg) => {
        const otherId = msg.sender_id === me.id ? msg.recipient_id : msg.sender_id;
        const tid = msg.thread_id || makeThreadId(me.id, otherId);
        if (!threadMap[tid]) {
          threadMap[tid] = {
            threadId: tid,
            otherId,
            otherName: msg.sender_id === me.id ? msg.recipient_name : msg.sender_name,
            otherAvatar: msg.sender_id === me.id ? msg.recipient_avatar : msg.sender_avatar,
            messages: [],
            unread: 0,
          };
        }
        threadMap[tid].messages.push(msg);
        if (msg.recipient_id === me.id && !msg.read) threadMap[tid].unread++;
      });

      const threadList = Object.values(threadMap).sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1]?.created_date || "";
        const bLast = b.messages[b.messages.length - 1]?.created_date || "";
        return bLast.localeCompare(aLast);
      });

      setThreads(threadList);

      // If deep-linked with ?with=...
      if (withId) {
        const existingThread = threadList.find((t) => t.otherId === withId);
        if (existingThread) {
          selectThread(existingThread, me);
        } else {
          // Start a new thread
          const newThread = {
            threadId: makeThreadId(me.id, withId),
            otherId: withId,
            otherName: withName || "Creator",
            otherAvatar: withAvatar || "",
            messages: [],
            unread: 0,
          };
          setThreads((prev) => [newThread, ...prev]);
          selectThread(newThread, me);
        }
      } else if (threadList.length > 0) {
        selectThread(threadList[0], me);
      }
    }).finally(() => setLoading(false));
  }, []);

  const selectThread = async (thread, currentUser) => {
    setActiveThread(thread);
    // Load full messages for this thread
    const [sent, recv] = await Promise.all([
      base44.entities.Message.filter({ sender_id: (currentUser || user)?.id, thread_id: thread.threadId }),
      base44.entities.Message.filter({ recipient_id: (currentUser || user)?.id, thread_id: thread.threadId }),
    ]);
    const merged = [...sent, ...recv].sort((a, b) => a.created_date?.localeCompare(b.created_date));
    setMessages(merged);

    // Mark received as read
    recv.filter((m) => !m.read).forEach((m) => base44.entities.Message.update(m.id, { read: true }));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!draft.trim() || !activeThread || !user) return;
    setSending(true);
    const msg = await base44.entities.Message.create({
      sender_id: user.id,
      sender_name: user.full_name || user.email,
      sender_avatar: "",
      recipient_id: activeThread.otherId,
      recipient_name: activeThread.otherName,
      recipient_avatar: activeThread.otherAvatar || "",
      thread_id: activeThread.threadId,
      content: draft.trim(),
      read: false,
    });
    setMessages((prev) => [...prev, msg]);
    setDraft("");
    setSending(false);

    // update thread list
    setThreads((prev) => {
      const exists = prev.find((t) => t.threadId === activeThread.threadId);
      if (!exists) return [activeThread, ...prev];
      return prev.map((t) => t.threadId === activeThread.threadId ? { ...t, messages: [...t.messages, msg] } : t);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl tracking-tight mb-1">
          <span className="text-primary">Messages</span>
        </h1>
        <p className="text-muted-foreground text-sm">Chat with creators and businesses.</p>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden flex h-[70vh] min-h-[480px]">
        {/* Thread list */}
        <div className="w-72 border-r flex-shrink-0 flex flex-col">
          <div className="p-3 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {threads.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No conversations yet. Message a creator to get started.</p>
              </div>
            ) : (
              threads.map((t) => (
                <button
                  key={t.threadId}
                  onClick={() => selectThread(t)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left ${activeThread?.threadId === t.threadId ? "bg-accent" : ""}`}
                >
                  {t.otherAvatar ? (
                    <img src={t.otherAvatar} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-primary/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.otherName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.messages[t.messages.length - 1]?.content || "No messages yet"}
                    </p>
                  </div>
                  {t.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0">
                      {t.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        {activeThread ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="border-b px-4 py-3 flex items-center gap-3">
              {activeThread.otherAvatar ? (
                <img src={activeThread.otherAvatar} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary/40" />
                </div>
              )}
              <span className="font-semibold text-sm">{activeThread.otherName}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Send a message to start the conversation.
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                      {msg.content}
                      <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                        {new Date(msg.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2">
              <Input
                placeholder="Type a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-xl"
              />
              <Button onClick={send} disabled={sending || !draft.trim()} className="rounded-xl px-4">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Select a conversation or message a creator.</p>
          </div>
        )}
      </div>
    </div>
  );
}