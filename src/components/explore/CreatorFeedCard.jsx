import React from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Star, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LevelBadge from "@/components/creator/LevelBadge";

const platformColors = {
  instagram_followers: "bg-[#2E121A] text-[#FF4D6D]",
  tiktok_followers: "bg-secondary text-foreground",
  youtube_subscribers: "bg-[#2E1313] text-[#EF4444]",
  twitter_followers: "bg-[#0E2A33] text-[#2DD4FF]",
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

export default function CreatorFeedCard({ creator, saved, onToggleSave, onMessage }) {
  const navigate = useNavigate();
  const platforms = Object.entries(platformLabels).filter(([key]) => creator[key]);

  return (
    <div className="bg-card rounded-3xl border shadow-lg shadow-black/30 overflow-hidden snap-start">
      {/* Hero image / avatar */}
      <div className="relative h-56 bg-gradient-to-br from-[#0E2A33] via-[#121823] to-[#1B2330] flex items-center justify-center">
        {creator.avatar_url ? (
          <img src={creator.avatar_url} alt={creator.display_name} className="w-28 h-28 rounded-full object-cover ring-4 ring-border shadow-lg" />
        ) : (
          <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-border shadow-lg">
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

        {creator.niche?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {creator.niche.map((n) => (
              <Badge key={n} variant="secondary" className="text-xs rounded-full">{n}</Badge>
            ))}
          </div>
        )}

        {platforms.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {platforms.map(([key, label]) => (
              <span key={key} className={`text-xs px-2.5 py-1 rounded-full font-medium ${platformColors[key]}`}>
                {label} · {formatNum(creator[key])}
              </span>
            ))}
          </div>
        )}

        {creator.base_rate && (
          <p className="text-sm font-semibold text-primary mb-5">
            Starting from ${creator.base_rate.toLocaleString()}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className={`flex-1 rounded-xl gap-2 ${saved.has(creator.id) ? "border-[#FF4D6D]/40 text-[#FF4D6D] bg-[#2E121A] hover:bg-[#3a1525]" : ""}`}
            onClick={() => onToggleSave(creator)}
          >
            <Heart className={`w-4 h-4 ${saved.has(creator.id) ? "fill-rose-500" : ""}`} />
            {saved.has(creator.id) ? "Saved" : "Save"}
          </Button>
          <Button className="flex-1 rounded-xl gap-2" onClick={() => onMessage(creator)}>
            <MessageCircle className="w-4 h-4" /> Message
          </Button>
          <Button variant="ghost" className="rounded-xl px-4" onClick={() => navigate(`/creator/${creator.id}`)}>
            View
          </Button>
        </div>
      </div>
    </div>
  );
}