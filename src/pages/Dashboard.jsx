import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AppTutorial from "@/components/AppTutorial";

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
          to="/marketplace"
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
          <Link to="/marketplace" style={{ ...mono, fontSize: 12, color: "#2DD4FF", textDecoration: "none", marginTop: 10, display: "inline-block" }}>Browse marketplace →</Link>
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
const TIER_ORDER = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const TIER_THRESHOLDS = { Bronze: 0, Silver: 10000, Gold: 50000, Platinum: 250000, Diamond: 1000000 };
const TIER_COLORS = { Bronze: "#D08B5A", Silver: "#A9B4C0", Gold: "#FFC247", Platinum: "#C9D6E3", Diamond: "#8FEFFF" };
const TIER_NEXT = { Bronze: "Silver", Silver: "Gold", Gold: "Platinum", Platinum: "Diamond", Diamond: null };

function TierProgressCard({ rm, stats, trades }) {
  const [ref, vis] = useScrollReveal(0.1);
  const [barWidth, setBarWidth] = useState(0);

  // derive tier from completed trade count as a proxy (real app would use creator profile reach)
  const completed = stats.completed;
  let currentTier = "Bronze";
  if (completed >= 50) currentTier = "Diamond";
  else if (completed >= 20) currentTier = "Platinum";
  else if (completed >= 10) currentTier = "Gold";
  else if (completed >= 3) currentTier = "Silver";

  const nextTier = TIER_NEXT[currentTier];
  const tierThresholds = { Bronze: 3, Silver: 10, Gold: 20, Platinum: 50, Diamond: null };
  const currentMin = { Bronze: 0, Silver: 3, Gold: 10, Platinum: 20, Diamond: 50 };
  const pct = nextTier
    ? Math.min(100, Math.round(((completed - currentMin[currentTier]) / (tierThresholds[currentTier] - currentMin[currentTier])) * 100))
    : 100;

  const color = TIER_COLORS[currentTier];

  useEffect(() => {
    if (!vis || rm) { if (rm) setBarWidth(pct); return; }
    const id = setTimeout(() => setBarWidth(pct), 100);
    return () => clearTimeout(id);
  }, [vis, rm, pct]);

  const avgRating = stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—";

  return (
    <div
      ref={ref}
      style={{
        background: `linear-gradient(165deg, ${color}14 0%, rgba(18,24,35,0.5) 100%)`,
        border: `1px solid ${color}38`,
        borderRadius: 16,
        padding: "22px",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(22px)",
        transition: rm ? "none" : "opacity 0.6s cubic-bezier(.16,1,.3,1) 80ms, transform 0.6s cubic-bezier(.16,1,.3,1) 80ms",
      }}
    >
      <div style={{ ...mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", color, textTransform: "uppercase", marginBottom: 14 }}>
        Your Tier
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 22, height: 22, background: color, borderRadius: 4, transform: "rotate(45deg)", flexShrink: 0, boxShadow: `0 0 14px ${color}8C, 0 0 28px ${color}40` }} />
        <span style={{ ...bricolage, fontWeight: 800, fontSize: 30, color, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {currentTier}
        </span>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ background: "#1B2330", borderRadius: 999, height: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${barWidth}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 999, transition: rm ? "none" : "width 1s cubic-bezier(.16,1,.3,1)" }} />
        </div>
      </div>
      <div style={{ ...mono, fontSize: 12, color: "#8C97A3", marginBottom: 18 }}>
        {nextTier ? `${pct}% to ${nextTier}` : "Max tier reached 🎉"}
      </div>
      <div style={{ ...mono, fontSize: 11.5, color: "#5C6672", borderTop: `1px solid ${color}1F`, paddingTop: 14, marginBottom: 10 }}>
        <span style={{ color: "#EAF1F7" }}>{completed}</span> done ·{" "}
        <span style={{ color: "#EAF1F7" }}>{avgRating}</span> avg rating
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
  const [showTutorial, setShowTutorial] = useState(false);
  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me();
      setUser(me);
      const type = me?.account_type || "creator";
      setAccountType(type);
      const key = `hyperr_tutorial_seen_${me?.id}`;
      if (!localStorage.getItem(key)) {
        setShowTutorial(true);
        localStorage.setItem(key, "1");
      }
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
              <TierProgressCard rm={rm} stats={stats} trades={trades} />
            </div>
          </div>

          <PageFooter />
        </main>
      </div>

      {showTutorial && (
        <AppTutorial accountType={accountType} onClose={() => setShowTutorial(false)} />
      )}

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