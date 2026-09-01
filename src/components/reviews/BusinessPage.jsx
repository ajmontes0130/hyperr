import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Loader2, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getBusinessReviews } from "@/api/reviews.api";
import ReviewCard from "./ReviewCard";

export default function BusinessPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      const data = await base44.entities.Business.read(id);
      setBusiness(data);
      const reviewsData = await getBusinessReviews(id);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Load error:", error);
      toast({ title: "Business not found", variant: "destructive" });
      navigate("/reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return <div className="text-center py-12">Business not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-card rounded-2xl border border-border p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-4xl mb-2">{business.name}</h1>
            <p className="text-lg text-muted-foreground mb-2">{business.category}</p>
            {business.location && (
              <p className="text-sm text-muted-foreground">{business.location}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < Math.round(business.avg_rating || 0)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <div>
            <p className="text-2xl font-bold">{business.avg_rating || 0}</p>
            <p className="text-sm text-muted-foreground">{business.review_count || 0} reviews</p>
          </div>
        </div>

        {business.description && (
          <p className="text-foreground leading-relaxed mb-6">{business.description}</p>
        )}

        <button
          onClick={() => navigate("/reviews/create")}
          className="bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Write a Review
        </button>
      </div>

      <div>
        <h2 className="font-display font-bold text-2xl mb-6">
          Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <p className="text-muted-foreground mb-4">No reviews yet</p>
            <button
              onClick={() => navigate("/reviews/create")}
              className="text-primary font-semibold hover:underline"
            >
              Be the first to review
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                user={user}
                onDelete={handleReviewDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
