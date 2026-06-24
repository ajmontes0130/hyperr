import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Heart, X, ChevronLeft, ChevronRight, Loader2, MessageCircle, Star, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import LevelBadge from "@/components/creator/LevelBadge";

const platformColors = {
  instagram_followers: "bg-pink-100 text-pink-700",
  tiktok_followers: "bg-slate-100 text-slate-700",
  youtube_subscribers: "bg-red-100 text-red-700",
  twitter_followers: "bg-sky-100 text-sky-700",
};

const platformLabels = {
  instagram_followers: "Instagram",
  tiktok_followers: "TikTok",
  youtube_subscribers: "YouTube",
  twitter_followers: "Twitter/X",
};

const formatNum = (n) => {
  if (!n) return null;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

export default function Explore() {
  const [creators, setCreators] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(new Set());
  const [user, setUser] = useState(null);
  const [animDir, setAnimDir] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      base44.auth.me(),
      base44.entities.CreatorProfile.list("-total_reach"),
    ]).then(([me, list]) => {
      setUser(me);
      setCreators(list);
      return base44.entities.SavedCreator.filter({ user_id: me.id });
    }).then((savedList) => {
      setSaved(new Set(savedList.map((s) => s.creator_profile_id)));
    }).finally(() => setLoading(false));
  }, []);

  const creator = creators[index];

  const go = (dir) => {
    setAnimDir(dir);
    setTimeout(() => {
      setIndex((i) => Math.max(0, Math.min(creators.length - 1, i + dir)));
      setAnimDir(null);
    }, 200);
  };

  const toggleSave = async () => {
    if (!user || !creator) return;
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

  const openMessage = () => {
    navigate(`/messages?with=${creator.created_by_id || creator.id}&name=${encodeURIComponent(creator.display_name)}&avatar=${encodeURIComponent(creator.avatar_url || "")}`);
  };

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
        <h3 className="font-display font-semibold text-lg mb-1">No creators yet</h3>
        <p className="text-muted-foreground text-sm">Check back soon!</p>
      </div>
    );
  }

  const platforms = Object.entries(platformLabels).filter(([key]) => creator[key]);

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-2">
          Explore <span className="text-primary">Creators</span>
        </h1>
        <p className="text-muted-foreground">Browse through creators and save the ones you love.</p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Card */}
        <div
          className={`bg-white rounded-3xl border shadow-lg overflow-hidden transition-all duration-200 ${
            animDir === -1 ? "-translate-x-4 opacity-0" : animDir === 1 ? "translate-x-4 opacity-0" : "translate-x-0 opacity-100"
          }`}
        >
          {/* Hero image / avatar */}
          <div className="relative h-56 bg-gradient-to-br from-primary/20 via-accent to-purple-100 flex items-center justify-center">
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.display_name} className="w-28 h-28 rounded-full object-cover ring-4 ring-white shadow-lg" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-white shadow-lg">
                <Users className="w-12 h-12 text-primary/40" />
              </div>
            )}
            <div className="absolute top-4 right-4">
              <LevelBadge level={creator.creator_level} />
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-1">
              <h2 className="font-display font-bold text-2xl">{creator.display_name}</h2>
              {creator.avg_rating && (
                <div className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {creator.avg_rating.toFixed(1)}
                </div>
              )}
            </div>

            {creator.location && (
              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                <MapPin className="w-3.5 h-3.5" /> {creator.location}
              </div>
            )}

            {creator.bio && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{creator.bio}</p>
            )}

            {/* Niches */}
            {creator.niche?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {creator.niche.map((n) => (
                  <Badge key={n} variant="secondary" className="text-xs rounded-full">{n}</Badge>
                ))}
              </div>
            )}

            {/* Platform stats */}
            {platforms.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {platforms.map(([key, label]) => (
                  <span key={key} className={`text-xs px-2.5 py-1 rounded-full font-medium ${platformColors[key]}`}>
                    {label} · {formatNum(creator[key])}
                  </span>
                ))}
              </div>
            )}

            {/* Base rate */}
            {creator.base_rate && (
              <p className="text-sm font-semibold text-primary mb-5">
                Starting from ${creator.base_rate.toLocaleString()}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={`flex-1 rounded-xl gap-2 ${saved.has(creator.id) ? "border-rose-300 text-rose-500 bg-rose-50 hover:bg-rose-100" : ""}`}
                onClick={toggleSave}
              >
                <Heart className={`w-4 h-4 ${saved.has(creator.id) ? "fill-rose-500" : ""}`} />
                {saved.has(creator.id) ? "Saved" : "Save"}
              </Button>
              <Button className="flex-1 rounded-xl gap-2" onClick={openMessage}>
                <MessageCircle className="w-4 h-4" /> Message
              </Button>
              <Button variant="ghost" className="rounded-xl px-4" onClick={() => navigate(`/creator/${creator.id}`)}>
                View
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => go(-1)} disabled={index === 0}>
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">{index + 1} of {creators.length}</span>
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => go(1)} disabled={index === creators.length - 1}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Saved quick strip */}
        {saved.size > 0 && (
          <div className="mt-8 bg-white rounded-2xl border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Your Saved Creators ({saved.size})
            </p>
            <div className="flex gap-2 flex-wrap">
              {creators.filter((c) => saved.has(c.id)).map((c) => (
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