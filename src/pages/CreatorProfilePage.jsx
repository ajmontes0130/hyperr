import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MobileBackButton from "@/components/MobileBackButton";
import { base44 } from "@/api/base44Client";
import LevelBadge from "@/components/creator/LevelBadge";
import StarRating from "@/components/creator/StarRating";
import CashOfferModal from "@/components/creator/CashOfferModal";
import ReviewModal from "@/components/creator/ReviewModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, MapPin, Globe, DollarSign, Loader2, ExternalLink, Handshake, ShieldCheck, ShieldAlert, Bookmark, BookmarkCheck } from "lucide-react";
import { formatFollowers, levelConfig } from "@/lib/creatorUtils";
import moment from "moment";

const platformColors = {
  Instagram: "bg-pink-100 text-pink-700",
  TikTok: "bg-slate-100 text-slate-700",
  YouTube: "bg-red-100 text-red-700",
  "Twitter/X": "bg-sky-100 text-sky-700",
};

export default function CreatorProfilePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [creator, setCreator] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cashOfferOpen, setCashOfferOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState(null);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [creatorData, me] = await Promise.all([
        base44.entities.CreatorProfile.get(id),
        base44.auth.me(),
      ]);
      setCreator(creatorData);
      setUser(me);
      const [port, revs, saved] = await Promise.all([
        base44.entities.CollabPortfolio.filter({ creator_profile_id: id }, "-created_date"),
        base44.entities.Review.filter({ reviewee_id: creatorData.created_by_id }, "-created_date"),
        base44.entities.SavedCreator.filter({ user_id: me.id, creator_profile_id: id }).catch(() => []),
      ]);
      setPortfolio(port);
      setReviews(revs);
      if (saved.length > 0) { setIsSaved(true); setSavedRecordId(saved[0].id); }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user || !creator) return;
    if (isSaved && savedRecordId) {
      await base44.entities.SavedCreator.delete(savedRecordId);
      setIsSaved(false);
      setSavedRecordId(null);
      toast({ title: "Removed from saved" });
    } else {
      const record = await base44.entities.SavedCreator.create({
        user_id: user.id,
        creator_profile_id: creator.id,
        creator_name: creator.display_name,
        creator_avatar: creator.avatar_url,
        creator_level: creator.creator_level,
      });
      setIsSaved(true);
      setSavedRecordId(record.id);
      toast({ title: "Creator saved!" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!creator) return <div className="text-center py-20"><p>Creator not found.</p><Link to="/creators" className="text-primary text-sm">← Back</Link></div>;

  const isOwner = user && creator.created_by_id === user.id;
  const level = creator.creator_level || "Bronze";
  const cfg = levelConfig[level];

  const socials = [
    { label: "Instagram", handle: creator.instagram_handle, followers: creator.instagram_followers, verified: creator.instagram_verified, color: "bg-gradient-to-br from-pink-500 to-purple-600" },
    { label: "TikTok", handle: creator.tiktok_handle, followers: creator.tiktok_followers, verified: creator.tiktok_verified, color: "bg-gradient-to-br from-slate-800 to-slate-600" },
    { label: "YouTube", handle: creator.youtube_handle, followers: creator.youtube_subscribers, verified: creator.youtube_verified, color: "bg-gradient-to-br from-red-500 to-red-700" },
    { label: "Twitter/X", handle: creator.twitter_handle, followers: creator.twitter_followers, verified: creator.twitter_verified, color: "bg-gradient-to-br from-sky-500 to-sky-700" },
  ].filter((s) => s.handle || s.followers > 0);

  return (
    <div>
      <MobileBackButton />
      <Link to="/creators" className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Creators
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile card */}
          <div className="bg-card rounded-2xl border p-6 text-center">
            <div className="w-24 h-24 rounded-2xl mx-auto mb-4 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20">
              {creator.avatar_url
                ? <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center font-display font-bold text-3xl text-primary">{creator.display_name?.charAt(0)}</div>
              }
            </div>
            <h1 className="font-display font-bold text-2xl mb-1">{creator.display_name}</h1>
            {creator.location && (
              <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="w-3.5 h-3.5" /> {creator.location}
              </p>
            )}
            <div className="flex justify-center mb-4">
              <LevelBadge level={level} size="lg" showInfo />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <StarRating value={Math.round(creator.avg_rating || 0)} readonly size={5} />
              <span className="text-sm text-muted-foreground">
                {creator.avg_rating ? creator.avg_rating.toFixed(1) : "No reviews yet"}
                {creator.total_collabs > 0 && ` (${creator.total_collabs})`}
              </span>
            </div>
            {creator.website && (
              <a href={creator.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline mb-4">
                <Globe className="w-4 h-4" /> {creator.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {creator.niche && creator.niche.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {creator.niche.map((n) => <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>)}
              </div>
            )}
          </div>

          {/* Social reach */}
          {socials.length > 0 && (
            <div className="bg-card rounded-2xl border p-6">
              <h3 className="font-display font-semibold mb-4">Social Reach</h3>
              <div className="space-y-3">
                {socials.map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-lg ${s.color}`}>{s.label}</span>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <p className={`font-semibold text-sm ${!s.verified ? "text-amber-600" : ""}`}>
                          {formatFollowers(s.followers)}
                        </p>
                        {s.verified
                          ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" title="Verified" />
                          : <ShieldAlert className="w-3.5 h-3.5 text-amber-500" title="Unverified" />
                        }
                      </div>
                      {s.handle && <p className="text-xs text-muted-foreground">{s.handle}</p>}
                      {!s.verified && (
                        <span className="text-xs text-amber-600 font-medium">Unverified</span>
                      )}
                    </div>
                  </div>
                ))}
                {creator.total_reach > 0 && (
                  <div className="pt-3 border-t flex items-center justify-between">
                    <span className="text-sm font-medium">Total Reach</span>
                    <span className="font-bold text-primary">{formatFollowers(creator.total_reach)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rate card */}
          {(creator.base_rate > 0 || creator.accepts_barter) && (
            <div className={`rounded-2xl border p-6 ${cfg.bg} ${cfg.border}`}>
              <h3 className={`font-display font-semibold mb-3 ${cfg.color}`}>Rate Card</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suggested range</span>
                  <span className={`font-semibold ${cfg.color}`}>{cfg.range}</span>
                </div>
                {creator.base_rate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Starting from</span>
                    <span className="font-semibold">${creator.base_rate.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {creator.accepts_cash_offers && <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">Accepts Cash</Badge>}
                  {creator.accepts_barter && <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">Accepts Barter</Badge>}
                </div>
              </div>
            </div>
          )}

          {!isOwner && (
            <div className="space-y-3">
              {creator.accepts_cash_offers && (
                <Button className="w-full rounded-xl h-11" onClick={() => setCashOfferOpen(true)}>
                  <DollarSign className="w-4 h-4 mr-2" /> Send Cash Offer
                </Button>
              )}
              {creator.accepts_barter && (
                <Link to="/" className="block">
                  <Button variant="outline" className="w-full rounded-xl h-11">
                    <Handshake className="w-4 h-4 mr-2" /> Propose a Barter
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="w-full rounded-xl h-11" onClick={handleToggleSave}>
                {isSaved
                  ? <><BookmarkCheck className="w-4 h-4 mr-2 text-primary" /> Saved</>
                  : <><Bookmark className="w-4 h-4 mr-2" /> Save Creator</>
                }
              </Button>
              <Button variant="ghost" className="w-full rounded-xl h-11 text-muted-foreground" onClick={() => setReviewOpen(true)}>
                Leave a Review
              </Button>
            </div>
          )}
          {isOwner && (
            <Link to="/creator-profile">
              <Button variant="outline" className="w-full rounded-xl">Edit My Profile</Button>
            </Link>
          )}
        </div>

        {/* Main */}
        <div className="lg:col-span-2 space-y-8">
          {creator.bio && (
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="font-display font-semibold text-lg mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{creator.bio}</p>
            </div>
          )}

          {/* Portfolio */}
          <div>
            <h2 className="font-display font-semibold text-xl mb-4">Collaboration Portfolio</h2>
            {portfolio.length === 0 ? (
              <div className="bg-card rounded-2xl border p-10 text-center">
                <p className="text-muted-foreground text-sm">No portfolio items yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.map((item) => (
                  <div key={item.id} className="bg-card rounded-2xl border overflow-hidden group hover:shadow-md transition-all">
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                      {item.thumbnail_url
                        ? <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🎬</div>
                      }
                      <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-lg text-white ${platformColors[item.platform] || "bg-gray-600"}`}>
                        {item.platform}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm leading-snug">{item.title}</h4>
                        {item.content_url && (
                          <a href={item.content_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary flex-shrink-0">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.brand_name} {item.month_year && `· ${item.month_year}`}</p>
                      {item.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{item.description}</p>}
                      {item.collab_type && (
                        <Badge variant="outline" className="mt-2 text-xs">{item.collab_type}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-display font-semibold text-xl mb-4">Reviews</h2>
            {reviews.length === 0 ? (
              <div className="bg-card rounded-2xl border p-10 text-center">
                <p className="text-muted-foreground text-sm">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-card rounded-2xl border p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-semibold text-sm">{r.reviewer_name}</p>
                        {r.collab_title && <p className="text-xs text-muted-foreground">{r.collab_title}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StarRating value={r.rating} readonly size={4} />
                        <span className="text-xs text-muted-foreground">{moment(r.created_date).fromNow()}</span>
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CashOfferModal open={cashOfferOpen} onClose={() => setCashOfferOpen(false)} creator={creator} user={user} />
      <ReviewModal
        open={reviewOpen}
        onClose={() => { setReviewOpen(false); loadData(); }}
        proposal={null}
        user={user}
        reviewerType="business"
        revieweeId={creator.created_by_id}
        revieweeType="creator"
        collabTitle={`Collaboration with ${creator.display_name}`}
      />
    </div>
  );
}