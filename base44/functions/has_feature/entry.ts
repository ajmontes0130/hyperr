import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getActiveSubscription, getFeatures } from "../../shared/subscriptionUtils.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.user_id || user.id;
    const feature_name = body.feature_name;
    if (!feature_name) return Response.json({ error: 'feature_name is required' }, { status: 400 });

    const isAdmin = user.role === 'admin';
    if (targetUserId !== user.id && !isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const sub = await getActiveSubscription(base44, targetUserId);
    const features = getFeatures(sub);
    return Response.json({ has_feature: features.includes(feature_name) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}