import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import StarRating from "./StarRating";
import { Loader2 } from "lucide-react";

export default function ReviewModal({ open, onClose, proposal, user, reviewerType, revieweeId, revieweeType, collabTitle }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      const myProfile = reviewerType === "creator"
        ? await base44.entities.CreatorProfile.filter({ created_by_id: user.id }).then(r => r[0])
        : await base44.entities.BusinessProfile.filter({ created_by_id: user.id }).then(r => r[0]);

      await base44.entities.Review.create({
        trade_proposal_id: proposal?.id || "",
        reviewer_id: user.id,
        reviewer_name: myProfile?.display_name || myProfile?.business_name || user.full_name || "Unknown",
        reviewer_type: reviewerType,
        reviewee_id: revieweeId,
        reviewee_type: revieweeType,
        rating,
        comment,
        collab_title: collabTitle || "",
      });

      // Update avg rating + total_collabs on creator profile if reviewee is a creator
      if (revieweeType === "creator") {
        const creatorProfiles = await base44.entities.CreatorProfile.filter({ created_by_id: revieweeId });
        if (creatorProfiles.length > 0) {
          const cp = creatorProfiles[0];
          const allReviews = await base44.entities.Review.filter({ reviewee_id: revieweeId });
          const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
          await base44.entities.CreatorProfile.update(cp.id, {
            avg_rating: Math.round(avg * 10) / 10,
            total_collabs: allReviews.length,
          });
        }
      }

      toast({ title: "Review submitted! Thank you." });
      onClose();
      setRating(0);
      setComment("");
    } catch (err) {
      toast({ title: "Error submitting review", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Leave a Review</DialogTitle>
          {collabTitle && <p className="text-sm text-muted-foreground mt-1">For: {collabTitle}</p>}
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <StarRating value={rating} onChange={setRating} size={7} />
          </div>
          <div className="space-y-2">
            <Label>Comment (optional)</Label>
            <Textarea
              placeholder="Share your experience with this collaboration…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!rating || loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Submit Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}