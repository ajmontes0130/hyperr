import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, ChevronDown, User } from "lucide-react";

const bubbleStyle = {
  background: "rgba(21, 53, 85, 0.42)",
  border: "1px solid rgba(45, 212, 255, 0.16)",
  boxShadow: "0 0 26px rgba(21, 53, 85, 0.38), inset 0 0 14px rgba(45, 212, 255, 0.06)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

export default function MessageBubble({ message, userName }) {
  const isUser = message.role === "user";
  const name = isUser ? (userName || "You") : "AI Agent";

  return (
    <div className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
      <div className={`flex gap-3 max-w-[82%] ${isUser ? "" : "flex-row-reverse"}`}>
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-5"
          style={
            isUser
              ? {
                  background: "rgba(10, 21, 37, 0.8)",
                  border: "1px solid rgba(45, 212, 255, 0.22)",
                  boxShadow: "inset 0 0 12px rgba(45, 212, 255, 0.18)",
                }
              : {
                  background: "rgba(10, 26, 46, 0.85)",
                  border: "1px solid rgba(45, 212, 255, 0.35)",
                  boxShadow: "0 0 18px rgba(45, 212, 255, 0.45), inset 0 0 12px rgba(45, 212, 255, 0.22)",
                }
          }
        >
          {isUser ? (
            <User className="w-4 h-4 text-[#E0F0FF]" strokeWidth={1.8} />
          ) : (
            <Sparkles
              className="w-4 h-4 text-primary"
              style={{ filter: "drop-shadow(0 0 5px rgba(45,212,255,0.85))" }}
            />
          )}
        </div>

        {/* Bubble + label */}
        <div className="flex flex-col min-w-0">
          <span
            className={`text-xs font-medium mb-1.5 ${isUser ? "text-[#8C97A3]" : "text-[#E0F0FF]/90"}`}
            style={isUser ? {} : { textShadow: "0 0 8px rgba(45,212,255,0.4)" }}
          >
            {name}
          </span>
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed text-[#E0F0FF] overflow-hidden ${
              isUser ? "rounded-bl-md" : "rounded-br-md"
            }`}
            style={bubbleStyle}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap m-0">{message.content}</p>
            ) : (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="m-0 first:mt-0 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside my-1 pl-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside my-1 pl-1">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  a: ({ href, children }) => (
                    <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  ),
                  code: ({ children }) => (
                    <code className="px-1 py-0.5 rounded bg-black/40 text-xs text-[#E0F0FF]">{children}</code>
                  ),
                }}
              >
                {message.content || ""}
              </ReactMarkdown>
            )}
            {message.tool_calls?.map((tc, idx) => (
              <ToolCallDisplay key={idx} toolCall={tc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall.status || "completed";
  const isFailed = status === "failed" || status === "error";
  const label = toolCall.display_projection?.label || toolCall.name || "Search";

  let parsedArgs = toolCall.arguments_string;
  try { parsedArgs = JSON.parse(toolCall.arguments_string); } catch { /* keep raw */ }

  let parsedResults = toolCall.results;
  if (typeof parsedResults === "string") {
    try { parsedResults = JSON.parse(parsedResults); } catch { /* keep raw */ }
  }

  return (
    <div className="mt-2 text-xs border-t border-[#2DD4FF]/15 pt-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[#8C97A3] hover:text-[#E0F0FF] transition-colors"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? "bg-destructive" : "bg-primary"}`} />
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1 text-xs text-[#8C97A3]">
          {parsedArgs && (
            <div>
              <span className="font-medium text-[#E0F0FF]/70">Parameters:</span>
              <pre className="mt-0.5 p-1.5 rounded bg-black/40 overflow-x-auto text-[11px]">
                {typeof parsedArgs === "string" ? parsedArgs : JSON.stringify(parsedArgs, null, 2)}
              </pre>
            </div>
          )}
          {parsedResults != null && (
            <div>
              <span className="font-medium text-[#E0F0FF]/70">Result:</span>
              <pre className="mt-0.5 p-1.5 rounded bg-black/40 overflow-x-auto text-[11px] max-h-32 overflow-y-auto">
                {typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}