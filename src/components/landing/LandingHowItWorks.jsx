import React, { useEffect, useRef, useState } from "react";

const steps = [
  {
    num: "01",
    title: "Build your profile",
    body: "Connect your socials and show what you offer. We verify the numbers so trust is built in.",
  },
  {
    num: "02",
    title: "Find your match",
    body: "Browse offers and creators. Filter by reach, niche, and the value on the table.",
  },
  {
    num: "03",
    title: "Trade and track",
    body: "Agree the terms, deliver, and track every trade end to end in one place.",
  },
];

function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function LandingHowItWorks() {
  const [ref, visible] = useScrollReveal();
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <section id="how-it-works" ref={ref} style={{ padding: "96px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: reduced ? "none" : "opacity 0.6s ease, transform 0.6s ease",
        textAlign: "center",
        marginBottom: 64,
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.15em", color: "#2DD4FF", fontWeight: 600, marginBottom: 16 }}>
          HOW IT WORKS
        </div>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 44px)", letterSpacing: "-0.03em", color: "#EAF1F7" }}>
          Simple. Direct. Trackable.
        </h2>
      </div>

      <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
        {steps.map((step, i) => (
          <div key={step.num} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(32px)",
            transition: reduced ? "none" : `opacity 0.55s ease ${i * 100 + 200}ms, transform 0.55s ease ${i * 100 + 200}ms`,
            background: "#121823",
            border: "1px solid #25303F",
            borderRadius: 16,
            padding: "32px 28px",
            cursor: "default",
          }}
            onMouseEnter={e => { if (!reduced) { e.currentTarget.style.borderColor = "#34404F"; e.currentTarget.style.transform = "translateY(-4px)"; } }}
            onMouseLeave={e => { if (!reduced) { e.currentTarget.style.borderColor = "#25303F"; e.currentTarget.style.transform = "translateY(0)"; } }}
          >
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 32,
              fontWeight: 600,
              color: "#2DD4FF",
              marginBottom: 20,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>
              {step.num}
            </div>
            <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 20, color: "#EAF1F7", marginBottom: 12, letterSpacing: "-0.02em" }}>
              {step.title}
            </h3>
            <p style={{ fontSize: 15, color: "#8C97A3", lineHeight: 1.65 }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 780px) {
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}