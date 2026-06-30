import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, ShieldAlert, Bookmark, BookmarkCheck } from "lucide-react";
import LevelBadge from "./LevelBadge";
import StarRating from "./StarRating";
import { formatFollowers } from "@/lib/creatorUtils";

const platformIcons = {
  instagram_followers: { label: "IG", color: "bg-[#2E121A] text-[#FF4D6D]", verifiedKey: "instagram_verified" },
  tiktok_followers:    { label: "TT", color: "bg-secondary text-foreground", verifiedKey: "tiktok_verified" },
  youtube_subscribers: { label: "YT", color: "bg-[#2E1313] text-[#EF4444]", verifiedKey: "youtube_verified" },
  twitter_followers:   { label: "𝕏",  color: "bg-[#0E2A33] text-[#2DD4FF]", verifiedKey: "twitter_verified" },
};

export default function CreatorCard({ creator, isSaved, onToggleSave }) {
  const socials = [
    { key: "instagram_followers", val: creator.instagram_followers },
    { key: "tiktok_followers",    val: creator.tiktok_followers },
    { key: "youtube_subscribers", val: creator.youtube_subscribers },
    { key: "twitter_followers",   val: creator.twitter_followers },
  ].filter((s) => s.val > 0);

  return (
    <div className="relative">
      {onToggleSave && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(creator); }}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          title={isSaved ? "Unsave creator" : "Save creator"}
        >
          {isSaved
            ? <BookmarkCheck className="w-4 h-4 text-primary" />
            : <Bookmark className="w-4 h-4 text-muted-foreground" />
          }
        </button>
      )}
      <Link
        to={`/creator/${creator.id}`}
        className="group bg-card rounded-2xl border border-border p-5 hover:bg-secondary hover:border-[#34425A] hover:shadow-lg hover:shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/20">
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display font-bold text-xl text-primary">
                {creator.display_name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-base group-hover:text-primary transition-colors truncate">
              {creator.display_name}
            </h3>
            {creator.location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="w-3 h-3" /> {creator.location}
              </span>
            )}
            <div className="mt-1.5">
              <LevelBadge level={creator.creator_level || "Bronze"} size="sm" showInfo />
            </div>
          </div>
        </div>

        {creator.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{creator.bio}</p>
        )}

        {creator.niche && creator.niche.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {creator.niche.slice(0, 3).map((n) => (
              <span key={n} className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{n}</span>
            ))}
            {creator.niche.length > 3 && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">+{creator.niche.length - 3}</span>
            )}
          </div>
        )}

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {socials.map(({ key, val }) => {
              const p = platformIcons[key];
              const isVerified = creator[p.verifiedKey];
              return (
                <span key={key} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${p.color}`}>
                  <span className="font-bold">{p.label}</span>
                  <span>{formatFollowers(val)}</span>
                  {isVerified
                    ? <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    : <ShieldAlert className="w-3 h-3 text-amber-500" />
                  }
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(creator.avg_rating || 0)} readonly size={3} />
            <span className="text-xs text-muted-foreground">
              {creator.avg_rating ? creator.avg_rating.toFixed(1) : "New"}
              {creator.total_collabs > 0 && ` · ${creator.total_collabs} collabs`}
            </span>
          </div>
          {creator.base_rate > 0 && creator.accepts_cash_offers && (
            <span className="text-xs font-semibold text-primary">from ${creator.base_rate}</span>
          )}
        </div>
      </Link>
    </div>
  );
}