import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Compass, MessageCircle, User } from "lucide-react";

const tabs = [
  { label: "Market", path: "/marketplace", icon: Search },
  { label: "Explore", path: "/explore", icon: Compass },
  { label: "Messages", path: "/messages", icon: MessageCircle },
  { label: "Profile", path: "/profile", icon: User },
];

// Preserve scroll position per tab so returning to a tab restores where you were
const scrollPositions = {};

export default function MobileBottomNav() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  const handleTabClick = (path) => {
    // Save current scroll position for the tab we're leaving
    scrollPositions[prevPathRef.current] = window.scrollY;
    prevPathRef.current = path;

    if (location.pathname === path) {
      // Already on this tab — scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Restore saved scroll position for the destination tab (after paint)
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPositions[path] || 0, behavior: "instant" });
      });
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            onClick={() => handleTabClick(tab.path)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 select-none transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <tab.icon className={`w-5 h-5 select-none ${active ? "stroke-[2.5]" : "stroke-2"}`} />
            <span className={`text-[10px] font-medium select-none ${active ? "text-primary" : ""}`}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}