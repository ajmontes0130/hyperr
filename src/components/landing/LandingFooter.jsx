import React from "react";

const cols = [
  {
    heading: "Product",
    links: [
      { label: "Marketplace", href: "/" },
      { label: "Creator Directory", href: "/creators" },
      { label: "Explore", href: "/explore" },
      { label: "How it works", href: "#how-it-works" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer style={{ borderTop: "1px solid #25303F", background: "#0A0E14", padding: "64px 24px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
          {/* Logo + tagline */}
          <div>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 28, color: "#2DD4FF", letterSpacing: "-0.04em", marginBottom: 14 }}>
              hyperr
            </div>
            <p style={{ fontSize: 14, color: "#5C6672", lineHeight: 1.7, maxWidth: 240 }}>
              The barter marketplace where businesses and creators trade real value.
            </p>
          </div>

          {/* Columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.15em", color: "#5C6672", fontWeight: 600, marginBottom: 20, textTransform: "uppercase" }}>
                {col.heading}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} style={{ color: "#8C97A3", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#EAF1F7"}
                      onMouseLeave={e => e.target.style.color = "#8C97A3"}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #25303F", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#5C6672" }}>
            © 2026 hyperr. All rights reserved.
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#25303F" }}>
            v1.0.0
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}