import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Send, Search, ArrowLeft, MapPin, Users } from "lucide-react";
import LevelBadge from "@/components/creator/LevelBadge";
import { formatFollowers } from "@/lib/creatorUtils";

const platforms = ["Instagram", "TikTok", "YouTube", "Blog", "Podcast", "Twitter/X", "Newsletter", "Event", "Other"];

export default function DirectBarterModal({ open, onClose, user }) {
  const { toast } = useToast();
  const [step, setStep] = useState("search"); // "search" | "propose"
  const [search, setSearch] = useState("");
  const [creators, setCreators] = useState([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [creatorListings, setCreatorListings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    listing_id: "",
    platform: "",
    proposed_promotion: "",
    audience_size: "",
    message: "",
  });

  // Load creators on open
  useEffect(() => {
    if (!open) return;
    setStep("search");
    setSearch("");
    setSelectedCreator(null);
    setForm({ listing_id: "", platform: "", proposed_promotion: "", audience_size: "", message: "" });
    setLoadingCreators(true);
    base44.entities.CreatorProfile.list("-total_reach")
      .then(setCreators)
      .catch(() => {})
      .finally(() => setLoadingCreators(false));
  }, [open]);

  const filtered = creators.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.display_name?.toLowerCase().includes(q) || c.bio?.toLowerCase().includes(q);
  });

  const selectCreator = async (creator) => {
    setSelectedCreator(creator);
    // Load their active listings
    const listings = await base44.entities.Listing.filter({ created_by_id: creator.created_by_id, status: "active" }).catch(() => []);
    setCreatorListings(listings);
    setStep("propose");
  };

  const handleSubmit = async () => {
    if (!form.platform || !form.proposed_promotion.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: user.id });
      const myProfile = profiles[0];

      // Use selected listing or a direct-to-creator proposal (no listing)
      const listing = creatorListings.find((l) => l.id === form.listing_id);

      await base44.entities.TradeProposal.create({
        listing_id: form.listing_id || `direct_${selectedCreator.id}`,
        listing_title: listing?.title || `Direct proposal to ${selectedCreator.display_name}`,
        listing_owner_id: selectedCreator.created_by_id,
        proposer_id: user.id,
        proposer_business_name: myProfile?.business_name || user.full_name || "Unknown",
        message: form.message,
        proposed_promotion: form.proposed_promotion,
        audience_size: form.audience_size,
        platform: form.platform,
        status: "pending",
      });

      // Notify creator
      try {
        const allUsers = await base44.entities.User.list();
        const creatorUser = allUsers.find((u) => u.id === selectedCreator.created_by_id);
        if (creatorUser?.email) {
          await base44.integrations.Core.SendEmail({
            from_name: "hyperr",
            to: creatorUser.email,
            subject: `New barter proposal from ${myProfile?.business_name || user.full_name}`,
            body: `Hi ${selectedCreator.display_name},\n\nYou have a new barter trade proposal!\n\nFrom: ${myProfile?.business_name || user.full_name}\nPlatform: ${form.platform}\nAudience: ${form.audience_size || "Not specified"}\n\nProposed promotion:\n${form.proposed_promotion}\n\nMessage:\n${form.message}\n\nReview and respond here:\nhttps://app.hyperr.com/my-trades\n\n— The hyperr team`,
          });
        }
      } catch (_) {}

      toast({ title: "Proposal sent!", description: `${selectedCreator.display_name} will review your proposal.` });
      onClose();
    } catch {
      toast({ title: "Error sending proposal", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        {step === "search" ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Send a Barter Proposal</DialogTitle>
              <DialogDescription>Search for a creator to propose a trade with.</DialogDescription>
            </DialogHeader>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search creators by name or niche…"
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mt-3 space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {loadingCreators ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No creators found</p>
                </div>
              ) : (
                filtered.map((creator) => (
                  <button
                    key={creator.id}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-secondary hover:border-border transition-all"
                    onClick={() => selectCreator(creator)}
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/20">
                      {creator.avatar_url ? (
                        <img src={creator.avatar_url} alt={creator.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-display font-bold text-lg text-primary">
                          {creator.display_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{creator.display_name}</span>
                        <LevelBadge level={creator.creator_level || "Bronze"} size="sm" />
                      </div>
                      {creator.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" /> {creator.location}
                        </span>
                      )}
                      {creator.total_reach > 0 && (
                        <p className="text-xs text-muted-foreground">{formatFollowers(creator.total_reach)} total reach</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <button
                onClick={() => setStep("search")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-1 w-fit"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <DialogTitle className="font-display text-xl">Propose a Barter</DialogTitle>
              <DialogDescription>
                To: <span className="font-medium text-foreground">{selectedCreator?.display_name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {creatorListings.length > 0 && (
                <div className="space-y-2">
                  <Label>Their Listing (optional)</Label>
                  <Select value={form.listing_id} onValueChange={(v) => setForm({ ...form, listing_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a listing (optional)" /></SelectTrigger>
                    <SelectContent>
                      {creatorListings.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Your Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>What promotion are you offering?</Label>
                <Textarea
                  placeholder="e.g. A 60-second Instagram Reel showcasing your product…"
                  value={form.proposed_promotion}
                  onChange={(e) => setForm({ ...form, proposed_promotion: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Audience Size (optional)</Label>
                <Input
                  placeholder="e.g. 25K followers"
                  value={form.audience_size}
                  onChange={(e) => setForm({ ...form, audience_size: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Message to creator</Label>
                <Textarea
                  placeholder="Introduce yourself and explain why this is a great fit…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting || !form.platform || !form.proposed_promotion.trim() || !form.message.trim()}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send Proposal
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}