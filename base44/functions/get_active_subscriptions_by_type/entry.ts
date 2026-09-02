import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { subscription_type } = body;
    if (!subscription_type) return Response.json({ error: 'subscription_type is required' }, { status: 400 });

    const subs = await base44.asServiceRole.entities.Subscription.filter(
      { subscription_type, status: 'active' },
      "-created_date",
      500
    );
    return Response.json(subs);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}