import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import HyperrLogo from "@/components/HyperrLogo";
import { base44 } from "@/api/base44Client";
import { Search, PlusCircle, Handshake, User, LogOut, Menu, X, Users, DollarSign, Sparkles, Compass, Heart, MessageCircle, LayoutGrid, FileText, Home, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBottomNav from "@/components/MobileBottomNav";

const creatorNav = [
  { label: "Home", path: "/", icon: Home },
  { label: "Explore", path: "/explore", icon: Compass },
  { label: "Marketplace", path: "/marketplace", icon: Search },
  { label: "Saved", path: "/saved-creators", icon: Heart },
  { label: "Messages", path: "/messages", icon: MessageCircle },
  { label: "Barter Trades", path: "/my-trades", icon: Handshake },
  { label: "Cash Offers", path: "/cash-offers", icon: DollarSign },
  { label: "Creator Profile", path: "/creator-profile", icon: Sparkles },
];

const businessNav = [
  { label: "Home", path: "/", icon: Home },
  { label: "Creators", path: "/creators", icon: Users },
  { label: "Post Listing", path: "/create-listing", icon: PlusCircle, highlight: true },
  { label: "My Listings", path: "/my-listings", icon: LayoutGrid },
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
            <Link to={user ? "/" : "/landing"} className="flex items-center flex-shrink-0">
              <HyperrLogo size="md" />
            </Link>

            {user ? (
              <>
                {/* Desktop nav — authenticated */}
                <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap select-none ${
                        item.highlight && !isActive(item.path)
                          ? "text-primary-foreground bg-primary hover:bg-primary/90 mx-1"
                          : isActive(item.path)
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
                  <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                    {user.full_name || user.email}
                  </span>
                  <Link to="/support" className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-secondary" title="Support">
                    <HelpCircle className="w-4 h-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => base44.auth.logout("/")}
                    className="text-muted-foreground flex-shrink-0 select-none"
                  >
                    <LogOut className="w-4 h-4 select-none" />
                  </Button>
                </div>

                {/* Mobile hamburger */}
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-muted select-none"
                  onClick={() => setMobileOpen(!mobileOpen)}
                >
                  {mobileOpen ? <X className="w-5 h-5 select-none" /> : <Menu className="w-5 h-5 select-none" />}
                </button>
              </>
            ) : (
              <>
                {/* Public nav — logged-out visitors */}
                <nav className="hidden lg:flex items-center gap-1">
                  <Link to="/marketplace" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/marketplace") ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>Marketplace</Link>
                  <Link to="/creators" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/creators") ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>Creators</Link>
                  <Link to="/support" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/support") ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>Support</Link>
                </nav>
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-secondary transition-colors hidden sm:block">Log in</Link>
                  <Link to="/register">
                    <Button size="sm" className="rounded-lg">Sign up</Button>
                  </Link>
                  <button
                    className="lg:hidden p-2 rounded-lg hover:bg-muted select-none"
                    onClick={() => setMobileOpen(!mobileOpen)}
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-card px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] space-y-1">
            <div className="pt-3 space-y-1">
              {user ? (
                <>
                  {navItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium select-none ${isActive(item.path) ? "text-primary bg-secondary" : "text-muted-foreground hover:bg-secondary"}`}>
                      <item.icon className="w-4 h-4 select-none" /> {item.label}
                    </Link>
                  ))}
                </>
              ) : (
                <>
                  <Link to="/marketplace" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium select-none ${isActive("/marketplace") ? "text-primary bg-secondary" : "text-muted-foreground hover:bg-secondary"}`}><Search className="w-4 h-4" /> Marketplace</Link>
                  <Link to="/creators" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium select-none ${isActive("/creators") ? "text-primary bg-secondary" : "text-muted-foreground hover:bg-secondary"}`}><Users className="w-4 h-4" /> Creators</Link>
                  <Link to="/support" onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium select-none ${isActive("/support") ? "text-primary bg-secondary" : "text-muted-foreground hover:bg-secondary"}`}><HelpCircle className="w-4 h-4" /> Support</Link>
                </>
              )}
            </div>
            {user ? (
              <div className="pt-3 border-t mt-2 space-y-1">
                <button onClick={() => base44.auth.logout("/")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted w-full select-none">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t mt-2 space-y-1">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary">Log in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-secondary">Sign up free</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        style={{ paddingBottom: isMobile && user ? "calc(4rem + env(safe-area-inset-bottom))" : undefined }}
      >
        <Outlet />
      </main>

      {/* Fixed bottom tab bar on mobile — only for authenticated users */}
      {isMobile && user && <MobileBottomNav />}
    </div>
  );
}