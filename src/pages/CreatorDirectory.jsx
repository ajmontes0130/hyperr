import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CreatorCard from "@/components/creator/CreatorCard";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import SignupPrompt from "@/components/SignupPrompt";

const niches = ["All", "Food & Dining", "Travel", "Fashion & Style", "Beauty & Skincare", "Fitness & Health", "Tech & Gaming", "Lifestyle", "Finance", "Education", "Entertainment", "Music", "Art & Design", "Parenting", "Business", "Sustainability", "Other"];
const levels = ["All", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const reachRanges = [
  { label: "Any reach", value: "all" },
  { label: "Under 10K", value: "0-10000" },
  { label: "10K – 50K", value: "10000-50000" },
  { label: "50K – 250K", value: "50000-250000" },
  { label: "250K – 1M", value: "250000-1000000" },
  { label: "1M+", value: "1000000-999999999" },
];

export default function CreatorDirectory() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("All");
  const [level, setLevel] = useState("All");
  const [reach, setReach] = useState("all");
  const [user, setUser] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedRecords, setSavedRecords] = useState([]);
  const [signupOpen, setSignupOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      const [allCreators, me] = await Promise.all([
        base44.entities.CreatorProfile.list("-total_reach"),
        base44.auth.me().catch(() => null),
      ]);
      setCreators(allCreators);
      if (me) {
        setUser(me);
        const saved = await base44.entities.SavedCreator.filter({ user_id: me.id }).catch(() => []);
        setSavedRecords(saved);
        setSavedIds(new Set(saved.map((s) => s.creator_profile_id)));
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleToggleSave = async (creator) => {
    if (!user) { setSignupOpen(true); return; }
    if (savedIds.has(creator.id)) {
      const record = savedRecords.find((s) => s.creator_profile_id === creator.id);
      if (record) await base44.entities.SavedCreator.delete(record.id);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(creator.id); return n; });
      setSavedRecords((prev) => prev.filter((s) => s.creator_profile_id !== creator.id));
      toast({ title: "Removed from saved" });
    } else {
      const record = await base44.entities.SavedCreator.create({
        user_id: user.id,
        creator_profile_id: creator.id,
        creator_name: creator.display_name,
        creator_avatar: creator.avatar_url,
        creator_level: creator.creator_level,
      });
      setSavedIds((prev) => new Set([...prev, creator.id]));
      setSavedRecords((prev) => [...prev, record]);
      toast({ title: "Creator saved!" });
    }
  };

  const filtered = creators.filter((c) => {
    const matchSearch = !search || c.display_name?.toLowerCase().includes(search.toLowerCase()) || c.bio?.toLowerCase().includes(search.toLowerCase());
    const matchNiche = niche === "All" || (c.niche && c.niche.includes(niche));
    const matchLevel = level === "All" || c.creator_level === level;
    const matchReach = reach === "all" || (() => {
      const [min, max] = reach.split("-").map(Number);
      const r = c.total_reach || 0;
      return r >= min && r <= max;
    })();
    return matchSearch && matchNiche && matchLevel && matchReach;
  });

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-3">
          Creator <span className="text-primary">Directory</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Discover talented creators ready to collaborate. Filter by niche, level, and more.
        </p>
      </div>

      <div className="bg-card rounded-2xl border p-4 mb-8 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search creators…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-1">Niche</p>
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {niches.map((n) => <SelectItem key={n} value={n}>{n === "All" ? "All niches" : n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-1">Creator Tier</p>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {levels.map((l) => <SelectItem key={l} value={l}>{l === "All" ? "All tiers" : l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <p className="text-xs font-medium text-muted-foreground px-1">Total Reach</p>
            <Select value={reach} onValueChange={setReach}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {reachRanges.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-1">No creators found</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {creators.length === 0 ? "No creators have joined yet — invite your first creator." : "Try adjusting your filters."}
          </p>
          {creators.length === 0 && (
            <Link to="/explore">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
                <Users className="w-4 h-4" /> Explore Creators
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => <CreatorCard key={c.id} creator={c} isSaved={savedIds.has(c.id)} onToggleSave={handleToggleSave} />)}
        </div>
      )}

      <SignupPrompt
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        title="Sign up to save creators"
        message="Create a free account to bookmark creators you want to collaborate with."
      />
    </div>
  );
}