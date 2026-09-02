import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.user_id || user.id;
    const limit = body.limit || 50;
    const isAdmin = user.role === 'admin';
    if (targetUserId !== user.id && !isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const events = await base44.asServiceRole.entities.BillingEvent.filter(
      { user_id: targetUserId },
      "-created_date",
      limit
    );
    return Response.json(events);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}