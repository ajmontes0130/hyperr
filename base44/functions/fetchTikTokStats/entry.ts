import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '6a433ba7d62fef0d62bb0256';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'You must be signed in to verify your TikTok account.' }, { status: 401 });

    let accessToken;
    try {
      const connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
      accessToken = connection.accessToken;
    } catch {
      return Response.json({ error: 'TikTok account not connected. Please click "Connect to verify" to authorize your account first.' }, { status: 400 });
    }

    if (!accessToken) {
      return Response.json({ error: 'TikTok account not connected. Please click "Connect to verify" to authorize your account first.' }, { status: 400 });
    }

    // TikTok v2 user info endpoint — requires fields as query param
    const fields = 'open_id,display_name,follower_count';
    const resp = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=${fields}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await resp.json();

    if (!resp.ok || !data?.data?.user) {
      const msg = data?.error?.message || data?.message || 'Unable to fetch your TikTok profile';
      return Response.json({ error: `TikTok API error: ${msg}. Try disconnecting and reconnecting your account.` }, { status: 502 });
    }

    const tiktokUser = data.data.user;
    return Response.json({
      handle: tiktokUser.display_name || tiktokUser.open_id,
      followers: tiktokUser.follower_count || 0,
      verified: true
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Unexpected error during TikTok verification.' }, { status: 500 });
  }
});