import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CreatorCard from "@/components/creator/CreatorCard";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Users } from "lucide-react";

const niches = ["All", "Food & Dining", "Travel", "Fashion & Style", "Beauty & Skincare", "Fitness & Health", "Tech & Gaming", "Lifestyle", "Finance", "Education", "Entertainment", "Music", "Art & Design", "Parenting", "Business", "Sustainability", "Other"];
const levels = ["All", "Bronze", "Silver", "Gold", "Platinum", "Diamond"];

export default function CreatorDirectory() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [niche, setNiche] = useState("All");
  const [level, setLevel] = useState("All");

  useEffect(() => {
    base44.entities.CreatorProfile.list("-total_reach").then(setCreators).finally(() => setLoading(false));
  }, []);

  const filtered = creators.filter((c) => {
    const matchSearch = !search || c.display_name?.toLowerCase().includes(search.toLowerCase()) || c.bio?.toLowerCase().includes(search.toLowerCase());
    const matchNiche = niche === "All" || (c.niche && c.niche.includes(niche));
    const matchLevel = level === "All" || c.creator_level === level;
    return matchSearch && matchNiche && matchLevel;
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

      <div className="bg-white rounded-2xl border p-4 mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search creators…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={niche} onValueChange={setNiche}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Niche" /></SelectTrigger>
          <SelectContent>
            {niches.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            {levels.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg mb-1">No creators found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => <CreatorCard key={c.id} creator={c} />)}
        </div>
      )}
    </div>
  );
}