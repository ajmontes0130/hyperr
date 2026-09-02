// Central pricing + feature config for subscription checkout and webhook.
// Edit amounts here — both create_subscription_checkout and stripeWebhook read from this.

export const SUBSCRIPTION_PRICING = {
  creator_pro: {
    monthly: 900,   // $9.00 in cents
    annual: 7900,   // $79.00 in cents
    features: ["featured_profile", "advanced_analytics", "priority_support", "direct_outreach"],
  },
  business_pro: {
    monthly: 2900,  // $29.00
    annual: 29000,  // $290.00
    features: ["featured_profile", "advanced_analytics", "priority_support", "direct_outreach"],
  },
  creator_verification: {
    one_time: 4900, // $49.00 one-time
    features: ["verified_badge", "no_platform_fees"],
  },
};

export function getPricing(subscriptionType: string, billingCycle?: string) {
  const config = SUBSCRIPTION_PRICING[subscriptionType];
  if (!config) return null;
  if (subscriptionType === "creator_verification") {
    return { amount: config.one_time, features: config.features, mode: "payment" as const };
  }
  const amount = billingCycle === "annual" ? config.annual : config.monthly;
  return { amount, features: config.features, mode: "subscription" as const };
}