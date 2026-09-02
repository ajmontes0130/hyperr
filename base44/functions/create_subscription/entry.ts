import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { setUserSubscriptionFields } from "../../shared/subscriptionUtils.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { subscription_type, billing_cycle, stripe_subscription_id, stripe_customer_id, price_monthly, price_annual, features_unlocked } = body;
    if (!subscription_type) return Response.json({ error: 'subscription_type is required' }, { status: 400 });

    const targetUserId = body.user_id || user.id;
    const isAdmin = user.role === 'admin';
    if (targetUserId !== user.id && !isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const now = new Date().toISOString();
    const sub = await base44.asServiceRole.entities.Subscription.create({
      user_id: targetUserId,
      subscription_type,
      status: 'active',
      tier_level: 'pro',
      stripe_customer_id: stripe_customer_id || '',
      stripe_subscription_id: stripe_subscription_id || '',
      billing_cycle: billing_cycle || 'monthly',
      price_monthly: price_monthly || 0,
      price_annual: price_annual || 0,
      activated_date: now,
      pro_since: now,
      verification_status: subscription_type === 'creator_verification' ? 'pending' : 'none',
      features_unlocked: features_unlocked || [],
    });

    const newStatus = subscription_type === 'creator_verification' ? 'verified' : 'pro';
    await setUserSubscriptionFields(base44, user.id, targetUserId, {
      subscription_status: newStatus,
      subscription_id: sub.id,
      pro_features: sub.features_unlocked || [],
      verification_status: subscription_type === 'creator_verification' ? 'pending' : 'none',
    });

    await base44.asServiceRole.entities.BillingEvent.create({
      user_id: targetUserId,
      subscription_id: sub.id,
      event_type: 'subscription_created',
      amount: billing_cycle === 'annual' ? (price_annual || 0) : (price_monthly || 0),
      currency: 'USD',
      stripe_event_id: stripe_subscription_id || '',
      details: JSON.stringify({ subscription_type, billing_cycle }),
    });

    return Response.json(sub);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}