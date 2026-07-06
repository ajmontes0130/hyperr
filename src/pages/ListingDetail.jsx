import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MobileBackButton from "@/components/MobileBackButton";
import { base44 } from "@/api/base44Client";
import ProposalModal from "@/components/listings/ProposalModal";
import SignupPrompt from "@/components/SignupPrompt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign, Calendar, Loader2, Send, Globe, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import moment from "moment";

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  useSEO({
    title: listing ? `${listing.title} — Trade Listing | hyperr` : "Trade Listing | hyperr",
    description: listing ? (listing.offering_details?.slice(0, 140) || `${listing.title} on hyperr.`) : "Browse trade listings on hyperr.",
  });
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listingData, me] = await Promise.all([
        base44.entities.Listing.get(id),
        base44.auth.me().catch(() => null),
      ]);
      setListing(listingData);
      if (me) setUser(me);
      if (listingData.business_profile_id) {
        try {
          const prof = await base44.entities.BusinessProfile.get(listingData.business_profile_id);
          setProfile(prof);
        } catch {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (!listing) return (
    <div className="text-center py-20">
      <h2 className="font-display font-semibold text-xl mb-2">Listing not found</h2>
      <Link to="/" className="text-primary text-sm hover:underline">Back to Marketplace</Link>
    </div>
  );

  const isOwner = user && listing.created_by_id === user.id;
  const images = listing.image_urls?.length > 0 ? listing.image_urls : (listing.image_url ? [listing.image_url] : []);

  return (
    <div>
      <MobileBackButton />
      <Link to="/marketplace" className="hidden sm:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image gallery */}
          <div className="bg-card rounded-2xl border overflow-hidden">
            {images.length > 0 ? (
              <div>
                <div className="relative">
                  <img src={images[activeImage]} alt={listing.title} className="w-full aspect-video object-cover" />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setActiveImage(i)} className={`w-2 h-2 rounded-full transition-colors ${i === activeImage ? "bg-white" : "bg-white/50"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((url, i) => (
                      <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage ? "border-primary" : "border-transparent"}`}>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <span className="text-6xl opacity-30">📦</span>
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">{listing.offering_type}</Badge>
              <Badge variant="outline">{listing.category}</Badge>
              {listing.min_creator_tier && listing.min_creator_tier !== "Any" && (
                <Badge variant="secondary">Min. {listing.min_creator_tier} tier required</Badge>
              )}
              {listing.status !== "active" && (
                <Badge variant="secondary" className="capitalize">{listing.status}</Badge>
              )}
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-3xl mb-4">{listing.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              {listing.location && (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {listing.location}</span>
              )}
              {listing.estimated_value > 0 && (
                <span className="flex items-center gap-1.5 group relative">
                  <DollarSign className="w-4 h-4" />
                  Business valuation: ~${listing.estimated_value.toLocaleString()}
                  <Info className="w-3.5 h-3.5 text-muted-foreground/50 ml-0.5" title="This is the business's own estimate of what they're offering. Informational only, not contractual." />
                </span>
              )}
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {moment(listing.created_date).fromNow()}</span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">What's Offered</h3>
                <p className="text-foreground leading-relaxed">{listing.offering_details}</p>
              </div>
              {listing.description && (
                <div>
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">Details</h3>
                  <p className="text-foreground leading-relaxed">{listing.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Promotion requirements */}
          <div className="bg-card rounded-2xl border p-6">
            <h3 className="font-display font-semibold text-lg mb-4">Looking For</h3>
            {listing.promotion_requirements?.length > 0 ? (
              <div className="space-y-3">
                {listing.promotion_requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-accent/50">
                    <Badge className="bg-accent text-accent-foreground border-0 flex-shrink-0 mt-0.5">{req.type}</Badge>
                    <div className="text-sm">
                      <span className="font-medium">×{req.quantity || 1}</span>
                      {req.note && <span className="text-muted-foreground"> — {req.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {listing.wanted_promotion_type?.map((type) => (
                  <Badge key={type} className="bg-accent text-accent-foreground border-0 font-medium">{type}</Badge>
                ))}
              </div>
            )}

            {listing.usage_rights && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Requirements & Usage Rights</p>
                <p className="text-sm text-foreground leading-relaxed">{listing.usage_rights}</p>
              </div>
            )}
          </div>

          {profile && (
            <div className="bg-card rounded-2xl border p-6">
              <h3 className="font-display font-semibold text-lg mb-4">Posted By</h3>
              <div className="flex items-center gap-3 mb-3">
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-display font-bold text-primary">
                    {profile.business_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{profile.business_name}</p>
                  <p className="text-xs text-muted-foreground">{profile.category}</p>
                </div>
              </div>
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <Globe className="w-3.5 h-3.5" /> Visit website
                </a>
              )}
            </div>
          )}

          {!isOwner && listing.status === "active" && (
            <Button onClick={() => user ? setProposalOpen(true) : setSignupOpen(true)} className="w-full h-12 text-base rounded-xl">
              <Send className="w-4 h-4 mr-2" /> Propose a Trade
            </Button>
          )}
          {isOwner && (
            <p className="text-center text-sm text-muted-foreground">This is your listing</p>
          )}
        </div>
      </div>

      <ProposalModal listing={listing} open={proposalOpen} onClose={() => setProposalOpen(false)} user={user} />
      <SignupPrompt
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        title="Sign up to propose a trade"
        message="Create a free account to send trade proposals to businesses on hyperr."
      />
    </div>
  );
}