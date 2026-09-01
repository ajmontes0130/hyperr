import React, { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation } from "react-router-dom";
import { Send, Loader2, MessageCircle, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import OfferModal from "@/components/messages/OfferModal";
import OfferBubble from "@/components/messages/OfferBubble";
import BlockReportMenu from "@/components/BlockReportMenu";
import { getDateLabel, formatMessageTime, getDateKey } from "@/lib/messageDates";

function makeThreadId(a, b) {
  return [a, b].sort().join("_");
}

export default function Messages() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const withId = params.get("with");
  const withName = params.get("name");
  const withAvatar = params.get("avatar");
  const tradeContext = params.get("trade"); // listing title linked from trade

  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]); // list of { threadId, otherName, otherAvatar, otherId, lastMessage, unread }
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [allProfiles, setAllProfiles] = useState({});
  const [offers, setOffers] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
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
            tradeTitle: tradeContext || null,
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

    // Load offers for this thread
    try {
      const threadOffers = await base44.entities.ConversationOffer.filter({ thread_id: thread.threadId });
      setOffers(threadOffers.sort((a, b) => a.created_date?.localeCompare(b.created_date)));
    } catch (e) {
      setOffers([]);
    }

    // Mark received as read
    recv.filter((m) => !m.read).forEach((m) => base44.entities.Message.update(m.id, { read: true }));
  };

  // Merge messages + offers into one timeline sorted by date
  const timeline = useMemo(() => {
    const items = [
      ...messages.map((m) => ({ kind: "message", id: m.id, date: m.created_date, data: m })),
      ...offers.map((o) => ({ kind: "offer", id: o.id, date: o.created_date, data: o })),
    ];
    return items.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  }, [messages, offers]);

  // Refresh offers when a new one is sent from the modal
  useEffect(() => {
    const handler = () => {
      if (activeThread) {
        base44.entities.ConversationOffer.filter({ thread_id: activeThread.threadId })
          .then((o) => setOffers(o.sort((a, b) => a.created_date?.localeCompare(b.created_date))))
          .catch(() => {});
      }
    };
    window.addEventListener("offer-sent", handler);
    return () => window.removeEventListener("offer-sent", handler);
  }, [activeThread]);

  const handleOfferUpdate = (updated) => {
    setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
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

      {/* Desktop: side-by-side | Mobile: show thread list OR chat */}
      <div className="bg-card rounded-2xl border overflow-hidden flex h-[70vh] min-h-[480px]">
        {/* Thread list — hidden on mobile when a thread is open */}
        <div className={`${activeThread ? "hidden sm:flex" : "flex"} w-full sm:w-72 border-r flex-shrink-0 flex-col`}>
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

        {/* Chat area — full width on mobile */}
        {activeThread ? (
          <div className="flex-1 flex flex-col min-w-0 w-full">
            {/* Header */}
            <div className="border-b px-3 py-3 flex items-center gap-3">
              {/* Back button on mobile */}
              <button
                className="sm:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => setActiveThread(null)}
              >
                ‹
              </button>
              {activeThread.otherAvatar ? (
                <img src={activeThread.otherAvatar} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary/40" />
                </div>
              )}
              <div>
                <span className="font-semibold text-sm">{activeThread.otherName}</span>
                {activeThread.tradeTitle && (
                  <p className="text-xs text-muted-foreground">Re: {activeThread.tradeTitle}</p>
                )}
              </div>
              <div className="ml-auto">
                <BlockReportMenu
                  targetUserId={activeThread.otherId}
                  targetName={activeThread.otherName}
                  currentUserId={user?.id}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {timeline.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Send a message to start the conversation.
                </div>
              )}
              {timeline.map((item, idx) => {
                const prevItem = timeline[idx - 1];
                const showSeparator = !prevItem || getDateKey(prevItem.date) !== getDateKey(item.date);
                const dateLabel = getDateLabel(item.date);
                const separator = showSeparator && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-xs font-medium text-muted-foreground bg-card px-3 py-1 rounded-full border">{dateLabel}</span>
                  </div>
                );

                if (item.kind === "offer") {
                  const offer = item.data;
                  const isMine = offer.sender_id === user?.id;
                  return (
                    <React.Fragment key={`offer-${offer.id}`}>
                      {separator}
                      <OfferBubble
                        offer={offer}
                        isMine={isMine}
                        onUpdate={handleOfferUpdate}
                      />
                    </React.Fragment>
                  );
                }
                const msg = item.data;
                const isMe = msg.sender_id === user?.id;
                return (
                  <React.Fragment key={msg.id}>
                    {separator}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                        {msg.content}
                        <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-muted-foreground"}`}>
                          {formatMessageTime(msg.created_date)}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 space-y-2">
              <button
                onClick={() => setShowOfferModal(true)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Send an offer / contract
              </button>
              <div className="flex gap-2">
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

            <OfferModal
              open={showOfferModal}
              onClose={() => setShowOfferModal(false)}
              thread={activeThread}
              user={user}
            />
          </div>
        ) : (
          <div className="hidden sm:flex flex-1 flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Select a conversation or message a creator.</p>
          </div>
        )}
      </div>
    </div>
  );
}