import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Send, Loader2, Sparkles, ArrowRight } from "lucide-react";
import MessageBubble from "@/components/assistant/MessageBubble";
import { useSEO } from "@/hooks/useSEO";

const AGENT_NAME = "hyperrAssistant";

const SUGGESTIONS = [
  "Find food content creators in Orlando, FL",
  "Show me fashion creators with a mid-size audience",
  "Filter my explore page for fitness creators",
  "Find businesses in the Restaurant & Food category",
];

export default function Assistant() {
  useSEO({ title: "Assistant | hyperr", description: "AI assistant to help you find creators, businesses, and listings on hyperr." });

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Initialize or resume conversation on mount
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;

    (async () => {
      try {
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
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-3">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-display font-bold text-3xl tracking-tight mb-1">
          <span className="text-primary">hyperr Assistant</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Tell me what you're looking for — I'll find it and take you there.
        </p>
      </div>

      {/* Chat container */}
      <div
        className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col"
        style={{ height: "calc(100vh - 300px)", minHeight: "420px" }}
      >
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !sending && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-10 h-10 mb-3 text-primary/40" />
              <p className="text-sm font-medium mb-3 text-foreground">Ask me anything</p>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-left text-sm px-3.5 py-2.5 rounded-xl border border-border bg-background/50 hover:bg-secondary hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground"
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
                <MessageBubble message={{ ...msg, content: displayContent }} />
                {navBlocks.length > 0 && (
                  <div className="ml-9 mt-2 space-y-2">
                    {navBlocks.map((block, i) => {
                      const url = buildUrl(block);
                      const label = block.path === "/explore" && block.params && Object.keys(block.params).length > 0
                        ? "View filtered results"
                        : "Go to page";
                      return (
                        <button
                          key={i}
                          onClick={() => navigate(url)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                        >
                          {label} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {sending && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking…</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to find creators, filter your explore page, or help you navigate…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring max-h-32"
              style={{ minHeight: "42px" }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}