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
  Bronze:   { color: "text-[#D08B5A]",  bg: "bg-[#3A1F0C]/30",  border: "border-[#D08B5A]/40",  badgeClass: "tier-bronze",   icon: "🥉", range: "$50–$200",    min: 0,       max: 9_999 },
  Silver:   { color: "text-[#A9B4C0]",  bg: "bg-[#1F2630]/40",  border: "border-[#A9B4C0]/40",  badgeClass: "tier-silver",   icon: "🥈", range: "$200–$800",   min: 10_000,  max: 49_999 },
  Gold:     { color: "text-[#FBBF3D]",  bg: "bg-[#412402]/30",  border: "border-[#FBBF3D]/40",  badgeClass: "tier-gold",     icon: "🥇", range: "$800–$3K",    min: 50_000,  max: 249_999 },
  Platinum: { color: "text-[#D8E2EC]",  bg: "bg-[#2A3340]/40",  border: "border-[#D8E2EC]/40",  badgeClass: "tier-platinum", icon: "💎", range: "$3K–$15K",   min: 250_000, max: 999_999 },
  Diamond:  { color: "text-[#8FEFFF]",  bg: "bg-[#06303B]/40",  border: "border-[#8FEFFF]/40",  badgeClass: "tier-diamond",  icon: "👑", range: "$15K+",      min: 1_000_000, max: Infinity },
};

export function formatFollowers(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
}