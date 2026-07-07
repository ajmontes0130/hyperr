import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Welcome to Hyperr</title>
</head>
<body style="margin:0; padding:0; background-color:#0d0d12; font-family:'Helvetica Neue', Arial, sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d12; padding:32px 0;">
<tr>
<td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#16161f; border-radius:16px; overflow:hidden;">

<!-- Header -->
<tr>
<td style="background: linear-gradient(135deg, #7c3aed, #ec4899); padding:40px 40px 32px 40px;" align="center">
<div style="font-size:28px; font-weight:800; color:#ffffff; letter-spacing:1px;">HYPERR</div>
<div style="font-size:15px; color:#f3e8ff; margin-top:6px;">Trade products for promotion.</div>
</td>
</tr>

<!-- Hero -->
<tr>
<td style="padding:40px 40px 8px 40px;">
<h1 style="color:#ffffff; font-size:26px; line-height:1.3; margin:0 0 16px 0;">You're in. Let's get you seen. 🚀</h1>
<p style="color:#c9c9d6; font-size:16px; line-height:1.6; margin:0;">Welcome to Hyperr — the marketplace where businesses and creators stop chasing exposure and start trading for it. No ad budget required. Just great products, great content, and a straight line between the two.</p>
</td>
</tr>

<!-- Mission -->
<tr>
<td style="padding:32px 40px 0 40px;">
<h2 style="color:#ffffff; font-size:19px; margin:0 0 12px 0;">Why we built Hyperr</h2>
<p style="color:#c9c9d6; font-size:15px; line-height:1.6; margin:0;">Early businesses can't afford big ad spend. Early creators can't land big brand deals. We built Hyperr to close that gap — a direct exchange where businesses offer products, services, or cash, and creators offer the reach, content, and audience trust that money alone can't buy. Everybody grows, nobody overpays.</p>
</td>
</tr>

<!-- Steps -->
<tr>
<td style="padding:32px 40px 0 40px;">
<h2 style="color:#ffffff; font-size:19px; margin:0 0 16px 0;">Get your account live in 3 steps</h2>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
<tr>
<td width="36" valign="top" style="color:#ec4899; font-size:18px; font-weight:800;">1</td>
<td style="color:#e4e4ec; font-size:15px; line-height:1.5;"><strong style="color:#ffffff;">Finish registration.</strong> Confirm your email and set up login at <a href="https://buildinghyperr.com/register" style="color:#f0abfc;">buildinghyperr.com/register</a>.</td>
</tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
<tr>
<td width="36" valign="top" style="color:#ec4899; font-size:18px; font-weight:800;">2</td>
<td style="color:#e4e4ec; font-size:15px; line-height:1.5;"><strong style="color:#ffffff;">Complete onboarding.</strong> Build your business or creator profile — this is what other members see first, so make it count.</td>
</tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
<tr>
<td width="36" valign="top" style="color:#ec4899; font-size:18px; font-weight:800;">3</td>
<td style="color:#e4e4ec; font-size:15px; line-height:1.5;"><strong style="color:#ffffff;">Post or browse.</strong> Businesses: create your first listing. Creators: explore the marketplace and send a proposal. Either way, you're one trade away from new exposure.</td>
</tr>
</table>

</td>
</tr>

<!-- CTA -->
<tr>
<td style="padding:24px 40px 8px 40px;" align="center">
<a href="https://buildinghyperr.com/onboarding" style="display:inline-block; background:linear-gradient(135deg, #7c3aed, #ec4899); color:#ffffff; font-size:16px; font-weight:700; text-decoration:none; padding:14px 36px; border-radius:999px;">Finish My Profile →</a>
</td>
</tr>

<!-- Benefits -->
<tr>
<td style="padding:36px 40px 0 40px;">
<h2 style="color:#ffffff; font-size:19px; margin:0 0 16px 0;">What's in it for you, early on</h2>
<p style="color:#c9c9d6; font-size:15px; line-height:1.6; margin:0 0 16px 0;">Joining now — while the marketplace and creator directory are still filling up — puts you ahead of the curve:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
<tr>
<td width="10" valign="top" style="color:#ec4899; font-size:15px;">•</td>
<td style="color:#e4e4ec; font-size:15px; line-height:1.6;"><strong style="color:#ffffff;">First-mover visibility.</strong> Fewer listings and profiles means your business or content stands out instead of getting buried in a crowded feed.</td>
</tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
<tr>
<td width="10" valign="top" style="color:#ec4899; font-size:15px;">•</td>
<td style="color:#e4e4ec; font-size:15px; line-height:1.6;"><strong style="color:#ffffff;">Built-in audience matching.</strong> The creator directory and marketplace are designed to connect you with partners actively looking to trade — no cold outreach required.</td>
</tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
<tr>
<td width="10" valign="top" style="color:#ec4899; font-size:15px;">•</td>
<td style="color:#e4e4ec; font-size:15px; line-height:1.6;"><strong style="color:#ffffff;">Zero-to-low-cost growth.</strong> Trade products or services for content and promotion instead of paying for ads — stretch a tight budget further.</td>
</tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
<tr>
<td width="10" valign="top" style="color:#ec4899; font-size:15px;">•</td>
<td style="color:#e4e4ec; font-size:15px; line-height:1.6;"><strong style="color:#ffffff;">Compounding reach.</strong> Every trade builds your track record on the platform, making it easier to land bigger partners as your profile grows.</td>
</tr>
</table>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="padding:36px 40px 40px 40px;">
<p style="color:#c9c9d6; font-size:14px; line-height:1.6; margin:0 0 8px 0;">Questions? Our team's at <a href="https://buildinghyperr.com/support" style="color:#f0abfc;">buildinghyperr.com/support</a> — happy to help you get your first trade moving.</p>
<p style="color:#8888a0; font-size:13px; margin:20px 0 0 0;">— The Hyperr Team</p>
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
    const email = payload?.email;

    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "RESEND_API_KEY secret is not set" }, { status: 500 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Hyperr <welcome@buildinghyperr.com>",
        to: [email],
        subject: "Welcome to Hyperr — Let's get you seen 🚀",
        html: WELCOME_HTML,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `Resend API error: ${errText}` }, { status: 502 });
    }

    return Response.json({ success: true, email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});