import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Loader2, Users, Building2, SlidersHorizontal, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreatorFeedCard from "@/components/explore/CreatorFeedCard";
import BusinessFeedCard from "@/components/explore/BusinessFeedCard";
import { calcLevel } from "@/lib/creatorUtils";

const niches = ["All", "Food & Dining", "Travel", "Fashion & Style", "Beauty & Skincare", "Fitness & Health", "Tech & Gaming", "Lifestyle", "Finance", "Education", "Entertainment", "Music", "Art & Design", "Parenting", "Business", "Sustainability", "Other"];
const businessCategories = ["All", "Restaurant & Food", "Retail & Fashion", "Health & Beauty", "Tech & Software", "Travel & Hospitality", "Fitness & Wellness", "Entertainment", "Professional Services", "Education", "Other"];
const audienceBands = [
  { label: "Any size", value: "all" },
  { label: "Nano (< 10K)", value: "nano" },
  { label: "Micro (10K – 50K)", value: "micro" },
  { label: "Mid (50K – 250K)", value: "mid" },
  { label: "Macro (250K – 1M)", value: "macro" },
  { label: "Mega (1M+)", value: "mega" },
];

export default function Explore() {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // "creator" | "business" | null
  const [showFilters, setShowFilters] = useState(false);
  const [filterNiche, setFilterNiche] = useState("All");
  const [filterAudience, setFilterAudience] = useState("all");
  const [filterLocation, setFilterLocation] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Determine if this user is a Creator or Business.
  // Primary: account_type set during onboarding.
  // Fallback: check which profile the user has (for users who onboarded
  // before account_type was added to the schema).
  const isCreator = userType === "creator";
  const isBusiness = userType === "business";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me();
        if (cancelled) return;
        setUser(me);

        let resolvedType = me?.account_type || null;

        // Fallback: account_type not set — infer from which profile exists
        if (!resolvedType) {
          const [creatorProfiles, businessProfiles] = await Promise.all([
            base44.entities.CreatorProfile.filter({ created_by_id: me.id }),
            base44.entities.BusinessProfile.filter({ created_by_id: me.id }),
          ]);
          if (creatorProfiles.length > 0 && businessProfiles.length === 0) {
            resolvedType = "creator";
          } else if (businessProfiles.length > 0 && creatorProfiles.length === 0) {
            resolvedType = "business";
          }
        }

        if (cancelled) return;
        setUserType(resolvedType);

        const isCreatorAccount = resolvedType === "creator";
        const list = isCreatorAccount
          ? await base44.entities.BusinessProfile.list("-created_date")
          : await base44.entities.CreatorProfile.list("-total_reach");
        if (cancelled) return;
        setAllItems(list);

        // Only fetch saved items if user is a creator (they save creators they like)
        if (isCreatorAccount) {
          const savedList = await base44.entities.SavedCreator.filter({ user_id: me.id });
          if (cancelled) return;
          if (savedList && savedList.length > 0) {
            setSaved(new Set(savedList.map((s) => s.creator_profile_id)));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const audienceMatch = (reach, band) => {
    if (band === "all") return true;
    if (band === "nano") return reach < 10000;
    if (band === "micro") return reach >= 10000 && reach < 50000;
    if (band === "mid") return reach >= 50000 && reach < 250000;
    if (band === "macro") return reach >= 250000 && reach < 1000000;
    if (band === "mega") return reach >= 1000000;
    return true;
  };

  const items = useMemo(() => {
    if (isCreator) {
      // For creators: show businesses
      return allItems
        .filter((b) => {
          const matchLocation = !filterLocation.trim() || (b.location || "").toLowerCase().includes(filterLocation.toLowerCase());
          return matchLocation;
        })
        .sort((a, b) => (b.created_date || 0) - (a.created_date || 0));
    } else {
      // For businesses: show creators (original logic)
      const byOwner = new Map();
      allItems.forEach((c) => {
        const key = c.created_by_id || c.id;
        const existing = byOwner.get(key);
        if (!existing) {
          byOwner.set(key, { ...c, creator_level: calcLevel(c.total_reach || 0) });
        } else {
          if ((c.total_collabs || 0) > (existing.total_collabs || 0)) {
            byOwner.set(key, { ...c, creator_level: calcLevel(c.total_reach || 0) });
          }
        }
      });
      return Array.from(byOwner.values())
        .sort((a, b) => (b.total_reach || 0) - (a.total_reach || 0))
        .filter((c) => {
          const matchNiche = filterNiche === "All" || (c.niche && c.niche.includes(filterNiche));
          const matchAudience = audienceMatch(c.total_reach || 0, filterAudience);
          const matchLocation = !filterLocation.trim() || (c.location || "").toLowerCase().includes(filterLocation.toLowerCase());
          return matchNiche && matchAudience && matchLocation;
        });
    }
  }, [allItems, filterNiche, filterAudience, filterLocation, isCreator]);

  const filtersActive = filterNiche !== "All" || filterAudience !== "all" || filterLocation.trim();
  const clearFilters = () => {
    setFilterNiche("All");
    setFilterAudience("all");
    setFilterLocation("");
  };

  const toggleSave = async (creator) => {
    if (!user || !creator || !isCreator) return;
    if (saved.has(creator.id)) {
      const existing = await base44.entities.SavedCreator.filter({ user_id: user.id, creator_profile_id: creator.id });
      if (existing.length) await base44.entities.SavedCreator.delete(existing[0].id);
      setSaved((s) => { const n = new Set(s); n.delete(creator.id); return n; });
      toast({ title: "Removed from saved" });
    } else {
      await base44.entities.SavedCreator.create({
        user_id: user.id,
        creator_profile_id: creator.id,
        creator_name: creator.display_name,
        creator_avatar: creator.avatar_url,
        creator_level: creator.creator_level,
      });
      setSaved((s) => new Set([...s, creator.id]));
      toast({ title: "Saved!", description: `${creator.display_name} added to your saved creators.` });
    }
  };

  // Creators saving businesses — local-only for now (no SavedBusiness entity yet)
  const toggleSaveBusiness = (business) => {
    setSaved((s) => {
      const n = new Set(s);
      if (n.has(business.id)) {
        n.delete(business.id);
        toast({ title: "Removed from saved" });
      } else {
        n.add(business.id);
        toast({ title: "Saved!", description: `${business.business_name} added to your saved businesses.` });
      }
      return n;
    });
  };

  const openMessage = (item) => {
    navigate(`/messages?with=${item.created_by_id || item.id}&name=${encodeURIComponent(item.display_name || item.business_name)}&avatar=${encodeURIComponent(item.avatar_url || item.logo_url || "")}`);
  };

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Page title and description based on user type
  const pageTitle = isCreator ? "Explore Businesses" : "Explore Creators";
  const pageSubtitle = isCreator
    ? "Find businesses offering products, services, and experiences in exchange for your content."
    : "Scroll through creators and save the ones you love.";

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-2">
          <span className="text-primary">{pageTitle}</span>
        </h1>
        <p className="text-muted-foreground">{pageSubtitle}</p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Filter bar */}
        <div className="mb-5 sticky top-0 z-10 bg-background/80 backdrop-blur-md py-3 -mx-4 px-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${showFilters || filtersActive ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-secondary"}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters {filtersActive && !showFilters && <span className="w-2 h-2 rounded-full bg-white inline-block" />}
            </button>
            {filtersActive && (
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-card rounded-2xl border p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {isCreator ? (
                  // Filters for viewing businesses
                  <>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Category</p>
                      <Select value={filterNiche} onValueChange={setFilterNiche}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{businessCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Location</p>
                      <input
                        placeholder="City or country…"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </>
                ) : (
                  // Filters for viewing creators (original)
                  <>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Niche</p>
                      <Select value={filterNiche} onValueChange={setFilterNiche}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{niches.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Audience Size</p>
                      <Select value={filterAudience} onValueChange={setFilterAudience}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{audienceBands.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Location</p>
                      <input
                        placeholder="City or country…"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{items.length} {isCreator ? "business" : "creator"}{items.length !== 1 ? "es" : ""} match your filters</p>
            </div>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {isCreator ? <Building2 className="w-12 h-12 text-muted-foreground/40 mb-4" /> : <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />}
            <h3 className="font-display font-semibold text-lg mb-1">
              {filtersActive ? `No ${isCreator ? "businesses" : "creators"} match your filters` : `No ${isCreator ? "businesses" : "creators"} yet`}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {filtersActive ? "Try adjusting or clearing your filters." : "Check back soon!"}
            </p>
            {filtersActive && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Scrollable feed */}
        <div className="flex flex-col gap-5 snap-y snap-mandatory pb-8">
          {items.map((item) =>
            isCreator ? (
              <BusinessFeedCard
                key={item.id}
                business={item}
                saved={saved}
                onToggleSave={toggleSaveBusiness}
                onMessage={openMessage}
              />
            ) : (
              <CreatorFeedCard
                key={item.id}
                creator={item}
                saved={saved}
                onToggleSave={toggleSave}
                onMessage={openMessage}
              />
            )
          )}
        </div>

        {/* Saved quick strip (only for creators/businesses browsing creators) */}
        {!isCreator && saved.size > 0 && (
          <div className="mt-4 bg-card rounded-2xl border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Your Saved Creators ({saved.size})
            </p>
            <div className="flex gap-2 flex-wrap">
              {allItems.filter((c) => saved.has(c.id)).map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/creator/${c.id}`)}
                  className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                >
                  {c.avatar_url && <img src={c.avatar_url} className="w-5 h-5 rounded-full object-cover" />}
                  {c.display_name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}