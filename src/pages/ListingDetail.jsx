import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ProposalModal from "@/components/listings/ProposalModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, DollarSign, Calendar, Loader2, Send, Globe } from "lucide-react";
import moment from "moment";

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalOpen, setProposalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listingData, me] = await Promise.all([
        base44.entities.Listing.get(id),
        base44.auth.me(),
      ]);
      setListing(listingData);
      setUser(me);

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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display font-semibold text-xl mb-2">Listing not found</h2>
        <Link to="/" className="text-primary text-sm hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  const isOwner = user && listing.created_by_id === user.id;

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border overflow-hidden">
            {listing.image_url ? (
              <img src={listing.image_url} alt={listing.title} className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                <span className="text-6xl opacity-30">📦</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">{listing.offering_type}</Badge>
              <Badge variant="outline">{listing.category}</Badge>
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
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> ~${listing.estimated_value} value</span>
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
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-display font-semibold text-lg mb-4">Looking For</h3>
            <div className="flex flex-wrap gap-2">
              {listing.wanted_promotion_type?.map((type) => (
                <Badge key={type} className="bg-accent text-accent-foreground border-0 font-medium">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {profile && (
            <div className="bg-white rounded-2xl border p-6">
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
            <Button onClick={() => setProposalOpen(true)} className="w-full h-12 text-base rounded-xl">
              <Send className="w-4 h-4 mr-2" /> Propose a Trade
            </Button>
          )}
          {isOwner && (
            <p className="text-center text-sm text-muted-foreground">This is your listing</p>
          )}
        </div>
      </div>

      <ProposalModal
        listing={listing}
        open={proposalOpen}
        onClose={() => setProposalOpen(false)}
        user={user}
      />
    </div>
  );
}