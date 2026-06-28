import React, { useEffect, useRef, useState } from "react";

const tiers = [
  { name: "Diamond", color: "#7FE9FF", desc: "Top-tier reach with a flawless trade record." },
  { name: "Platinum", color: "#C9D6E3", desc: "Proven creators with consistent results." },
  { name: "Gold", color: "#FFC247", desc: "Established reach and reliable delivery." },
  { name: "Silver", color: "#A8B2BD", desc: "Growing audience with a solid history." },
  { name: "Bronze", color: "#D08A5A", desc: "New to hyperr, building a track record." },
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

function DiamondShape({ color, size = 18 }) {
  return (
    <div style={{
      width: size,
      height: size,
      background: color,
      transform: "rotate(45deg)",
      borderRadius: 3,
      flexShrink: 0,
      boxShadow: `0 0 8px ${color}55`,
    }} />
  );
}

export default function LandingTiers() {
  const [ref, visible] = useScrollReveal();
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [hovered, setHovered] = useState(null);

  return (
    <section id="tiers" ref={ref} style={{ padding: "96px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: reduced ? "none" : "opacity 0.55s ease, transform 0.55s ease",
        textAlign: "center",
        marginBottom: 56,
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.15em", color: "#2DD4FF", fontWeight: 600, marginBottom: 16 }}>CREATOR TIERS</div>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 44px)", letterSpacing: "-0.03em", color: "#EAF1F7", marginBottom: 12 }}>
          Tiers are earned, not bought.
        </h2>
        <p style={{ fontSize: 15, color: "#8C97A3" }}>Verified data only — no shortcuts.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640, margin: "0 auto" }}>
        {tiers.map((tier, i) => (
          <div key={tier.name} style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: reduced ? "none" : `opacity 0.5s ease ${i * 80 + 200}ms, transform 0.5s ease ${i * 80 + 200}ms`,
            display: "flex",
            alignItems: "center",
            gap: 20,
            background: hovered === i ? "#1B2330" : "#121823",
            border: `1px solid ${hovered === i ? tier.color + "55" : "#25303F"}`,
            borderRadius: 14,
            padding: "18px 24px",
            cursor: "default",
            boxShadow: hovered === i ? `0 0 20px ${tier.color}18` : "none",
            transition: reduced ? "none" : `all 0.22s ease, opacity 0.5s ease ${i * 80 + 200}ms, transform 0.5s ease ${i * 80 + 200}ms`,
          }}
            onMouseEnter={() => !reduced && setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <DiamondShape color={tier.color} size={20} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: tier.color, minWidth: 76, letterSpacing: "0.03em" }}>
              {tier.name.toUpperCase()}
            </div>
            <div style={{ width: 1, height: 28, background: "#25303F", flexShrink: 0 }} />
            <div style={{ fontSize: 14, color: "#8C97A3", lineHeight: 1.5 }}>{tier.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}