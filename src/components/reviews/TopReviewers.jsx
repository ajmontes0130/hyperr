import React, { useState, useEffect } from "react";
import { Loader2, User, UserPlus, UserCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { getTopReviewers, followUser, unfollowUser, isFollowing } from "@/api/reviews.api";

export default function TopReviewers({ user }) {
  const { toast } = useToast();
  const [reviewers, setReviewers] = useState([]);
  const [following, setFollowing] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadTopReviewers();
  }, [user]);

  const loadTopReviewers = async () => {
    try {
      setLoading(true);
      const topReviewers = await getTopReviewers(20);
      setReviewers(topReviewers);
      const followStatus = {};
      for (const reviewer of topReviewers) {
        const isFollowed = await isFollowing(user.id, reviewer.userId);
        followStatus[reviewer.userId] = isFollowed;
      }
      setFollowing(followStatus);
    } catch (error) {
      console.error("Load error:", error);
      toast({ title: "Error loading reviewers", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (reviewerId) => {
    setActionLoading((prev) => ({ ...prev, [reviewerId]: true }));
    try {
      if (following[reviewerId]) {
        await unfollowUser(user.id, reviewerId);
        setFollowing((prev) => ({ ...prev, [reviewerId]: false }));
        toast({ title: "Unfollowed" });
      } else {
        await followUser(user.id, reviewerId);
        setFollowing((prev) => ({ ...prev, [reviewerId]: true }));
        toast({ title: "Following!" });
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading((prev) => ({ ...prev, [reviewerId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Top Reviewers</h1>
        <p className="text-muted-foreground">Follow the most active reviewers</p>
      </div>

      {reviewers.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <p className="text-muted-foreground">No reviewers found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviewers.map((reviewer) => (
            <div
              key={reviewer.userId}
              className="bg-card rounded-2xl border border-border p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Reviewer</p>
                  <p className="text-sm text-muted-foreground">{reviewer.reviewCount} reviews</p>
                </div>
              </div>

              <button
                onClick={() => handleToggleFollow(reviewer.userId)}
                disabled={actionLoading[reviewer.userId]}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                  following[reviewer.userId]
                    ? "bg-muted text-foreground hover:bg-muted/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {following[reviewer.userId] ? (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
