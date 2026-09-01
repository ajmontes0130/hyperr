import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, User, UserPlus, UserCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getCreatorReviews, followUser, unfollowUser, isFollowing } from "@/api/reviews.api";
import ReviewCard from "./ReviewCard";

export default function UserReviewProfile({ user }) {
  const { userId } = useParams();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [businessMap, setBusinessMap] = useState({});

  useEffect(() => {
    loadProfile();
  }, [userId, user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userReviews = await getCreatorReviews(userId);
      setReviews(userReviews);
      const followed = await isFollowing(user.id, userId);
      setIsFollowed(followed);
      const businesses = await base44.entities.Business.list();
      const map = {};
      businesses.forEach((b) => {
        map[b.id] = b.name;
      });
      setBusinessMap(map);
    } catch (error) {
      console.error("Load error:", error);
      toast({ title: "Error loading profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    setActionLoading(true);
    try {
      if (isFollowed) {
        await unfollowUser(user.id, userId);
        setIsFollowed(false);
        toast({ title: "Unfollowed" });
      } else {
        await followUser(user.id, userId);
        setIsFollowed(true);
        toast({ title: "Following!" });
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl mb-2">Reviewer</h1>
              <p className="text-muted-foreground mb-4">{reviews.length} reviews</p>
              <p className="text-xl font-semibold">Avg Rating: {avgRating}★</p>
            </div>
          </div>

          {user.id !== userId && (
            <button
              onClick={handleToggleFollow}
              disabled={actionLoading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                isFollowed
                  ? "bg-muted text-foreground hover:bg-muted/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isFollowed ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-2xl mb-6">Reviews</h2>

        {reviews.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <p className="text-muted-foreground">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                user={user}
                showBusiness={true}
                businessName={businessMap[review.business_id] || "Unknown"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
