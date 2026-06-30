import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Loader2 } from 'lucide-react';

const StarRating = ({ rating, size = 4 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-${size} h-${size} ${
          star <= rating ? 'fill-current text-yellow-400' : 'text-muted-foreground/30'
        }`}
      />
    ))}
  </div>
);

export default function ReviewsList({ creatorId, businessId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [creatorId, businessId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const revieweeId = creatorId || businessId;
      const allReviews = await base44.entities.Review.filter({ reviewee_id: revieweeId });
      setReviews(allReviews);
      if (allReviews.length > 0) {
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">No reviews yet. Complete a trade to earn your first review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average rating summary */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold">{avgRating}</span>
            <StarRating rating={Math.round(avgRating)} size={5} />
          </div>
          <p className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{review.reviewer_name}</p>
                <p className="text-xs text-muted-foreground">{review.reviewer_type === 'business' ? 'Business' : 'Creator'}</p>
              </div>
              <StarRating rating={review.rating} size={4} />
            </div>
            {review.collab_title && (
              <p className="text-xs text-muted-foreground">Collaborated on: {review.collab_title}</p>
            )}
            {review.comment && <p className="text-sm text-foreground mt-2">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}