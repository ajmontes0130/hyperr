import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const subs = await base44.asServiceRole.entities.Subscription.filter(
      { subscription_type: 'business_pro', status: 'active' },
      "-created_date",
      500
    );
    const users = [];
    for (const s of subs) {
      try {
        const u = await base44.asServiceRole.entities.User.get(s.user_id);
        if (u) users.push(u);
      } catch { /* skip */ }
    }
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}