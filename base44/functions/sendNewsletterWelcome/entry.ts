import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Welcome to Hyperr</title>
</head>
<body style="margin:0; padding:0; background-color:#0A0E14; font-family:'Inter', Arial, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0E14; padding:32px 0;">
<tr>
<td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#121823; border-radius:16px; overflow:hidden;">

<!-- Header -->
<tr>
<td style="background: linear-gradient(135deg, #2DD4FF, #1B2330); padding:40px 40px 32px 40px;" align="center">
<div style="font-size:28px; font-weight:800; color:#2DD4FF; letter-spacing:-0.04em;">hyperr</div>
<div style="font-size:15px; color:#8C97A3; margin-top:6px;">Trade products for promotion.</div>
</td>
</tr>

<!-- Hero -->
<tr>
<td style="padding:40px 40px 8px 40px;">
<h1 style="color:#EAF1F7; font-size:26px; line-height:1.3; margin:0 0 16px 0;">You're in. Let's get you seen.</h1>
<p style="color:#8C97A3; font-size:16px; line-height:1.6; margin:0;">Welcome to hyperr — the marketplace where businesses and creators stop chasing exposure and start trading for it. No ad budget required. Just great products, great content, and a straight line between the two.</p>
</td>
</tr>

<!-- Steps -->
<tr>
<td style="padding:32px 40px 0 40px;">
<h2 style="color:#EAF1F7; font-size:19px; margin:0 0 16px 0;">Get your account live in 3 steps</h2>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
<tr>
<td width="36" valign="top" style="color:#2DD4FF; font-size:18px; font-weight:800;">1</td>
<td style="color:#EAF1F7; font-size:15px; line-height:1.5;"><strong style="color:#2DD4FF;">Finish registration.</strong> Confirm your email and set up login at <a href="https://hyperr.base44.app/register" style="color:#2DD4FF;">hyperr.base44.app/register</a>.</td>
</tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
<tr>
<td width="36" valign="top" style="color:#2DD4FF; font-size:18px; font-weight:800;">2</td>
<td style="color:#EAF1F7; font-size:15px; line-height:1.5;"><strong style="color:#2DD4FF;">Complete onboarding.</strong> Build your business or creator profile — this is what other members see first, so make it count.</td>
</tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
<tr>
<td width="36" valign="top" style="color:#2DD4FF; font-size:18px; font-weight:800;">3</td>
<td style="color:#EAF1F7; font-size:15px; line-height:1.5;"><strong style="color:#2DD4FF;">Post or browse.</strong> Businesses: create your first listing. Creators: explore the marketplace and send a proposal. Either way, you're one trade away from new exposure.</td>
</tr>
</table>

</td>
</tr>

<!-- CTA -->
<tr>
<td style="padding:24px 40px 8px 40px;" align="center">
<a href="https://hyperr.base44.app/onboarding" style="display:inline-block; background:#2DD4FF; color:#06303B; font-size:16px; font-weight:700; text-decoration:none; padding:14px 36px; border-radius:11px;">Finish My Profile →</a>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:36px 40px 40px 40px;">
<p style="color:#8C97A3; font-size:14px; line-height:1.6; margin:0 0 8px 0;">Questions? Our team's at <a href="https://hyperr.base44.app/support" style="color:#2DD4FF;">hyperr.base44.app/support</a> — happy to help you get your first trade moving.</p>
<p style="color:#5C6672; font-size:13px; margin:20px 0 0 0;">— The hyperr Team</p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const email = payload?.email?.trim()?.toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Basic rate limiting via the request IP — max 3 signups per IP per minute
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (clientIp !== 'unknown') {
      const now = Date.now();
      const key = `nl:${clientIp}`;
      const stored = (globalThis as any)[key];
      if (stored && now - stored.time < 60000 && stored.count >= 3) {
        return Response.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 });
      }
      (globalThis as any)[key] = { time: now, count: (stored?.count || 0) + 1 };
    }

    // Save subscriber to the Newsletter entity using service-role (no auth required)
    try {
      await base44.asServiceRole.entities.Newsletter.create({ email });
    } catch (e) {
      console.error('Failed to save newsletter subscriber:', e.message || e);
    }

    // Send welcome email via Resend
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Email service not configured. Please try again later.' }, { status: 500 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'hyperr <welcome@hyperr.base44.app>',
        to: [email],
        subject: "Welcome to hyperr — Let's get you seen",
        html: WELCOME_HTML,
      }),
    });

    if (!res.ok) {
      console.error('Resend API error:', await res.text());
      return Response.json({ error: 'Unable to send welcome email. Please try again later.' }, { status: 502 });
    }

    return Response.json({ success: true, email });
  } catch (error) {
    console.error('sendNewsletterWelcome error:', error.message);
    return Response.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
});