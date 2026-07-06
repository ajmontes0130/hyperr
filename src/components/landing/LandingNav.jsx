import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import HyperrLogo from "@/components/HyperrLogo";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "For creators", href: "#for-creators" },
  { label: "For businesses", href: "#for-businesses" },
  { label: "Tiers", href: "#tiers" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: "background 0.3s, backdrop-filter 0.3s, border-color 0.3s",
    background: scrolled ? "rgba(10,14,20,0.85)" : "transparent",
    backdropFilter: scrolled ? "blur(16px)" : "none",
    borderBottom: scrolled ? "1px solid #25303F" : "1px solid transparent",
  };

  return (
    <nav style={navStyle}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 64 }}>
        {/* Logo */}
        <a href="#" style={{ textDecoration: "none", flexShrink: 0, display: "flex" }}>
          <HyperrLogo size="md" />
        </a>

        {/* Desktop center links */}
        <div className="landing-nav-links" style={{ display: "flex", gap: 32, margin: "0 auto", whiteSpace: "nowrap" }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} style={{ color: "#8C97A3", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s", whiteSpace: "nowrap" }}
              onMouseEnter={e => e.target.style.color = "#EAF1F7"}
              onMouseLeave={e => e.target.style.color = "#8C97A3"}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop right */}
        <div className="landing-nav-actions" style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0, whiteSpace: "nowrap" }}>
          <a href="/login" style={{ color: "#8C97A3", textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "8px 16px", borderRadius: 8, border: "1px solid #25303F", transition: "all 0.2s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.target.style.borderColor = "#34404F"; e.target.style.color = "#EAF1F7"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#25303F"; e.target.style.color = "#8C97A3"; }}
          >
            Log in
          </a>
          <a href="/register" style={{ background: "#2DD4FF", color: "#06303B", textDecoration: "none", fontSize: 14, fontWeight: 600, padding: "8px 18px", borderRadius: 8, transition: "all 0.2s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.target.style.background = "#5CDEFF"; }}
            onMouseLeave={e => { e.target.style.background = "#2DD4FF"; }}
          >
            Sign up
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="landing-hamburger"
          onClick={() => setOpen(!open)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#EAF1F7", padding: 8, marginLeft: "auto" }}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="landing-mobile-menu" style={{ background: "#121823", borderTop: "1px solid #25303F", padding: "20px 24px 24px" }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              style={{ display: "block", color: "#8C97A3", textDecoration: "none", fontSize: 16, fontWeight: 500, padding: "12px 0", borderBottom: "1px solid #25303F" }}>
              {l.label}
            </a>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <a href="/login" style={{ flex: 1, textAlign: "center", color: "#8C97A3", textDecoration: "none", fontSize: 15, fontWeight: 500, padding: "10px 0", border: "1px solid #25303F", borderRadius: 8 }}>Log in</a>
            <a href="/register" style={{ flex: 1, textAlign: "center", background: "#2DD4FF", color: "#06303B", textDecoration: "none", fontSize: 15, fontWeight: 600, padding: "10px 0", borderRadius: 8 }}>Sign up</a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1100px) {
          .landing-nav-links { display: none !important; }
          .landing-nav-actions { display: none !important; }
          .landing-hamburger { display: block !important; }
        }
        @media (min-width: 1101px) and (max-width: 1350px) {
          .landing-nav-links { gap: 20px !important; }
          .landing-nav-actions { gap: 8px !important; }
        }
      `}</style>
    </nav>
  );
}