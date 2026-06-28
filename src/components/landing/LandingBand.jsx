import React, { useState, useEffect } from "react";

const nouns = ["Products", "Services", "Experiences", "Exposure"];

export default function LandingBand() {
  const [active, setActive] = useState(0);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setActive((a) => (a + 1) % nouns.length), 1400);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div style={{
      borderTop: "1px solid #25303F",
      borderBottom: "1px solid #25303F",
      background: "#0D1219",
      padding: "18px 24px",
      overflow: "hidden",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "12px 8px",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "clamp(12px, 1.2vw, 14px)",
        color: "#5C6672",
        textAlign: "center",
      }}>
        {nouns.map((noun, i) => (
          <React.Fragment key={noun}>
            <span style={{
              color: active === i ? "#2DD4FF" : "#8C97A3",
              background: active === i ? "rgba(45,212,255,0.08)" : "transparent",
              padding: "4px 10px",
              borderRadius: 6,
              transition: reduced ? "none" : "color 0.4s ease, background 0.4s ease",
              fontWeight: active === i ? 600 : 400,
            }}>
              {noun}
            </span>
            {i < nouns.length - 1 && (
              <span style={{ color: "#25303F", userSelect: "none" }}>·</span>
            )}
          </React.Fragment>
        ))}
        <span style={{ color: "#5C6672" }}>— traded directly, no invoices.</span>
      </div>
    </div>
  );
}