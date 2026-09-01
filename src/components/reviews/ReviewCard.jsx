import React, { useState } from "react";
import { Star, Trash2, MessageCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function ReviewCard({ review, user, onDelete, showBusiness = false, businessName = "" }) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Delete this review?")) return;
    setDeleting(true);
    try {
      await base44.entities.Review.delete(review.id);
      toast({ title: "Review deleted" });
      onDelete?.(review.id);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user?.id === review.creator_id;

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {showBusiness && (
            <p className="text-sm text-muted-foreground mb-2 font-semibold">{businessName}</p>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{review.rating}/5</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            by {review.creator_name || "Anonymous"} · {new Date(review.created_date).toLocaleDateString()}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        )}
      </div>

      {review.text && (
        <p className="text-foreground mb-4 leading-relaxed">{review.text}</p>
      )}

      {review.images && review.images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {review.images.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Review"
              className="rounded-lg w-full h-32 object-cover"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Reply</span>
        </button>
        <span className="text-sm text-muted-foreground">
          {(review.helpful_count || 0)} found helpful
        </span>
      </div>
    </div>
  );
}
