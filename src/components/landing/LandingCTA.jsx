import React, { useEffect, useRef, useState } from "react";

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function LandingCTA() {
  const [ref, visible] = useScrollReveal();
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <section ref={ref} style={{ padding: "96px 24px" }}>
      <div style={{
        maxWidth: 720,
        margin: "0 auto",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: reduced ? "none" : "opacity 0.6s ease, transform 0.6s ease",
      }}>
        <h2 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(32px, 4.5vw, 56px)",
          letterSpacing: "-0.04em",
          color: "#EAF1F7",
          lineHeight: 1.1,
          marginBottom: 20,
        }}>
          Ready to start trading?
        </h2>
        <p style={{ fontSize: 17, color: "#8C97A3", lineHeight: 1.6, marginBottom: 40 }}>
          Set up your profile in minutes. The first trade is closer than you think.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/register" style={{
            background: "#FF4D6D",
            color: "#4B1320",
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 600,
            padding: "14px 30px",
            borderRadius: 12,
            minHeight: 48,
            display: "inline-flex",
            alignItems: "center",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.target.style.background = "#FF6B85"; e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.background = "#FF4D6D"; e.target.style.transform = "translateY(0)"; }}
          >
            Join as a creator
          </a>
          <a href="/register" style={{
            background: "#2DD4FF",
            color: "#06303B",
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 600,
            padding: "14px 30px",
            borderRadius: 12,
            minHeight: 48,
            display: "inline-flex",
            alignItems: "center",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.target.style.background = "#5CDEFF"; e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.background = "#2DD4FF"; e.target.style.transform = "translateY(0)"; }}
          >
            List your business
          </a>
        </div>
      </div>
    </section>
  );
}