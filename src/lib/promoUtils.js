const PROMO_UNITS = {
  "Instagram Post": "posts",
  "Instagram Reel": "reels",
  "TikTok Video": "videos",
  "YouTube Video": "videos",
  "Blog Post": "blog posts",
  "Podcast Mention": "mentions",
  "Twitter/X Post": "posts",
  "Newsletter Feature": "features",
  "Event Appearance": "appearances",
};

/**
 * Returns the display label for a promotion requirement.
 * Uses custom_label when the type is "Other".
 */
export function getPromoLabel(req) {
  if (req.type === "Other" && req.custom_label?.trim()) return req.custom_label.trim();
  return req.type;
}

/**
 * Formats quantity with unit noun when known (e.g. "10× posts").
 * For "Other" types without a known unit, returns just "×10".
 */
export function formatPromoQuantity(req) {
  const qty = req.quantity || 1;
  const unit = PROMO_UNITS[req.type];
  if (unit) return `${qty}× ${unit}`;
  return `×${qty}`;
}

/**
 * Returns display labels for a listing's wanted_promotion_type array,
 * substituting custom_label when the type is "Other".
 */
export function getPromoTypesForDisplay(listing) {
  const types = listing.wanted_promotion_type || [];
  const reqs = listing.promotion_requirements || [];
  return types.map((type) => {
    if (type === "Other") {
      const req = reqs.find((r) => r.type === "Other");
      if (req?.custom_label?.trim()) return req.custom_label.trim();
    }
    return type;
  });
}