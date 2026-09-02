import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const all = await base44.asServiceRole.entities.Subscription.list("-created_date", 500);
    const active = all.filter(s => s.status === 'active');
    const activeCreatorPro = active.filter(s => s.subscription_type === 'creator_pro').length;
    const activeBusinessPro = active.filter(s => s.subscription_type === 'business_pro').length;
    const verifiedCreators = active.filter(s => s.is_verified === true).length;

    let mrr = 0;
    active.forEach(s => {
      const price = s.billing_cycle === 'annual' ? (s.price_annual || 0) / 12 : (s.price_monthly || 0);
      mrr += price;
    });
    const arr = mrr * 12;

    const total = all.length;
    const canceled = all.filter(s => s.status === 'canceled').length;
    const churnRate = total > 0 ? Number(((canceled / total) * 100).toFixed(2)) : 0;

    return Response.json({
      total_subscriptions: total,
      active_creator_pro: activeCreatorPro,
      active_business_pro: activeBusinessPro,
      verified_creators: verifiedCreators,
      total_mrr: Number(mrr.toFixed(2)),
      total_arr: Number(arr.toFixed(2)),
      churn_rate: churnRate,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}