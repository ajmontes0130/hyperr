import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a433bbd75c6d3c50aecbe4d');
    
    // Get user ID first
    const meResp = await fetch('https://graph.instagram.com/me?fields=id,username&access_token=' + accessToken);
    const meData = await meResp.json();
    if (!meData.id) throw new Error('Failed to fetch Instagram ID');

    // Get followers count
    const statsResp = await fetch(`https://graph.instagram.com/${meData.id}?fields=username,followers_count&access_token=${accessToken}`);
    const statsData = await statsResp.json();
    
    return Response.json({
      handle: statsData.username,
      followers: statsData.followers_count || 0,
      verified: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});