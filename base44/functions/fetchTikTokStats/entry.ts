import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a433ba7d62fef0d62bb0256');
    
    const resp = await fetch('https://open.tiktokapis.com/v1/user/info/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await resp.json();
    
    if (!data.data) throw new Error('Failed to fetch TikTok stats');
    
    return Response.json({
      handle: data.data.user.username,
      followers: data.data.user.follower_count || 0,
      verified: true
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});