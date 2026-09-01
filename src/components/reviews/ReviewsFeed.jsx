import React, { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getFollowingFeed } from "@/api/reviews.api";
import ReviewCard from "./ReviewCard";

export default function ReviewsFeed({ user }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [businessMap, setBusinessMap] = useState({});

  useEffect(() => {
    loadFeed();
  }, [user]);

  useEffect(() => {
    filterReviews();
  }, [search, reviews]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const feedReviews = await getFollowingFeed(user.id);
      setReviews(feedReviews);
      const businesses = await base44.entities.Business.list();
      const map = {};
      businesses.forEach((b) => {
        map[b.id] = b.name;
      });
      setBusinessMap(map);
    } catch (error) {
      console.error("Load error:", error);
      toast({ title: "Error loading feed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    if (!search) {
      setFilteredReviews(reviews);
      return;
    }
    const query = search.toLowerCase();
    const filtered = reviews.filter((review) => {
      const businessName = businessMap[review.business_id]?.toLowerCase() || "";
      const reviewText = review.text?.toLowerCase() || "";
      return businessName.includes(query) || reviewText.includes(query);
    });
    setFilteredReviews(filtered);
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Your Feed</h1>
        <p className="text-muted-foreground">Reviews from people you follow</p>
      </div>

      <div className="mb-8 relative">
        <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {filteredReviews.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {reviews.length === 0 ? "You aren't following anyone yet" : "No reviews match your search"}
          </p>
          {reviews.length === 0 && (
            <button
              onClick={() => navigate("/reviews/reviewers")}
              className="text-primary font-semibold hover:underline"
            >
              Discover Reviewers
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              user={user}
              onDelete={handleReviewDeleted}
              showBusiness={true}
              businessName={businessMap[review.business_id] || "Unknown"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
