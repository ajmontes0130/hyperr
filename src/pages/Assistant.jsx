import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Send, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import MessageBubble from "@/components/assistant/MessageBubble";
import { useSEO } from "@/hooks/useSEO";

const AGENT_NAME = "hyperrAssistant";

const SUGGESTIONS = [
  "Find food content creators in Orlando, FL",
  "Show me fashion creators with a mid-size audience",
  "Filter my explore page for fitness creators",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.75, 1.15, 0.75] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 8px rgba(45,212,255,0.85)" }}
        />
      ))}
    </div>
  );
}

export default function Assistant() {
  useSEO({ title: "Assistant | hyperr", description: "AI assistant to help you find creators, businesses, and listings on hyperr." });

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState("");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Initialize or resume conversation on mount
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        if (!cancelled && me?.full_name) setUserName(me.full_name);

        const existing = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        if (cancelled) return;

        let conv;
        if (existing && existing.length > 0) {
          conv = await base44.agents.getConversation(existing[0].id);
        } else {
          conv = await base44.agents.createConversation({
            agent_name: AGENT_NAME,
            metadata: { name: "hyperr Assistant" },
          });
        }
        if (cancelled) return;
        setConversation(conv);
        setMessages(conv.messages || []);

        unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
          if (cancelled) return;
          setMessages(data.messages || []);
          const last = (data.messages || [])[data.messages.length - 1];
          if (last && last.role === "assistant" && last.content) {
            setSending(false);
          }
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to init conversation:", err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    const content = (text || input).trim();
    if (!content || !conversation || sending) return;
    setInput("");
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content });
    } catch (err) {
      console.error("Failed to send message:", err);
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Parse [[NAVIGATE:{...}]] blocks from assistant messages
  const parseNavBlocks = (content) => {
    if (!content) return [];
    const blocks = [];
    const regex = /\[\[NAVIGATE:(\{.*?\})\]\]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      try {
        blocks.push(JSON.parse(match[1]));
      } catch {
        // skip malformed
      }
    }
    return blocks;
  };

  // Strip navigation blocks from displayed content
  const cleanContent = (content) => {
    if (!content) return "";
    return content.replace(/\[\[NAVIGATE:\{.*?\}\]\]/g, "").trim();
  };

  const buildUrl = (block) => {
    const path = block.path || "/explore";
    const params = block.params || {};
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") usp.set(k, v);
    });
    const qs = usp.toString();
    return qs ? `${path}?${qs}` : path;
  };

  if (loading) {
    return (
      <div className="relative flex justify-center py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 25%, rgba(16,48,80,0.55), transparent 60%)" }}
        />
        <TypingDots />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-2xl" style={{ minHeight: "calc(100vh - 80px)" }}>
      <div className="relative flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
        {/* Header */}
        <div className="text-center pt-2 pb-5">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{
              background: "rgba(10, 26, 46, 0.7)",
              border: "1px solid rgba(45, 212, 255, 0.3)",
              boxShadow: "0 0 24px rgba(45, 212, 255, 0.35), inset 0 0 14px rgba(45, 212, 255, 0.18)",
            }}
          >
            <Sparkles
              className="w-7 h-7 text-primary"
              style={{ filter: "drop-shadow(0 0 6px rgba(45,212,255,0.7))" }}
            />
          </div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-1">
            <span className="text-primary" style={{ textShadow: "0 0 18px rgba(45,212,255,0.5)" }}>
              hyperr Assistant
            </span>
          </h1>
          <p className="text-[#8C97A3] text-sm">
            Tell me what you're looking for — I'll find it and take you there.
          </p>
        </div>

        {/* Chat area — fully transparent; only the ambient glow shows through, no box edges */}
        <div
          className="flex-1 overflow-y-auto flex flex-col min-h-0"
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.length === 0 && !sending && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles
                  className="w-10 h-10 mb-3 text-primary/50"
                  style={{ filter: "drop-shadow(0 0 8px rgba(45,212,255,0.4))" }}
                />
                <p className="text-sm font-medium mb-4 text-[#E0F0FF]">Ask me anything</p>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-left text-sm px-3.5 py-2.5 rounded-xl transition-all text-[#8C97A3] hover:text-[#E0F0FF]"
                      style={{
                        background: "rgba(21, 53, 85, 0.25)",
                        border: "1px solid rgba(45, 212, 255, 0.12)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const navBlocks = msg.role === "assistant" ? parseNavBlocks(msg.content) : [];
              const displayContent = msg.role === "assistant" ? cleanContent(msg.content) : msg.content;
              return (
                <div key={idx}>
                  <MessageBubble message={{ ...msg, content: displayContent }} userName={userName} />
                  {navBlocks.length > 0 && (
                    <div className="mr-0 mt-2 flex justify-end">
                      <div className="space-y-2">
                        {navBlocks.map((block, i) => {
                          const url = buildUrl(block);
                          const label =
                            block.path === "/explore" && block.params && Object.keys(block.params).length > 0
                              ? "View filtered results"
                              : "Go to page";
                          return (
                            <button
                              key={i}
                              onClick={() => navigate(url)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                              style={{
                                background: "rgba(45, 212, 255, 0.15)",
                                border: "1px solid rgba(45, 212, 255, 0.4)",
                                color: "#E0F0FF",
                                boxShadow: "0 0 16px rgba(45, 212, 255, 0.25)",
                              }}
                            >
                              {label} <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {sending && (
              <div className="flex justify-end">
                <div className="flex gap-3 max-w-[82%] flex-row-reverse">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-5"
                    style={{
                      background: "rgba(10, 26, 46, 0.85)",
                      border: "1px solid rgba(45, 212, 255, 0.35)",
                      boxShadow: "0 0 18px rgba(45, 212, 255, 0.45), inset 0 0 12px rgba(45, 212, 255, 0.22)",
                    }}
                  >
                    <Sparkles
                      className="w-4 h-4 text-primary"
                      style={{ filter: "drop-shadow(0 0 5px rgba(45,212,255,0.85))" }}
                    />
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className="text-xs font-medium mb-1.5 text-[#E0F0FF]/90"
                      style={{ textShadow: "0 0 8px rgba(45,212,255,0.4)" }}
                    >
                      AI Agent
                    </span>
                    <div
                      className="rounded-2xl rounded-br-md px-4 py-3.5"
                      style={{
                        background: "rgba(21, 53, 85, 0.42)",
                        border: "1px solid rgba(45, 212, 255, 0.16)",
                        boxShadow: "0 0 26px rgba(21, 53, 85, 0.38), inset 0 0 14px rgba(45, 212, 255, 0.06)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      <TypingDots />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me to find creators, filter your explore page, or help you navigate…"
                rows={1}
                className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm text-[#E0F0FF] placeholder:text-[#5C6672] focus-visible:outline-none max-h-32"
                style={{
                  minHeight: "42px",
                  background: "rgba(10, 21, 37, 0.6)",
                  border: "1px solid rgba(45, 212, 255, 0.18)",
                  boxShadow: "inset 0 0 12px rgba(16, 48, 80, 0.3)",
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all"
                style={{
                  background: "rgba(45, 212, 255, 0.18)",
                  border: "1px solid rgba(45, 212, 255, 0.4)",
                  boxShadow: "0 0 16px rgba(45, 212, 255, 0.3)",
                }}
              >
                <Send className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}