import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { setUserSubscriptionFields } from "../../shared/subscriptionUtils.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { subscription_id, new_status, stripe_event_id } = body;
    if (!subscription_id || !new_status) return Response.json({ error: 'subscription_id and new_status are required' }, { status: 400 });

    const sub = await base44.asServiceRole.entities.Subscription.get(subscription_id);
    if (!sub) return Response.json({ error: 'Subscription not found' }, { status: 404 });

    const now = new Date().toISOString();
    const updateFields = { status: new_status };
    if (new_status === 'canceled') updateFields.canceled_date = now;
    if (new_status === 'expired') updateFields.expires_date = now;
    const updated = await base44.asServiceRole.entities.Subscription.update(subscription_id, updateFields);

    let eventType = 'subscription_renewed';
    if (new_status === 'payment_failed') eventType = 'payment_failed';
    else if (new_status === 'active') eventType = 'payment_succeeded';
    else if (new_status === 'canceled') eventType = 'subscription_canceled';

    await base44.asServiceRole.entities.BillingEvent.create({
      user_id: sub.user_id,
      subscription_id,
      event_type: eventType,
      amount: 0,
      currency: 'USD',
      stripe_event_id: stripe_event_id || '',
      details: JSON.stringify({ new_status }),
    });

    if (['canceled', 'expired', 'payment_failed'].includes(new_status)) {
      await setUserSubscriptionFields(base44, user.id, sub.user_id, { subscription_status: 'free', pro_features: [] });
    } else if (new_status === 'active') {
      await setUserSubscriptionFields(base44, user.id, sub.user_id, { subscription_status: 'pro', pro_features: sub.features_unlocked || [] });
    }

    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}