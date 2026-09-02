import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 50;
    const offset = body.offset || 0;

    const subs = await base44.asServiceRole.entities.Subscription.filter(
      { status: 'active' },
      "-pro_since",
      500
    );
    const featuredSubs = subs.filter(s => Array.isArray(s.features_unlocked) && s.features_unlocked.includes('featured_profile'));
    const paged = featuredSubs.slice(offset, offset + limit);

    const users = [];
    for (const s of paged) {
      try {
        const u = await base44.asServiceRole.entities.User.get(s.user_id);
        if (u) users.push(u);
      } catch { /* skip missing user */ }
    }
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}