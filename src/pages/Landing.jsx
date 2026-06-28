import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

/* ─── reduced motion ──────────────────────────────────────────── */
function useReducedMotion() {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setRm(mq.matches);
    const h = (e) => setRm(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return rm;
}

/* ─── scroll reveal ───────────────────────────────────────────── */
function useScrollReveal(threshold = 0.12) {
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

/* ─── count up number ─────────────────────────────────────────── */
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
  return val >= 1000 ? (val / 1000).toFixed(0) + "K" : String(val);
}

/* ─── nav ─────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "For creators", href: "#for-creators" },
    { label: "For businesses", href: "#for-businesses" },
    { label: "Tiers", href: "#tiers" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,14,20,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid #25303F" : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center h-16">
        <a
          href="#"
          className="shrink-0"
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: 24,
            color: "#2DD4FF",
            textDecoration: "none",
            letterSpacing: "-0.04em",
          }}
        >
          hyperr
        </a>

        {/* desktop links */}
        <div className="hidden md:flex gap-8 mx-auto">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium transition-colors"
              style={{ color: "#8C97A3", textDecoration: "none" }}
              onMouseEnter={(e) => (e.target.style.color = "#EAF1F7")}
              onMouseLeave={(e) => (e.target.style.color = "#8C97A3")}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* desktop actions */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <Link
            to="/login"
            className="text-sm font-medium px-4 py-2 rounded-lg border transition-all"
            style={{ color: "#8C97A3", border: "1px solid #25303F", textDecoration: "none" }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#34404F"; e.target.style.color = "#EAF1F7"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#25303F"; e.target.style.color = "#8C97A3"; }}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            style={{ background: "#2DD4FF", color: "#06303B", textDecoration: "none" }}
            onMouseEnter={(e) => (e.target.style.background = "#5CDEFF")}
            onMouseLeave={(e) => (e.target.style.background = "#2DD4FF")}
          >
            Sign up
          </Link>
        </div>

        {/* mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden ml-auto p-2"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#EAF1F7" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ background: "#121823", borderTop: "1px solid #25303F" }} className="md:hidden px-6 pb-6">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block text-base font-medium py-3"
              style={{ color: "#8C97A3", textDecoration: "none", borderBottom: "1px solid #25303F" }}
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 mt-5">
            <Link to="/login" className="flex-1 text-center text-sm font-medium py-2.5 rounded-lg border" style={{ color: "#8C97A3", border: "1px solid #25303F", textDecoration: "none" }}>
              Log in
            </Link>
            <Link to="/register" className="flex-1 text-center text-sm font-semibold py-2.5 rounded-lg" style={{ background: "#2DD4FF", color: "#06303B", textDecoration: "none" }}>
              Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── hero trade visual ───────────────────────────────────────── */
function TradeVisual({ rm }) {
  const [phase, setPhase] = useState(rm ? 4 : 0);

  useEffect(() => {
    if (rm) { setPhase(4); return; }
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 600);
    const t3 = setTimeout(() => setPhase(3), 900);
    const t4 = setTimeout(() => setPhase(4), 1150);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [rm]);

  const statVal = useCountUp(445, 500, phase >= 3, rm);
  const statVal2 = useCountUp(512, 550, phase >= 3, rm);
  const estVal = useCountUp(150, 600, phase >= 2, rm);

  const slideLeft = {
    opacity: phase >= 1 ? 1 : 0,
    transform: phase >= 1 ? "translateX(0)" : "translateX(-36px)",
    transition: rm ? "none" : "opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1)",
  };
  const slideRight = {
    opacity: phase >= 1 ? 1 : 0,
    transform: phase >= 1 ? "translateX(0)" : "translateX(36px)",
    transition: rm ? "none" : "opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1)",
  };
  const swapStyle = {
    opacity: phase >= 2 ? 1 : 0,
    transform: phase >= 2 ? "scale(1) rotate(0deg)" : "scale(0.2) rotate(-90deg)",
    transition: rm ? "none" : "opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
  };
  const pillStyle = {
    opacity: phase >= 4 ? 1 : 0,
    transform: phase >= 4 ? "scale(1) translateY(0)" : "scale(0.85) translateY(4px)",
    transition: rm ? "none" : "opacity 0.3s ease, transform 0.3s ease",
  };

  const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div style={{ position: "relative", padding: "32px 0 16px" }}>
      {/* glow */}
      {!rm && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            background: "radial-gradient(ellipse at center, rgba(45,212,255,0.06) 0%, transparent 70%)",
            animation: "glowBreathe 4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* status pill */}
      <div style={{ ...pillStyle, position: "absolute", top: 4, left: "50%", transform: `translateX(-50%) ${phase >= 4 ? "scale(1)" : "scale(0.85)"}`, whiteSpace: "nowrap", zIndex: 10 }}>
        <span style={{ ...monoFont, display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(46,230,166,0.1)", border: "1px solid rgba(46,230,166,0.35)", color: "#2EE6A6" }}>
          ✓ Completed
        </span>
      </div>

      {/* cards row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 8 }}>
        {/* business card */}
        <div style={{ ...slideLeft, background: "#121823", border: "1px solid #25303F", borderRadius: 16, padding: "18px 18px", width: 168, flexShrink: 0 }}>
          <div style={{ ...monoFont, fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: "#2DD4FF", marginBottom: 10 }}>BUSINESS OFFER</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#EAF1F7", marginBottom: 4, lineHeight: 1.35 }}>Free dinner for 2</div>
          <div style={{ fontSize: 11, color: "#8C97A3", marginBottom: 10 }}>Lumen Bistro · Austin</div>
          <div style={{ display: "inline-block", background: "rgba(45,212,255,0.07)", border: "1px solid rgba(45,212,255,0.2)", borderRadius: 8, padding: "5px 10px" }}>
            <span style={{ ...monoFont, fontSize: 13, fontWeight: 600, color: "#2DD4FF" }}>
              ${estVal} est.
            </span>
          </div>
        </div>

        {/* swap badge */}
        <div style={{ ...swapStyle, width: 40, height: 40, borderRadius: "50%", background: "#1B2330", border: "1px solid #34404F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: "#2DD4FF", flexShrink: 0, zIndex: 2 }}>
          ⇄
        </div>

        {/* creator card */}
        <div style={{ ...slideRight, background: "#121823", border: "1px solid #25303F", borderRadius: 16, padding: "18px 18px", width: 168, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(45,212,255,0.12)", border: "2px solid rgba(45,212,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 12, color: "#2DD4FF", flexShrink: 0 }}>
              KT
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#EAF1F7", marginBottom: 1 }}>Kai Tanaka</div>
              <div style={{ ...monoFont, fontSize: 9, fontWeight: 600, color: "#FFC247" }}>◆ GOLD</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#8C97A3" }}>Instagram</span>
              <span style={{ ...monoFont, fontSize: 11, fontWeight: 600, color: "#EAF1F7" }}>{statVal}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#8C97A3" }}>YouTube</span>
              <span style={{ ...monoFont, fontSize: 11, fontWeight: 600, color: "#EAF1F7" }}>{statVal2}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── hero ────────────────────────────────────────────────────── */
function Hero() {
  const rm = useReducedMotion();
  const [vis, setVis] = useState(rm);

  useEffect(() => {
    if (rm) { setVis(true); return; }
    const id = setTimeout(() => setVis(true), 60);
    return () => clearTimeout(id);
  }, [rm]);

  const fadeUp = (delayMs) =>
    rm
      ? {}
      : {
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(18px)",
          transition: `opacity 0.55s ease ${delayMs}ms, transform 0.55s ease ${delayMs}ms`,
        };

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 64 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* copy side */}
          <div>
            <div style={{ ...fadeUp(0), display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#2DD4FF", boxShadow: "0 0 10px #2DD4FF, 0 0 20px rgba(45,212,255,0.35)", flexShrink: 0 }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", color: "#2DD4FF" }}>
                THE BARTER MARKETPLACE
              </span>
            </div>

            <h1
              style={{
                ...fadeUp(80),
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(42px, 5.5vw, 72px)",
                lineHeight: 1.04,
                letterSpacing: "-0.04em",
                color: "#EAF1F7",
                marginBottom: 24,
              }}
            >
              Trade products
              <br />
              for <span style={{ color: "#2DD4FF" }}>promotion.</span>
            </h1>

            <p
              style={{
                ...fadeUp(160),
                fontSize: "clamp(15px, 1.4vw, 18px)",
                color: "#8C97A3",
                lineHeight: 1.65,
                maxWidth: 480,
                marginBottom: 36,
              }}
            >
              hyperr connects businesses and creators to swap real value — products, services, experiences — for content and reach. Cash optional.
            </p>

            <div style={{ ...fadeUp(240), display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/register"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FF4D6D", color: "#4B1320", textDecoration: "none", fontWeight: 600, fontSize: 15, padding: "13px 24px", borderRadius: 12, minHeight: 44, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#FF6B85"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#FF4D6D"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Join as a creator <ArrowRight size={15} />
              </Link>
              <Link
                to="/register"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2DD4FF", color: "#06303B", textDecoration: "none", fontWeight: 600, fontSize: 15, padding: "13px 24px", borderRadius: 12, minHeight: 44, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#5CDEFF"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#2DD4FF"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                List your business <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* visual side */}
          <div style={{ ...fadeUp(120), display: "flex", justifyContent: "center" }}>
            <TradeVisual rm={rm} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── band ────────────────────────────────────────────────────── */
function Band() {
  const rm = useReducedMotion();
  const nouns = ["Products", "Services", "Experiences", "Exposure"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (rm) return;
    const id = setInterval(() => setActive((a) => (a + 1) % nouns.length), 1600);
    return () => clearInterval(id);
  }, [rm]);

  return (
    <div style={{ borderTop: "1px solid #25303F", borderBottom: "1px solid #25303F", background: "#0D1219", padding: "16px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 8, textAlign: "center" }}>
        {nouns.map((n, i) => (
          <React.Fragment key={n}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                padding: "4px 10px",
                borderRadius: 6,
                color: active === i ? "#2DD4FF" : "#8C97A3",
                background: active === i ? "rgba(45,212,255,0.08)" : "transparent",
                fontWeight: active === i ? 600 : 400,
                transition: rm ? "none" : "color 0.4s, background 0.4s",
              }}
            >
              {n}
            </span>
            {i < nouns.length - 1 && <span style={{ color: "#25303F" }}>·</span>}
          </React.Fragment>
        ))}
        <span style={{ fontSize: 13, color: "#5C6672", marginLeft: 4 }}>— traded directly, no invoices.</span>
      </div>
    </div>
  );
}

/* ─── how it works ────────────────────────────────────────────── */
function HowItWorks() {
  const [ref, vis] = useScrollReveal();
  const steps = [
    { num: "01", title: "Build your profile", body: "Connect your socials and show what you offer. We verify the numbers so trust is built in." },
    { num: "02", title: "Find your match", body: "Browse offers and creators. Filter by reach, niche, and the value on the table." },
    { num: "03", title: "Trade and track", body: "Agree the terms, deliver, and track every trade end to end in one place." },
  ];

  const reveal = (delay) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
  });

  return (
    <section id="how-it-works" ref={ref} style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ ...reveal(0), textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", color: "#2DD4FF", textTransform: "uppercase", marginBottom: 14 }}>
            How It Works
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,44px)", letterSpacing: "-0.03em", color: "#EAF1F7" }}>
            Simple. Direct. Trackable.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div
              key={s.num}
              style={{ ...reveal(i * 100 + 200), background: "#121823", border: "1px solid #25303F", borderRadius: 18, padding: "36px 32px", cursor: "default", transition: `all 0.3s ease, opacity 0.55s ease ${i * 100 + 200}ms, transform 0.55s ease ${i * 100 + 200}ms` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#34404F"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#25303F"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 600, color: "#2DD4FF", marginBottom: 20, lineHeight: 1 }}>
                {s.num}
              </div>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 20, color: "#EAF1F7", marginBottom: 12, letterSpacing: "-0.02em" }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 14, color: "#8C97A3", lineHeight: 1.65 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── dual value ──────────────────────────────────────────────── */
function DualValue() {
  const [ref, vis] = useScrollReveal();

  const panels = [
    {
      id: "for-creators",
      tag: "FOR CREATORS",
      tagColor: "#FF4D6D",
      border: "rgba(255,77,109,0.18)",
      bg: "linear-gradient(145deg, rgba(255,77,109,0.06) 0%, #121823 55%)",
      headline: "Earn from the content you'd make anyway.",
      bullets: ["Get paid in products you'd post about anyway.", "Keep full creative control of every post.", "Build a verified record that earns you tiers.", "Cash deals optional — stack them on top."],
      ctaText: "Join as a creator",
      ctaBg: "#FF4D6D",
      ctaBgHover: "#FF6B85",
      ctaColor: "#4B1320",
    },
    {
      id: "for-businesses",
      tag: "FOR BUSINESSES",
      tagColor: "#2DD4FF",
      border: "rgba(45,212,255,0.16)",
      bg: "linear-gradient(145deg, rgba(45,212,255,0.05) 0%, #121823 55%)",
      headline: "Reach real audiences without ad spend.",
      bullets: ["Pay in what you already make — not cash.", "Match with creators whose numbers are verified.", "Put your product in front of the right niche.", "Track results on every trade, start to finish."],
      ctaText: "List your business",
      ctaBg: "#2DD4FF",
      ctaBgHover: "#5CDEFF",
      ctaColor: "#06303B",
    },
  ];

  return (
    <section ref={ref} style={{ background: "#0D1219", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease", textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,44px)", letterSpacing: "-0.03em", color: "#EAF1F7" }}>
            Built for both sides of the trade.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {panels.map((p, i) => (
            <div
              key={p.id}
              id={p.id}
              style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 20, padding: "40px 36px", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: `opacity 0.6s ease ${i * 120}ms, transform 0.6s ease ${i * 120}ms` }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", color: p.tagColor, textTransform: "uppercase", marginBottom: 14 }}>
                {p.tag}
              </div>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(20px,2.2vw,26px)", color: "#EAF1F7", letterSpacing: "-0.03em", marginBottom: 26, lineHeight: 1.2 }}>
                {p.headline}
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0" }}>
                {p.bullets.map((b) => (
                  <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <span style={{ color: p.tagColor, flexShrink: 0, marginTop: 1, fontSize: 15 }}>→</span>
                    <span style={{ fontSize: 14, color: "#8C97A3", lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: p.ctaBg, color: p.ctaColor, textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "11px 22px", borderRadius: 10, minHeight: 44, transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = p.ctaBgHover; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = p.ctaBg; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {p.ctaText} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── tiers ───────────────────────────────────────────────────── */
function Tiers() {
  const [ref, vis] = useScrollReveal();
  const tiers = [
    { name: "Diamond", color: "#7FE9FF", desc: "Top-tier reach with a flawless trade record." },
    { name: "Platinum", color: "#C9D6E3", desc: "Proven creators with consistent results." },
    { name: "Gold", color: "#FFC247", desc: "Established reach and reliable delivery." },
    { name: "Silver", color: "#A8B2BD", desc: "Growing audience with a solid history." },
    { name: "Bronze", color: "#D08A5A", desc: "New to hyperr, building a track record." },
  ];

  return (
    <section id="tiers" ref={ref} style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease", textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", color: "#2DD4FF", textTransform: "uppercase", marginBottom: 14 }}>
            Creator Tiers
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,44px)", letterSpacing: "-0.03em", color: "#EAF1F7", marginBottom: 10 }}>
            Tiers are earned, not bought.
          </h2>
          <p style={{ fontSize: 14, color: "#8C97A3" }}>Verified data only — no shortcuts.</p>
        </div>

        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(18px)", transition: `opacity 0.5s ease ${i * 70 + 150}ms, transform 0.5s ease ${i * 70 + 150}ms, border-color 0.2s, box-shadow 0.2s`, display: "flex", alignItems: "center", gap: 18, background: "#121823", border: "1px solid #25303F", borderRadius: 14, padding: "18px 22px", cursor: "default" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = tier.color + "55"; e.currentTarget.style.boxShadow = `0 0 20px ${tier.color}18`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#25303F"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ width: 18, height: 18, background: tier.color, borderRadius: 3, transform: "rotate(45deg)", flexShrink: 0, boxShadow: `0 0 10px ${tier.color}66` }} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: tier.color, minWidth: 72, letterSpacing: "0.05em", textTransform: "uppercase" }}>{tier.name}</div>
              <div style={{ width: 1, height: 24, background: "#25303F", flexShrink: 0 }} />
              <div style={{ fontSize: 14, color: "#8C97A3", lineHeight: 1.5 }}>{tier.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── trust ───────────────────────────────────────────────────── */
function Trust() {
  const [ref, vis] = useScrollReveal();
  const cards = [
    { icon: "✓", color: "#2DD4FF", bg: "rgba(45,212,255,0.08)", title: "Verified socials", body: "Every follower count is checked against the platform itself." },
    { icon: "↻", color: "#2EE6A6", bg: "rgba(46,230,166,0.08)", title: "Tracked trades", body: "Each deal is logged end to end, with timestamps you can both see." },
    { icon: "★", color: "#FFC247", bg: "rgba(255,194,71,0.08)", title: "Honest reviews", body: "Reviews only unlock after a completed trade. No fakes, no padding." },
    { icon: "⚑", color: "#FF4D6D", bg: "rgba(255,77,109,0.08)", title: "Dispute support", body: "If a trade goes sideways, our team steps in to make it right." },
  ];

  return (
    <section ref={ref} style={{ background: "#0D1219", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease", textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", color: "#2DD4FF", textTransform: "uppercase", marginBottom: 14 }}>
            Trust &amp; Safety
          </div>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px,3.5vw,44px)", letterSpacing: "-0.03em", color: "#EAF1F7" }}>
            Trade with confidence.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <div
              key={c.title}
              style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: `all 0.3s ease, opacity 0.5s ease ${i * 80 + 150}ms, transform 0.5s ease ${i * 80 + 150}ms`, background: "#121823", border: "1px solid #25303F", borderRadius: 18, padding: "28px 24px", cursor: "default" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#34404F"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#25303F"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: c.color, marginBottom: 20 }}>
                {c.icon}
              </div>
              <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: "#EAF1F7", marginBottom: 10, letterSpacing: "-0.02em" }}>
                {c.title}
              </h3>
              <p style={{ fontSize: 14, color: "#8C97A3", lineHeight: 1.6 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── final cta ───────────────────────────────────────────────── */
function FinalCTA() {
  const [ref, vis] = useScrollReveal(0.2);
  return (
    <section ref={ref} style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(32px,5vw,60px)", letterSpacing: "-0.04em", color: "#EAF1F7", lineHeight: 1.06, marginBottom: 18 }}>
          Ready to start trading?
        </h2>
        <p style={{ fontSize: 17, color: "#8C97A3", lineHeight: 1.65, marginBottom: 40 }}>
          Set up your profile in minutes. The first trade is closer than you think.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/register"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FF4D6D", color: "#4B1320", textDecoration: "none", fontWeight: 600, fontSize: 16, padding: "14px 30px", borderRadius: 12, minHeight: 52, transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#FF6B85"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FF4D6D"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Join as a creator <ArrowRight size={16} />
          </Link>
          <Link
            to="/register"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2DD4FF", color: "#06303B", textDecoration: "none", fontWeight: 600, fontSize: 16, padding: "14px 30px", borderRadius: 12, minHeight: 52, transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#5CDEFF"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#2DD4FF"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            List your business <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── footer ──────────────────────────────────────────────────── */
function Footer() {
  const cols = [
    {
      heading: "Product",
      links: [{ label: "Marketplace", href: "/" }, { label: "Creator Directory", href: "/creators" }, { label: "Explore", href: "/explore" }, { label: "How it works", href: "#how-it-works" }],
    },
    {
      heading: "Company",
      links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#" }],
    },
    {
      heading: "Legal",
      links: [{ label: "Terms of Service", href: "/terms" }, { label: "Privacy Policy", href: "/privacy" }, { label: "Cookie Policy", href: "#" }],
    },
  ];

  return (
    <footer style={{ borderTop: "1px solid #25303F", background: "#0A0E14", padding: "64px 24px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10" style={{ marginBottom: 56 }}>
          <div className="col-span-2 md:col-span-1">
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 30, color: "#2DD4FF", letterSpacing: "-0.04em", marginBottom: 12 }}>
              hyperr
            </div>
            <p style={{ fontSize: 13, color: "#5C6672", lineHeight: 1.7, maxWidth: 200 }}>
              The barter marketplace where businesses and creators trade real value.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.heading}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", color: "#5C6672", textTransform: "uppercase", marginBottom: 18 }}>
                {col.heading}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      style={{ fontSize: 14, color: "#8C97A3", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.target.style.color = "#EAF1F7")}
                      onMouseLeave={(e) => (e.target.style.color = "#8C97A3")}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #25303F", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#5C6672" }}>
            © 2026 hyperr. All rights reserved.
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#25303F" }}>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── page root ───────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0E14", color: "#EAF1F7", overflowX: "hidden", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes glowBreathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
      `}</style>
      <Nav />
      <Hero />
      <Band />
      <HowItWorks />
      <DualValue />
      <Tiers />
      <Trust />
      <FinalCTA />
      <Footer />
    </div>
  );
}