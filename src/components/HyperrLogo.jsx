import React from "react";

// The swap mark SVG from the official hyperr logo pack
const SwapMark = ({ size = 32, className = "" }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
    style={{ color: "inherit" }}
  >
    <g fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 34 H58" />
      <path d="M50 24 L71 34 L50 44" />
      <path d="M76 66 H42" />
      <path d="M50 56 L29 66 L50 76" />
    </g>
  </svg>
);

/**
 * HyperrLogo — official brand lockup (mark + wordmark)
 * variant: "horizontal" | "mark-only" | "stacked"
 * size: "sm" | "md" | "lg"
 */
export default function HyperrLogo({ variant = "horizontal", size = "md", className = "" }) {
  const sizes = {
    sm: { mark: 20, text: 20 },
    md: { mark: 28, text: 26 },
    lg: { mark: 48, text: 46 },
  };
  const { mark, text } = sizes[size] || sizes.md;

  if (variant === "mark-only") {
    return (
      <span className={`text-primary ${className}`} style={{ display: "inline-flex" }}>
        <SwapMark size={mark} />
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span
        className={`text-primary inline-flex flex-col items-center gap-2 ${className}`}
      >
        <SwapMark size={mark} />
        <span
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: text,
            letterSpacing: "-0.045em",
            lineHeight: 1,
            color: "inherit",
          }}
        >
          hyperr
        </span>
      </span>
    );
  }

  // default: horizontal
  return (
    <span
      className={`text-primary inline-flex items-center gap-2 ${className}`}
    >
      <SwapMark size={mark} />
      <span
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: text,
          letterSpacing: "-0.045em",
          lineHeight: 1,
          color: "inherit",
        }}
      >
        hyperr
      </span>
    </span>
  );
}