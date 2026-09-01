import { base44 } from "./base44Client";

// BUSINESSES
export const getBusinesses = () => base44.entities.Business.list("-created_date");
export const getBusiness = (id) => base44.entities.Business.read(id);
export const createBusiness = (data) => base44.entities.Business.create(data);
export const updateBusiness = (id, data) => base44.entities.Business.update(id, data);
export const searchBusinesses = (query) =>
  base44.entities.Business.filter({ name: { $regex: query, $options: "i" } });

// REVIEWS
export const getReviews = () => base44.entities.Review.list("-created_date");
export const getReview = (id) => base44.entities.Review.read(id);
export const createReview = (data) => base44.entities.Review.create(data);
export const updateReview = (id, data) => base44.entities.Review.update(id, data);
export const getBusinessReviews = (businessId) =>
  base44.entities.Review.filter({ business_id: businessId }).then((reviews) =>
    reviews.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
  );
export const getCreatorReviews = (creatorId) =>
  base44.entities.Review.filter({ creator_id: creatorId }).then((reviews) =>
    reviews.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
  );
export const deleteReview = (id) => base44.entities.Review.delete(id);

// FOLLOW SYSTEM
export const followUser = (followerId, followingId) =>
  base44.entities.ReviewFollow.create({
    follower_id: followerId,
    following_id: followingId,
    follow_type: "user",
    created_date: new Date().toISOString(),
  });

export const unfollowUser = (followerId, followingId) => {
  return base44.entities.ReviewFollow.filter({
    follower_id: followerId,
    following_id: followingId,
  }).then((follows) => {
    if (follows.length) return base44.entities.ReviewFollow.delete(follows[0].id);
  });
};

export const getFollowing = (userId) =>
  base44.entities.ReviewFollow.filter({ follower_id: userId });

export const getFollowers = (userId) =>
  base44.entities.ReviewFollow.filter({ following_id: userId });

export const isFollowing = async (followerId, followingId) => {
  const follows = await base44.entities.ReviewFollow.filter({
    follower_id: followerId,
    following_id: followingId,
  });
  return follows.length > 0;
};

// FEED
export const getFollowingFeed = async (userId) => {
  try {
    const following = await getFollowing(userId);
    const followingIds = following.map((f) => f.following_id);

    if (followingIds.length === 0) return [];

    const allReviews = await base44.entities.Review.list("-created_date");
    return allReviews
      .filter((review) => followingIds.includes(review.creator_id))
      .slice(0, 50);
  } catch (error) {
    console.error("Feed error:", error);
    return [];
  }
};

// TOP REVIEWERS
export const getTopReviewers = async (limit = 10) => {
  try {
    const allReviews = await base44.entities.Review.list("-created_date");
    const reviewerCounts = {};

    allReviews.forEach((review) => {
      reviewerCounts[review.creator_id] = (reviewerCounts[review.creator_id] || 0) + 1;
    });

    return Object.entries(reviewerCounts)
      .map(([userId, count]) => ({ userId, reviewCount: count }))
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, limit);
  } catch (error) {
    console.error("Top reviewers error:", error);
    return [];
  }
};

// UPDATE BUSINESS STATS
export const updateBusinessStats = async (businessId) => {
  try {
    const reviews = await getBusinessReviews(businessId);
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    await updateBusiness(businessId, {
      avg_rating: parseFloat(avgRating),
      review_count: reviews.length,
    });
  } catch (error) {
    console.error("Update stats error:", error);
  }
};
