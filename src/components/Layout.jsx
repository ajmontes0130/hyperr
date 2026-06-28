import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, PlusCircle, Handshake, User, LogOut, Menu, X, Users, DollarSign, Sparkles, Compass, Heart, MessageCircle, LayoutGrid, FileText, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBottomNav from "@/components/MobileBottomNav";

const creatorNav = [
  { label: "Home", path: "/", icon: Home },
  { label: "Explore", path: "/explore", icon: Compass },
  { label: "Marketplace", path: "/", icon: Search },
  { label: "Saved", path: "/saved-creators", icon: Heart },
  { label: "Messages", path: "/messages", icon: MessageCircle },
  { label: "Barter Trades", path: "/my-trades", icon: Handshake },
  { label: "Cash Offers", path: "/cash-offers", icon: DollarSign },
  { label: "Creator Profile", path: "/creator-profile", icon: Sparkles },
];

const businessNav = [
  { label: "Home", path: "/", icon: Home },
  { label: "Creators", path: "/creators", icon: Users },
  { label: "My Listings", path: "/my-listings", icon: LayoutGrid },
  { label: "Post Listing", path: "/create-listing", icon: PlusCircle },
  { label: "Messages", path: "/messages", icon: MessageCircle },
  { label: "Barter Trades", path: "/my-trades", icon: Handshake },
  { label: "Cash Offers", path: "/cash-offers", icon: DollarSign },
  { label: "Templates", path: "/proposal-templates", icon: FileText },
  { label: "Business Profile", path: "/profile", icon: User },
];

const defaultNav = [...creatorNav, ...businessNav].filter(
  (v, i, a) => a.findIndex((x) => x.path === v.path) === i
);

export default function Layout() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    base44.auth.me().then((me) => {
      setUser(me);
      setAccountType(me?.account_type || null);
    }).catch(() => {});
  }, []);

  const navItems = accountType === "creator"
    ? creatorNav
    : accountType === "business"
    ? businessNav
    : defaultNav;

  const isActive = (path) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <header
        className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center flex-shrink-0">
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 26, color: "#2DD4FF", letterSpacing: "-0.04em" }}>
                hyperr
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap select-none ${
                    isActive(item.path)
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0 select-none" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-2">
              {user && (
                <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                  {user.full_name || user.email}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => base44.auth.logout("/")}
                className="text-muted-foreground flex-shrink-0 select-none"
              >
                <LogOut className="w-4 h-4 select-none" />
              </Button>
            </div>

            {/* Mobile hamburger — shown on mobile when not using bottom nav for full menu */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted select-none"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5 select-none" /> : <Menu className="w-5 h-5 select-none" />}
            </button>
          </div>
        </div>

        {/* Mobile full nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-card px-4 pb-4 space-y-1">
            <div className="pt-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium select-none ${
                    isActive(item.path) ? "text-primary bg-secondary" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-4 h-4 select-none" />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t mt-2">
              <button
                onClick={() => base44.auth.logout("/")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted w-full select-none"
              >
                <LogOut className="w-4 h-4 select-none" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        style={{ paddingBottom: isMobile ? "calc(4rem + env(safe-area-inset-bottom))" : undefined }}
      >
        <Outlet />
      </main>

      {/* Fixed bottom tab bar on mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
}