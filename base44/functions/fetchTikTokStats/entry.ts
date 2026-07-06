import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'You must be signed in to verify your TikTok account.' }, { status: 401 });

    let accessToken;
    try {
      const connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a433ba7d62fef0d62bb0256');
      accessToken = connection.accessToken;
    } catch {
      return Response.json({ error: 'TikTok account not connected. Please complete the authorization flow and try again.' }, { status: 400 });
    }

    if (!accessToken) {
      return Response.json({ error: 'TikTok account not connected. Please complete the authorization flow and try again.' }, { status: 400 });
    }

    const resp = await fetch('https://open.tiktokapis.com/v1/user/info/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await resp.json();

    if (!resp.ok || !data.data) {
      const msg = data.error?.message || data.message || 'Unable to fetch your TikTok profile';
      return Response.json({ error: `TikTok API error: ${msg}. Try disconnecting and reconnecting your account.` }, { status: 502 });
    }

    return Response.json({
      handle: data.data.user.username,
      followers: data.data.user.follower_count || 0,
      verified: true
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Unexpected error during TikTok verification.' }, { status: 500 });
  }
});