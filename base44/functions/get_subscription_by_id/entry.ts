import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { subscription_id } = body;
    if (!subscription_id) return Response.json({ error: 'subscription_id is required' }, { status: 400 });

    const sub = await base44.asServiceRole.entities.Subscription.get(subscription_id);
    if (!sub) return Response.json({ error: 'Subscription not found' }, { status: 404 });

    const isAdmin = user.role === 'admin';
    if (sub.user_id !== user.id && !isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    return Response.json(sub);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}