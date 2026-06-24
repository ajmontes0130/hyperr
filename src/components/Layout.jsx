import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { LayoutGrid, Search, PlusCircle, Handshake, User, LogOut, Menu, X, Users, DollarSign, Sparkles, Compass, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    label: "Discover",
    items: [
      { label: "Marketplace", path: "/", icon: Search },
      { label: "Explore", path: "/explore", icon: Compass },
      { label: "Creators", path: "/creators", icon: Users },
      { label: "Saved", path: "/saved-creators", icon: Heart },
      { label: "Messages", path: "/messages", icon: MessageCircle },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "My Listings", path: "/my-listings", icon: LayoutGrid },
      { label: "Post Listing", path: "/create-listing", icon: PlusCircle },
      { label: "Barter Trades", path: "/my-trades", icon: Handshake },
      { label: "Cash Offers", path: "/cash-offers", icon: DollarSign },
    ],
  },
  {
    label: "Profile",
    items: [
      { label: "Business Profile", path: "/profile", icon: User },
      { label: "Creator Profile", path: "/creator-profile", icon: Sparkles },
    ],
  },
];

const allNav = navGroups.flatMap((g) => g.items);

export default function Layout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Handshake className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">BarterHub</span>
            </Link>

            {/* Desktop nav — compact icons + labels */}
            <nav className="hidden lg:flex items-center gap-1">
              {allNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {user && (
                <span className="text-sm text-muted-foreground truncate max-w-[140px]">{user.full_name || user.email}</span>
              )}
              <Button variant="ghost" size="sm" onClick={() => base44.auth.logout("/")} className="text-muted-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            <button className="lg:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-white px-4 pb-4 space-y-1">
            {navGroups.map((group) => (
              <div key={group.label} className="pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">{group.label}</p>
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive(item.path) ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-3 border-t mt-2">
              <button
                onClick={() => base44.auth.logout("/")}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted w-full"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}