export function calcTotalReach(profile) {
  return (
    (profile.instagram_followers || 0) +
    (profile.tiktok_followers || 0) +
    (profile.youtube_subscribers || 0) +
    (profile.twitter_followers || 0)
  );
}

export function calcLevel(totalReach) {
  if (totalReach >= 1_000_000) return "Diamond";
  if (totalReach >= 250_000)  return "Platinum";
  if (totalReach >= 50_000)   return "Gold";
  if (totalReach >= 10_000)   return "Silver";
  return "Bronze";
}

export const levelConfig = {
  Bronze:   { color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   icon: "🥉", range: "$50–$200",    min: 0,       max: 9_999 },
  Silver:   { color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200",   icon: "🥈", range: "$200–$800",   min: 10_000,  max: 49_999 },
  Gold:     { color: "text-yellow-600",  bg: "bg-yellow-50",  border: "border-yellow-200",  icon: "🥇", range: "$800–$3K",    min: 50_000,  max: 249_999 },
  Platinum: { color: "text-purple-700",  bg: "bg-purple-50",  border: "border-purple-200",  icon: "💎", range: "$3K–$15K",   min: 250_000, max: 999_999 },
  Diamond:  { color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    icon: "👑", range: "$15K+",      min: 1_000_000, max: Infinity },
};

export function formatFollowers(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
}