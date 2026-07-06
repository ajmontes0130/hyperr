import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'You must be signed in to verify your Instagram account.' }, { status: 401 });

    let accessToken;
    try {
      const connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a433bbd75c6d3c50aecbe4d');
      accessToken = connection.accessToken;
    } catch {
      return Response.json({ error: 'Instagram account not connected. Please complete the authorization flow and try again.' }, { status: 400 });
    }

    if (!accessToken) {
      return Response.json({ error: 'Instagram account not connected. Please complete the authorization flow and try again.' }, { status: 400 });
    }

    // Get user ID first
    const meResp = await fetch('https://graph.instagram.com/me?fields=id,username&access_token=' + accessToken);
    const meData = await meResp.json();
    if (!meData.id) {
      const msg = meData.error?.message || 'Unable to fetch your Instagram profile';
      return Response.json({ error: `Instagram API error: ${msg}. Try disconnecting and reconnecting your account.` }, { status: 502 });
    }

    // Get followers count
    const statsResp = await fetch(`https://graph.instagram.com/${meData.id}?fields=username,followers_count&access_token=${accessToken}`);
    const statsData = await statsResp.json();
    if (!statsData.username) {
      const msg = statsData.error?.message || 'Unable to fetch your Instagram stats';
      return Response.json({ error: `Instagram API error: ${msg}. Try disconnecting and reconnecting your account.` }, { status: 502 });
    }

    return Response.json({
      handle: statsData.username,
      followers: statsData.followers_count || 0,
      verified: true
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Unexpected error during Instagram verification.' }, { status: 500 });
  }
});