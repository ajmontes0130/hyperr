import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

/* ─────────────────────────────────────────────────────── */
/* hooks                                                    */
/* ─────────────────────────────────────────────────────── */
function useReducedMotion() {
  const [rm, setRm] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const h = (e) => setRm(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return rm;
}

function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rm) { setVisible(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useCountUp(end, duration, active, rm) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (rm) { setVal(end); return; }
    let startTs = null;
    const raf = (ts) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [active, end, duration, rm]);
  return val;
}

/* ─────────────────────────────────────────────────────── */
/* whale background                                        */
/* ─────────────────────────────────────────────────────── */
const WHALE_CONFIGS = [
  { topPct: 27, width: 230, opacity: 0.06, blur: 5, fill: "#173343", dir: -1, speed: 20 },
  { topPct: 16, width: 262, opacity: 0.085, blur: 4, fill: "#173343", dir: 1, speed: 24 },
  { topPct: 60, width: 300, opacity: 0.10, blur: 3, fill: "#1A3A4D", dir: -1, speed: 33 },
  { topPct: 40, width: 344, opacity: 0.12, blur: 2, fill: "#1A3A4D", dir: 1, speed: 42 },
  { topPct: 78, width: 404, opacity: 0.14, blur: 1.5, fill: "#1C404F", dir: 1, speed: 54 },
];

const BOB_PHASES = [0, 1.1, 2.3, 0.7, 1.9];
const BOB_AMTS = [6, 5, 8, 5, 7];

function WhaleSVG({ fill, width }) {
  return (
    <svg
      viewBox="0 0 240 96"
      width={width}
      height={(width * 96) / 240}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path d="M16,56 C16,44 30,38 52,37 C104,34 150,34 188,40 C200,42 210,40 220,34 L236,22 C228,33 226,38 232,44 L236,68 C226,60 214,58 200,58 C150,62 104,64 56,60 C30,58 16,68 16,56 Z" />
      <path d="M84,60 C92,74 110,80 122,75 C112,69 98,64 92,59 Z" />
    </svg>
  );
}

