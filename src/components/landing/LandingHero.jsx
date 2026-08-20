import React, { useEffect, useState, useRef } from "react";

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function CountUp({ end, duration = 900, suffix = "" }) {
  const [val, setVal] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) { setVal(end); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [end, duration, reduced]);
  const display = val >= 1000 ? (val / 1000).toFixed(0) + "K" : val.toString();
  return <span>{display}{suffix}</span>;
}

function TradeCard({ reduced }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduced) { setPhase(4); return; }
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 800),
      setTimeout(() => setPhase(4), 1050),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  const slideIn = (dir) => ({
    opacity: phase >= 1 ? 1 : 0,
    transform: phase >= 1 ? "translateX(0)" : dir === "left" ? "translateX(-40px)" : "translateX(40px)",
    transition: reduced ? "none" : "opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1)",
  });

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, minHeight: 220 }}>
      {/* Glow behind */}
      {!reduced && (
        <div style={{
          position: "absolute",
          width: 320,
          height: 220,
          borderRadius: 999,
          background: "radial-gradient(ellipse, rgba(45,212,255,0.08) 0%, transparent 70%)",
          animation: "breathe 4s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}

      {/* Status pill */}
      <div style={{
        position: "absolute",
        top: -18,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: phase >= 4 ? 1 : 0,
        transition: reduced ? "none" : "opacity 0.3s ease, transform 0.3s ease",
        background: "rgba(46,230,166,0.12)",
        border: "1px solid rgba(46,230,166,0.4)",
        color: "#2EE6A6",
        borderRadius: 999,
        padding: "4px 14px",
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}>
        ✓ Completed
      </div>

      {/* Business card */}
      <div style={{
        ...slideIn("left"),
        background: "#121823",
        border: "1px solid #25303F",
        borderRadius: 16,
        padding: "18px 20px",
        width: 170,
        flexShrink: 0,
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#2DD4FF", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
          BUSINESS OFFER
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#EAF1F7", marginBottom: 4, lineHeight: 1.3 }}>Free dinner for 2</div>
        <div style={{ fontSize: 12, color: "#8C97A3", marginBottom: 10 }}>Lumen Bistro · Austin</div>
        <div style={{ background: "rgba(45,212,255,0.08)", border: "1px solid rgba(45,212,255,0.18)", borderRadius: 8, padding: "6px 10px", display: "inline-block" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#2DD4FF", fontWeight: 600 }}>
            {phase >= 2 ? <CountUp end={150} duration={600} suffix=""/> : "$0"}
            {phase >= 2 ? " est." : ""}
          </span>
          {phase < 2 && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#2DD4FF", fontWeight: 600 }}>$0</span>}
        </div>
      </div>

      {/* Swap badge */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #1B2330, #25303F)",
        border: "1px solid #34404F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        color: "#2DD4FF",
        flexShrink: 0,
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? "scale(1) rotate(0deg)" : "scale(0.3) rotate(-90deg)",
        transition: reduced ? "none" : "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        zIndex: 2,
      }}>
        <svg viewBox="0 0 100 100" width="22" height="22" style={{ color: "#2DD4FF" }}>
          <g fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 34 H58" /><path d="M50 24 L71 34 L50 44" />
            <path d="M76 66 H42" /><path d="M50 56 L29 66 L50 76" />
          </g>
        </svg>
      </div>

      {/* Creator card */}
      <div style={{
        ...slideIn("right"),
        background: "#121823",
        border: "1px solid #25303F",
        borderRadius: 16,
        padding: "18px 20px",
        width: 170,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2DD4FF22, #2DD4FF44)",
            border: "2px solid #2DD4FF44",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: 13,
            color: "#2DD4FF",
            flexShrink: 0,
          }}>KT</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#EAF1F7" }}>Kai Tanaka</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#FFC247", fontWeight: 600 }}>◆ GOLD</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#8C97A3" }}>Instagram</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#EAF1F7", fontWeight: 600 }}>
              {phase >= 3 ? <CountUp end={445} duration={500} suffix="K"/> : "0K"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#8C97A3" }}>YouTube</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#EAF1F7", fontWeight: 600 }}>
              {phase >= 3 ? <CountUp end={512} duration={550} suffix="K"/> : "0K"}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

export default function LandingHero() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  const fadeUp = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: reduced ? "none" : `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
  });

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 64 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left: copy */}
          <div>
            <div style={{ ...fadeUp(0), display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <span style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#2DD4FF",
                boxShadow: "0 0 8px #2DD4FF, 0 0 16px rgba(45,212,255,0.4)",
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.15em", color: "#2DD4FF", fontWeight: 600 }}>
                THE BARTER MARKETPLACE
              </span>
            </div>

            <h1 style={{
              ...fadeUp(80),
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(42px, 5.5vw, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "#EAF1F7",
              marginBottom: 24,
            }}>
              Trade products<br />for{" "}
              <span style={{ color: "#2DD4FF" }}>promotion.</span>
            </h1>

            <p style={{
              ...fadeUp(160),
              fontSize: "clamp(15px, 1.5vw, 18px)",
              color: "#8C97A3",
              lineHeight: 1.65,
              marginBottom: 36,
              maxWidth: 480,
            }}>
              hyperr connects businesses and creators to swap real value — products, services, experiences — for content and reach. Cash optional.
            </p>

            <div style={{ ...fadeUp(240), display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="/register" style={{
                background: "#FF4D6D",
                color: "#4B1320",
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                padding: "13px 26px",
                borderRadius: 10,
                transition: "all 0.2s",
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
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
                fontSize: 15,
                fontWeight: 600,
                padding: "13px 26px",
                borderRadius: 10,
                transition: "all 0.2s",
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
              }}
                onMouseEnter={e => { e.target.style.background = "#5CDEFF"; e.target.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.target.style.background = "#2DD4FF"; e.target.style.transform = "translateY(0)"; }}
              >
                List your business
              </a>
            </div>
          </div>

          {/* Right: trade visual */}
          <div style={{ ...fadeUp(120), display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "#8C97A3",
              fontWeight: 600,
              textTransform: "uppercase",
            }}>
              Example
            </div>
            <TradeCard reduced={reduced} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}