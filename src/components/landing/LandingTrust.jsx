import React, { useEffect, useRef, useState } from "react";

const cards = [
  {
    icon: "✓",
    iconColor: "#2DD4FF",
    iconBg: "rgba(45,212,255,0.08)",
    title: "Verified socials",
    body: "Every follower count is checked against the platform itself.",
  },
  {
    icon: "⟳",
    iconColor: "#2EE6A6",
    iconBg: "rgba(46,230,166,0.08)",
    title: "Tracked trades",
    body: "Each deal is logged end to end, with timestamps you can both see.",
  },
  {
    icon: "★",
    iconColor: "#FFC247",
    iconBg: "rgba(255,194,71,0.08)",
    title: "Honest reviews",
    body: "Reviews only unlock after a completed trade. No fakes, no padding.",
  },
  {
    icon: "⚑",
    iconColor: "#FF4D6D",
    iconBg: "rgba(255,77,109,0.08)",
    title: "Dispute support",
    body: "If a trade goes sideways, our team steps in to make it right.",
  },
];

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function LandingTrust() {
  const [ref, visible] = useScrollReveal();
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <section ref={ref} style={{ background: "#0D1219", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: reduced ? "none" : "opacity 0.55s ease, transform 0.55s ease",
          textAlign: "center",
          marginBottom: 56,
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.15em", color: "#2DD4FF", fontWeight: 600, marginBottom: 16 }}>TRUST & SAFETY</div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 44px)", letterSpacing: "-0.03em", color: "#EAF1F7" }}>
            Trade with confidence.
          </h2>
        </div>

        <div className="trust-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {cards.map((card, i) => (
            <div key={card.title} style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(28px)",
              transition: reduced ? "none" : `opacity 0.5s ease ${i * 80 + 150}ms, transform 0.5s ease ${i * 80 + 150}ms`,
              background: "#121823",
              border: "1px solid #25303F",
              borderRadius: 16,
              padding: "28px 24px",
              cursor: "default",
            }}
              onMouseEnter={e => { if (!reduced) { e.currentTarget.style.borderColor = "#34404F"; e.currentTarget.style.transform = "translateY(-4px)"; } }}
              onMouseLeave={e => { if (!reduced) { e.currentTarget.style.borderColor = "#25303F"; e.currentTarget.style.transform = "translateY(0)"; } }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: card.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                color: card.iconColor,
                marginBottom: 20,
              }}>
                {card.icon}
              </div>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: "#EAF1F7", marginBottom: 10, letterSpacing: "-0.02em" }}>
                {card.title}
              </h3>
              <p style={{ fontSize: 14, color: "#8C97A3", lineHeight: 1.6 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 580px) {
          .trust-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}