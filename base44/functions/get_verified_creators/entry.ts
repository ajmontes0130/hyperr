import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 50;
    const offset = body.offset || 0;

    const users = await base44.asServiceRole.entities.User.filter(
      { is_verified_creator: true },
      "-created_date",
      500
    );
    return Response.json(users.slice(offset, offset + limit));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}