import React, { useEffect, useRef, useState } from "react";

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

const creatorBullets = [
  "Get paid in products you'd post about anyway.",
  "Keep full creative control of every post.",
  "Build a verified record that earns you tiers.",
  "Cash deals optional — stack them on top.",
];

const businessBullets = [
  "Pay in what you already make — not cash.",
  "Match with creators whose numbers are verified.",
  "Put your product in front of the right niche.",
  "Track results on every trade, start to finish.",
];

function Bullet({ text, color }) {
  return (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
      <span style={{ color, fontSize: 16, lineHeight: 1.6, flexShrink: 0 }}>→</span>
      <span style={{ fontSize: 15, color: "#8C97A3", lineHeight: 1.6 }}>{text}</span>
    </li>
  );
}

export default function LandingDualValue() {
  const [ref, visible] = useScrollReveal();
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const panel = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: reduced ? "none" : `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

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
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 44px)", letterSpacing: "-0.03em", color: "#EAF1F7" }}>
            Built for both sides of the trade.
          </h2>
        </div>

        <div className="dual-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* For creators */}
          <div id="for-creators" style={{
            ...panel(100),
            background: "linear-gradient(135deg, rgba(255,77,109,0.06) 0%, #121823 100%)",
            border: "1px solid rgba(255,77,109,0.2)",
            borderRadius: 20,
            padding: "40px 36px",
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.15em", color: "#FF4D6D", fontWeight: 600, marginBottom: 16 }}>FOR CREATORS</div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(22px, 2.2vw, 28px)", color: "#EAF1F7", letterSpacing: "-0.03em", marginBottom: 28, lineHeight: 1.2 }}>
              Earn from the content you'd make anyway.
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0" }}>
              {creatorBullets.map((b) => <Bullet key={b} text={b} color="#FF4D6D" />)}
            </ul>
            <a href="/register" style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#FF4D6D",
              color: "#4B1320",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 10,
              minHeight: 44,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.background = "#FF6B85"; e.target.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.target.style.background = "#FF4D6D"; e.target.style.transform = "translateY(0)"; }}
            >
              Join as a creator
            </a>
          </div>

          {/* For businesses */}
          <div id="for-businesses" style={{
            ...panel(200),
            background: "linear-gradient(135deg, rgba(45,212,255,0.05) 0%, #121823 100%)",
            border: "1px solid rgba(45,212,255,0.18)",
            borderRadius: 20,
            padding: "40px 36px",
          }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.15em", color: "#2DD4FF", fontWeight: 600, marginBottom: 16 }}>FOR BUSINESSES</div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(22px, 2.2vw, 28px)", color: "#EAF1F7", letterSpacing: "-0.03em", marginBottom: 28, lineHeight: 1.2 }}>
              Reach real audiences without ad spend.
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0" }}>
              {businessBullets.map((b) => <Bullet key={b} text={b} color="#2DD4FF" />)}
            </ul>
            <a href="/register" style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#2DD4FF",
              color: "#06303B",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
              padding: "12px 24px",
              borderRadius: 10,
              minHeight: 44,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.background = "#5CDEFF"; e.target.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.target.style.background = "#2DD4FF"; e.target.style.transform = "translateY(0)"; }}
            >
              List your business
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .dual-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}