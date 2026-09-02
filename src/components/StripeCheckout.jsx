import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";

/**
 * Stripe Checkout button for subscriptions.
 * Calls the create_subscription_checkout backend function, which builds a
 * Stripe Checkout session server-side and returns a hosted URL to redirect to.
 * No client-side Stripe.js or public key required.
 *
 * Props:
 *  - subscriptionType: 'creator_pro' | 'business_pro' | 'creator_verification'
 *  - billingCycle: 'monthly' | 'annual'  (ignored for creator_verification)
 *  - label: button text
 */
export default function StripeCheckout({
  subscriptionType,
  billingCycle = "monthly",
  label = "Upgrade Now",
  className = "",
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("create_subscription_checkout", {
        subscription_type: subscriptionType,
        billing_cycle: billingCycle,
      });
      if (res?.url) {
        window.location.href = res.url;
        return; // page navigates away
      }
      throw new Error(res?.error || "No checkout URL returned");
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: "Could not start checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? "Processing..." : label}
    </button>
  );
}