// Shared helpers used by subscription backend functions.

export async function getActiveSubscription(base44, userId) {
  const subs = await base44.asServiceRole.entities.Subscription.filter(
    { user_id: userId, status: "active" },
    "-created_date",
    10
  );
  return (subs && subs.length) ? subs[0] : null;
}

export function getFeatures(sub) {
  return (sub && Array.isArray(sub.features_unlocked)) ? sub.features_unlocked : [];
}

export async function setUserSubscriptionFields(base44, currentUserId, targetUserId, fields) {
  if (targetUserId === currentUserId) {
    return await base44.auth.updateMe(fields);
  }
  return await base44.asServiceRole.entities.User.update(targetUserId, fields);
}