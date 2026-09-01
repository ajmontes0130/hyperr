import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const business_id = body.business_id;
    if (!business_id) return Response.json({ error: 'business_id is required' }, { status: 400 });

    const reviews = await base44.entities.Review.filter({ business_id }, '-created_date', 200);
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(2))
      : 0;

    return Response.json({ reviews, averageRating, totalReviews });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}