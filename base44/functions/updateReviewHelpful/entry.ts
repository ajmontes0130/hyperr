import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const review_id = body.review_id;
    if (!review_id) return Response.json({ error: 'review_id is required' }, { status: 400 });

    // Any authenticated user can mark a review helpful — service role bypasses update RLS.
    await base44.asServiceRole.entities.Review.updateMany({ id: review_id }, { $inc: { helpful_count: 1 } });
    const updated = await base44.entities.Review.get(review_id);

    return Response.json({ helpful_count: updated.helpful_count || 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}