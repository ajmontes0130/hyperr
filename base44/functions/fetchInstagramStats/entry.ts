import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CONNECTOR_ID = '6a433bbd75c6d3c50aecbe4d';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'You must be signed in to verify your Instagram account.' }, { status: 401 });

    let accessToken;
    try {
      const connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
      accessToken = connection.accessToken;
    } catch {
      return Response.json({ error: 'Instagram account not connected. Please click "Connect to verify" to authorize your account first.' }, { status: 400 });
    }

    if (!accessToken) {
      return Response.json({ error: 'Instagram account not connected. Please click "Connect to verify" to authorize your account first.' }, { status: 400 });
    }

    // Get user profile — graph.instagram.com per connector usage guide
    // Request followers_count directly on the /me endpoint (works with instagram_business_basic scope)
    const profileResp = await fetch(`https://graph.instagram.com/me?fields=id,username,followers_count&access_token=${accessToken}`);
    const profileData = await profileResp.json();

    if (!profileData.id) {
      const msg = profileData.error?.message || 'Unable to fetch your Instagram profile';
      return Response.json({ error: `Instagram API error: ${msg}. Try disconnecting and reconnecting your account.` }, { status: 502 });
    }

    // If followers_count came back on /me, use it directly
    if (profileData.followers_count !== undefined) {
      return Response.json({
        handle: profileData.username || profileData.id,
        followers: profileData.followers_count || 0,
        verified: true
      });
    }

    // Fallback: fetch via the user-id endpoint
    const statsResp = await fetch(`https://graph.instagram.com/${profileData.id}?fields=username,followers_count&access_token=${accessToken}`);
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