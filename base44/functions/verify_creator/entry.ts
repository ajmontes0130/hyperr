import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { setUserSubscriptionFields } from "../../shared/subscriptionUtils.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { subscription_id, approved, admin_notes } = body;
    if (!subscription_id) return Response.json({ error: 'subscription_id is required' }, { status: 400 });

    const sub = await base44.asServiceRole.entities.Subscription.get(subscription_id);
    if (!sub) return Response.json({ error: 'Subscription not found' }, { status: 404 });

    const now = new Date().toISOString();

    if (approved) {
      const features = Array.isArray(sub.features_unlocked) ? [...sub.features_unlocked] : [];
      if (!features.includes('verified_badge')) features.push('verified_badge');
      const updated = await base44.asServiceRole.entities.Subscription.update(subscription_id, {
        is_verified: true,
        verified_date: now,
        verification_status: 'approved',
        verification_notes: admin_notes || '',
        features_unlocked: features,
      });
      await setUserSubscriptionFields(base44, user.id, sub.user_id, {
        is_verified_creator: true,
        verification_status: 'approved',
        subscription_status: 'verified',
        pro_features: features,
      });
      await base44.asServiceRole.entities.BillingEvent.create({
        user_id: sub.user_id,
        subscription_id,
        event_type: 'verification_approved',
        amount: 0,
        currency: 'USD',
        details: JSON.stringify({ admin_notes: admin_notes || '' }),
      });
      return Response.json(updated);
    } else {
      const updated = await base44.asServiceRole.entities.Subscription.update(subscription_id, {
        verification_status: 'rejected',
        verification_notes: admin_notes || '',
      });
      await setUserSubscriptionFields(base44, user.id, sub.user_id, { verification_status: 'rejected' });
      return Response.json(updated);
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}