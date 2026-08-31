import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, ChevronDown } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : ""}`}>
        {!isUser && (
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm"
          }`}
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
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                a: ({ href, children }) => (
                  <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
                code: ({ children }) => <code className="px-1 py-0.5 rounded bg-background/50 text-xs">{children}</code>,
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
    <div className="mt-2 text-xs border-t border-border/40 pt-1.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? "bg-destructive" : "bg-primary"}`} />
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
          {parsedArgs && (
            <div>
              <span className="font-medium text-foreground/70">Parameters:</span>
              <pre className="mt-0.5 p-1.5 rounded bg-background/50 overflow-x-auto text-[11px]">
                {typeof parsedArgs === "string" ? parsedArgs : JSON.stringify(parsedArgs, null, 2)}
              </pre>
            </div>
          )}
          {parsedResults != null && (
            <div>
              <span className="font-medium text-foreground/70">Result:</span>
              <pre className="mt-0.5 p-1.5 rounded bg-background/50 overflow-x-auto text-[11px] max-h-32 overflow-y-auto">
                {typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}