function WhaleBackground({ rm }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(
    WHALE_CONFIGS.map((cfg) => ({
      ...cfg,
      x: cfg.dir === 1 ? -(cfg.width + 50) : (typeof window !== "undefined" ? window.innerWidth : 1440) + 50,
    }))
  );
  const rafRef = useRef(null);

  useEffect(() => {
    if (rm || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Pre-render whale silhouettes as offscreen canvases.
    // Whale faces LEFT: rounded head at left (x=0), tail flukes at right (x=240).
    // dir=-1 (moving left): draw as-is — head leads left. ✓
    // dir=1  (moving right): flip horizontally — head leads right. ✓
    const whaleCache = WHALE_CONFIGS.map((cfg) => {
      const wh = (cfg.width * 96) / 240;
      const oc = document.createElement("canvas");
      oc.width = cfg.width;
      oc.height = wh;
      const octx = oc.getContext("2d");
      octx.fillStyle = cfg.fill;
      const sx = cfg.width / 240;
      const sy = wh / 96;
      octx.save();
      octx.scale(sx, sy);
      // Body — rounded head at LEFT (x≈4), narrows to tail stock at RIGHT (x≈200)
      octx.beginPath();
      octx.moveTo(4, 48);
      octx.bezierCurveTo(4, 28, 20, 18, 48, 16);
      octx.bezierCurveTo(100, 12, 160, 14, 196, 22);
      octx.bezierCurveTo(210, 26, 218, 30, 220, 38);
      octx.lineTo(220, 58);
      octx.bezierCurveTo(218, 66, 210, 70, 196, 74);
      octx.bezierCurveTo(160, 82, 100, 84, 48, 80);
      octx.bezierCurveTo(20, 78, 4, 68, 4, 48);
      octx.closePath();
      octx.fill();
      // Tail flukes at RIGHT — upper fluke
      octx.beginPath();
      octx.moveTo(218, 38);
      octx.bezierCurveTo(228, 24, 238, 14, 236, 6);
      octx.bezierCurveTo(230, 12, 224, 24, 220, 36);
      octx.closePath();
      octx.fill();
      // lower fluke
      octx.beginPath();
      octx.moveTo(218, 58);
      octx.bezierCurveTo(228, 72, 238, 82, 236, 90);
      octx.bezierCurveTo(230, 84, 224, 72, 220, 60);
      octx.closePath();
      octx.fill();
      octx.restore();
      return oc;
    });

    let prevTs = null;

    const tick = (ts) => {
      if (!prevTs) prevTs = ts;
      const dt = Math.min((ts - prevTs) / 1000, 0.05);
      prevTs = ts;

      const t = ts / 1000;
      const breath = (Math.sin((2 * Math.PI * t) / 18) + 1) / 2;
      const bps = 0.45 + 1.5 * breath;
      const frac = (t * bps) % 1;
      const lub = Math.exp(-Math.pow((frac - 0.05) / 0.05, 2));
      const dub = 0.6 * Math.exp(-Math.pow((frac - 0.22) / 0.06, 2));
      const surge = lub + dub;
      const speedMult = (0.35 + 0.55 * breath) + surge * 1.25;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // glow pulse
      const glowAlpha = 0.04 + surge * 0.11;
      const glowScale = 1 + surge * 0.3;
      const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, (w * 0.5) * glowScale);
      grd.addColorStop(0, `rgba(45,212,255,${glowAlpha})`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // fade mask values (top/bottom 15%)
      const fadeH = h * 0.15;

      if (!stateRef.current) return;
      stateRef.current.forEach((whale, i) => {
        const cfg = WHALE_CONFIGS[i];
        whale.x += cfg.dir * cfg.speed * speedMult * dt;
        const wh = (cfg.width * 96) / 240;
        if (cfg.dir === 1 && whale.x > w + 50) whale.x = -cfg.width - 50;
        if (cfg.dir === -1 && whale.x < -cfg.width - 50) whale.x = w + 50;

        const baseY = (cfg.topPct / 100) * h;
        // primary vertical bob + a slower undulation for organic feel
        const bobY = Math.sin(t * 0.5 + BOB_PHASES[i]) * BOB_AMTS[i]
                   + Math.sin(t * 0.18 + BOB_PHASES[i] * 0.5) * BOB_AMTS[i] * 0.4;
        const y = baseY + bobY;

        // compute fade alpha based on y position
        let fadeAlpha = 1;
        if (y < fadeH) fadeAlpha = Math.max(0, y / fadeH);
        else if (y + wh > h - fadeH) fadeAlpha = Math.max(0, (h - y - wh) / fadeH);

        // gentle pitch: nose dips slightly on the downstroke, rises on upstroke
        const bobVel = Math.cos(t * 0.5 + BOB_PHASES[i]) * 0.5 * BOB_AMTS[i]
                     + Math.cos(t * 0.18 + BOB_PHASES[i] * 0.5) * 0.18 * BOB_AMTS[i] * 0.4;
        const pitch = Math.atan2(bobVel, cfg.speed) * 0.6;

        const cx = whale.x + cfg.width / 2;
        const cy = y + (cfg.width * 96) / 240 / 2;

        ctx.save();
        ctx.globalAlpha = cfg.opacity * fadeAlpha;
        ctx.filter = `blur(${cfg.blur}px)`;
        ctx.translate(cx, cy);

        if (cfg.dir === 1) {
          // moving right: flip so head points right
          ctx.scale(-1, 1);
          ctx.rotate(-pitch);
        } else {
          // moving left: head already points left
          ctx.rotate(pitch);
        }

        ctx.drawImage(whaleCache[i], -cfg.width / 2, -(cfg.width * 96) / 240 / 2);
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [rm]);

  if (rm) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────── */
/* constants                                               */
/* ─────────────────────────────────────────────────────── */
const mono = { fontFamily: "'JetBrains Mono', monospace" };
const bricolage = { fontFamily: "'Bricolage Grotesque', sans-serif" };

/* ─────────────────────────────────────────────────────── */
/* stats                                                   */
/* ─────────────────────────────────────────────────────── */
function buildStats(stats) {
  return [
    { label: "Active trades", value: stats.active, isCyan: false },
    { label: "Completed", value: stats.completed, isCyan: false },
    { label: "Value traded", value: stats.valueTraded, isCyan: true, isValue: true },
    { label: "Avg rating", value: stats.avgRating, isCyan: false, isRating: true },
  ];
}

function StatCard({ stat, active, rm }) {
  const raw = useCountUp(stat.isRating ? Math.round(stat.value * 10) : stat.value, 900, active, rm);
  let display;
  if (stat.isValue) {
    if (raw >= 1000) display = "$" + (raw / 1000).toFixed(1) + "K";
    else display = "$" + raw;
  } else if (stat.isRating) {
    display = (raw / 10).toFixed(1);
  } else {
    display = String(raw);
  }

  return (
    <div
      style={{
        background: "#121823",
        border: "1px solid #25303F",
        borderRadius: 14,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 12, color: "#8C97A3", fontWeight: 500 }}>{stat.label}</span>
      <span
        style={{
          ...mono,
          fontSize: 30,
          fontWeight: 700,
          color: stat.isCyan ? "#2DD4FF" : "#EAF1F7",
          lineHeight: 1,
        }}
      >
        {display}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* welcome section                                         */
/* ─────────────────────────────────────────────────────── */
function Welcome({ rm, user, stats }) {
  const [ref, vis] = useScrollReveal(0.05);
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const activeCount = stats.active;
  const subline = activeCount > 0
    ? `${activeCount} trade${activeCount !== 1 ? "s" : ""} in motion. Here's what's moving today.`
    : "Your dashboard is ready. Find your first trade below.";

  return (
    <section ref={ref} style={{ marginBottom: 48 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(18px)",
            transition: rm ? "none" : "opacity 0.55s cubic-bezier(.16,1,.3,1), transform 0.55s cubic-bezier(.16,1,.3,1)",
          }}
        >
          <div
            style={{
              ...mono,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: "#2DD4FF",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Your Home
          </div>
          <h1
            style={{
              ...bricolage,
              fontWeight: 800,
              fontSize: "clamp(36px,5vw,52px)",
              letterSpacing: "-0.04em",
              color: "#EAF1F7",
              lineHeight: 1.05,
              margin: "0 0 10px",
            }}
          >
            Welcome back, {firstName}.
          </h1>
          <p style={{ fontSize: 15, color: "#8C97A3", lineHeight: 1.6, margin: 0 }}>
            {subline}
          </p>
        </div>

        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#2DD4FF",
            color: "#06303B",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 14,
            padding: "11px 20px",
            borderRadius: 10,
            minHeight: 44,
            flexShrink: 0,
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(14px)",
            transition: rm ? "none" : "opacity 0.6s ease 200ms, transform 0.6s ease 200ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#5CDEFF"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#2DD4FF"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          Browse all offers <ArrowRight size={14} />
        </Link>
      </div>

      {/* stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(22px)",
          transition: rm ? "none" : "opacity 0.6s cubic-bezier(.16,1,.3,1) 120ms, transform 0.6s cubic-bezier(.16,1,.3,1) 120ms",
        }}
      >
        {buildStats(stats).map((s) => (
          <StatCard key={s.label} stat={s} active={vis} rm={rm} />
        ))}
      </div>
    </section>
  );
}

function OfferCard({ listing, delay, rm }) {
  const [ref, vis] = useScrollReveal(0.08);
  const [saved, setSaved] = useState(false);
  const val = useCountUp(listing.estimated_value || 0, 800, vis, rm);
  const tags = [listing.category, ...(listing.offering_type ? [listing.offering_type] : [])].filter(Boolean).map(t => t.toUpperCase().slice(0, 10));

  return (
    <div
      ref={ref}
      style={{
        background: "#121823",
        border: "1px solid #25303F",
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: "pointer",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(22px)",
        transition: rm
          ? "none"
          : `opacity 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.6s cubic-bezier(.16,1,.3,1) ${delay}ms, border-color 0.18s`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#34404F"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#25303F"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{ ...mono, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "#1B2330", color: "#5C6672", letterSpacing: "0.06em" }}>
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
          aria-label="Save offer"
          style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${saved ? "#2DD4FF" : "#25303F"}`, background: saved ? "rgba(45,212,255,0.08)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: saved ? "#2DD4FF" : "#5C6672", flexShrink: 0, transition: "border-color 0.18s, background 0.18s, color 0.18s" }}
        >
          <Heart size={13} fill={saved ? "#2DD4FF" : "none"} />
        </button>
      </div>

      <div>
        <h3 style={{ ...bricolage, fontWeight: 700, fontSize: 19, color: "#EAF1F7", letterSpacing: "-0.02em", margin: "0 0 4px", lineHeight: 1.2 }}>
          {listing.title}
        </h3>
        <p style={{ fontSize: 12.5, color: "#8C97A3", margin: 0 }}>
          {listing.location || "Location TBD"}
        </p>
      </div>

      <p style={{ fontSize: 12.5, color: "#5C6672", margin: 0 }}>
        <span style={{ color: "#8C97A3" }}>Wants: </span>
        {(listing.wanted_promotion_type || []).join(", ") || listing.offering_details?.slice(0, 60) || "Promotion"}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: "auto" }}>
        <div style={{ lineHeight: 1 }}>
          {listing.estimated_value ? (
            <>
              <span style={{ ...mono, fontSize: 20, fontWeight: 700, color: "#EAF1F7" }}>${val}</span>
              <span style={{ ...mono, fontSize: 11, color: "#5C6672", marginLeft: 5 }}>value</span>
            </>
          ) : (
            <span style={{ ...mono, fontSize: 13, color: "#5C6672" }}>Value TBD</span>
          )}
        </div>
        <Link
          to={`/listing/${listing.id}`}
          style={{ ...mono, fontSize: 11.5, fontWeight: 600, padding: "8px 14px", borderRadius: 8, background: "#2DD4FF", color: "#06303B", border: "none", cursor: "pointer", minHeight: 34, transition: "background 0.18s", whiteSpace: "nowrap", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#5CDEFF")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2DD4FF")}
        >
          Propose trade
        </Link>
      </div>
    </div>
  );
}

function OffersGrid({ rm, listings }) {
  const [ref, vis] = useScrollReveal(0.05);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        ref={ref}
        style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 20, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(14px)", transition: rm ? "none" : "opacity 0.5s ease, transform 0.5s ease" }}
      >
        <h2 style={{ ...bricolage, fontWeight: 700, fontSize: 22, color: "#EAF1F7", margin: 0, letterSpacing: "-0.025em" }}>
          Offers for you
        </h2>
        <span style={{ ...mono, fontSize: 11, color: "#5C6672" }}>matched to your reach</span>
      </div>

      {listings.length === 0 && (
        <div style={{ background: "#121823", border: "1px solid #25303F", borderRadius: 16, padding: "40px 24px", textAlign: "center" }}>
          <p style={{ color: "#5C6672", fontSize: 14 }}>No active listings yet — check back soon.</p>
          <Link to="/" style={{ ...mono, fontSize: 12, color: "#2DD4FF", textDecoration: "none", marginTop: 10, display: "inline-block" }}>Browse marketplace →</Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
        {listings.map((listing, i) => (
          <OfferCard key={listing.id} listing={listing} delay={i * 60} rm={rm} />
        ))}
      </div>
    </div>
  );
}

const STATUS_DISPLAY = {
  pending:     { label: "PENDING",     color: "#FFB020" },
  accepted:    { label: "ACCEPTED",    color: "#2DD4FF" },
  in_progress: { label: "IN PROGRESS", color: "#FFB020" },
  delivered:   { label: "DELIVERED",   color: "#2DD4FF" },
  completed:   { label: "COMPLETED",   color: "#2EE6A6" },
  declined:    { label: "DECLINED",    color: "#FF4D6D" },
  disputed:    { label: "DISPUTED",    color: "#FF4D6D" },
};

function ActiveTradesCard({ rm, trades }) {
  const [ref, vis] = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      style={{
        background: "#121823",
        border: "1px solid #25303F",
        borderRadius: 16,
        padding: "22px",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(22px)",
        transition: rm ? "none" : "opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <h3 style={{ ...bricolage, fontWeight: 700, fontSize: 18, color: "#EAF1F7", margin: 0 }}>Active trades</h3>
        <span style={{ ...mono, fontSize: 13, color: "#5C6672" }}>{trades.length}</span>
      </div>

      {trades.length === 0 && (
        <p style={{ fontSize: 13, color: "#5C6672", padding: "10px 0" }}>No active trades yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {trades.slice(0, 4).map((trade, i) => {
          const sd = STATUS_DISPLAY[trade.status] || { label: trade.status?.toUpperCase(), color: "#8C97A3" };
          return (
            <React.Fragment key={trade.id}>
              <div style={{ padding: "14px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#EAF1F7", marginBottom: 3, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                    {trade.listing_title || "Untitled"}
                  </div>
                  <div style={{ ...mono, fontSize: 10.5, color: "#5C6672" }}>{trade.platform}</div>
                </div>
                <span
                  style={{
                    ...mono,
                    fontSize: 10.5,
                    fontWeight: 600,
                    padding: "4px 9px",
                    borderRadius: 999,
                    border: `1px solid ${sd.color}55`,
                    color: sd.color,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {sd.label}
                </span>
              </div>
              {i < Math.min(trades.length, 4) - 1 && (
                <div style={{ height: 1, background: "#1B2330" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Link
        to="/my-trades"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          marginTop: 16,
          padding: "9px",
          borderRadius: 9,
          border: "1px solid #25303F",
          textDecoration: "none",
          ...mono,
          fontSize: 12,
          color: "#8C97A3",
          transition: "border-color 0.18s, color 0.18s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#34404F"; e.currentTarget.style.color = "#EAF1F7"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#25303F"; e.currentTarget.style.color = "#8C97A3"; }}
      >
        View all trades <ArrowRight size={12} />
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* tier progress card                                      */
/* ─────────────────────────────────────────────────────── */
function TierProgressCard({ rm }) {
  const [ref, vis] = useScrollReveal(0.1);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (!vis || rm) { if (rm) setBarWidth(62); return; }
    const id = setTimeout(() => setBarWidth(62), 100);
    return () => clearTimeout(id);
  }, [vis, rm]);

  return (
    <div
      ref={ref}
      style={{
        background: "linear-gradient(165deg, rgba(255,194,71,0.08) 0%, rgba(18,24,35,0.5) 100%)",
        border: "1px solid rgba(255,194,71,0.22)",
        borderRadius: 16,
        padding: "22px",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(22px)",
        transition: rm ? "none" : "opacity 0.6s cubic-bezier(.16,1,.3,1) 80ms, transform 0.6s cubic-bezier(.16,1,.3,1) 80ms",
      }}
    >
      {/* eyebrow */}
      <div style={{ ...mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", color: "#FFC247", textTransform: "uppercase", marginBottom: 14 }}>
        Your Tier
      </div>

      {/* badge row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 22,
            height: 22,
            background: "#FFC247",
            borderRadius: 4,
            transform: "rotate(45deg)",
            flexShrink: 0,
            boxShadow: "0 0 14px rgba(255,194,71,0.55), 0 0 28px rgba(255,194,71,0.25)",
          }}
        />
        <span style={{ ...bricolage, fontWeight: 800, fontSize: 30, color: "#FFC247", letterSpacing: "-0.03em", lineHeight: 1 }}>
          Gold
        </span>
      </div>

      {/* progress bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ background: "#1B2330", borderRadius: 999, height: 6, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${barWidth}%`,
              background: "linear-gradient(90deg, #FFC247, #C9D6E3)",
              borderRadius: 999,
              transition: rm ? "none" : "width 1s cubic-bezier(.16,1,.3,1)",
            }}
          />
        </div>
      </div>
      <div style={{ ...mono, fontSize: 12, color: "#8C97A3", marginBottom: 18 }}>62% to Platinum</div>

      {/* stats row */}
      <div
        style={{
          ...mono,
          fontSize: 11.5,
          color: "#5C6672",
          borderTop: "1px solid rgba(255,194,71,0.12)",
          paddingTop: 14,
          marginBottom: 10,
        }}
      >
        <span style={{ color: "#EAF1F7" }}>12</span> done ·{" "}
        <span style={{ color: "#EAF1F7" }}>100%</span> on-time ·{" "}
        <span style={{ color: "#EAF1F7" }}>4.9</span> rating
      </div>

      <div style={{ fontSize: 11.5, color: "#5C6672", fontStyle: "italic" }}>
        Earned, not bought — verified data only.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* page footer                                             */
/* ─────────────────────────────────────────────────────── */
function PageFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid #1B2330",
        padding: "20px 0",
        marginTop: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <span style={{ ...bricolage, fontWeight: 800, fontSize: 18, color: "#2DD4FF", letterSpacing: "-0.04em" }}>
        hyperr
      </span>
      <span style={{ ...mono, fontSize: 12, color: "#5C6672" }}>
        © 2026 hyperr ·{" "}
        <Link to="/terms" style={{ color: "#5C6672", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#8C97A3")} onMouseLeave={(e) => (e.currentTarget.style.color = "#5C6672")}>Terms</Link>
        {" · "}
        <Link to="/privacy" style={{ color: "#5C6672", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#8C97A3")} onMouseLeave={(e) => (e.currentTarget.style.color = "#5C6672")}>Privacy</Link>
      </span>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────── */
/* page root                                               */
/* ─────────────────────────────────────────────────────── */
export default function Dashboard() {
  const rm = useReducedMotion();
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ active: 0, completed: 0, valueTraded: 0, avgRating: 0 });

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [allSent, allReceived, activeListings, reviews] = await Promise.all([
        base44.entities.TradeProposal.filter({ proposer_id: me.id }, "-created_date"),
        base44.entities.TradeProposal.filter({ listing_owner_id: me.id }, "-created_date"),
        base44.entities.Listing.filter({ status: "active" }, "-created_date", 12),
        base44.entities.Review.filter({ reviewee_id: me.id }),
      ]);
      const allTrades = [...allSent, ...allReceived];
      const activeTrades = allTrades.filter(t => ["pending","accepted","in_progress","delivered"].includes(t.status));
      const completed = allTrades.filter(t => t.status === "completed");
      const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;
      setTrades(activeTrades);
      setListings(activeListings);
      setStats({
        active: activeTrades.length,
        completed: completed.length,
        valueTraded: completed.length * 120, // estimate based on completed
        avgRating,
      });
    })();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0E14",
        color: "#EAF1F7",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* whale layer */}
      <WhaleBackground rm={rm} />

      {/* all content sits above the whale layer */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 0" }}>
          <Welcome rm={rm} user={user} stats={stats} />

          {/* two-column layout */}
          <div
            style={{ display: "flex", gap: 28, alignItems: "flex-start" }}
            className="flex-col-mobile"
          >
            <OffersGrid rm={rm} listings={listings} />

            {/* sidebar */}
            <div
              style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 20 }}
              className="sidebar-col"
            >
              <ActiveTradesCard rm={rm} trades={trades} />
              <TierProgressCard rm={rm} />
            </div>
          </div>

          <PageFooter />
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .flex-col-mobile { flex-direction: column !important; }
          .sidebar-col { width: 100% !important; }
        }
        *:focus-visible {
          outline: 2px solid rgba(45,212,255,0.7) !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>
  );
}