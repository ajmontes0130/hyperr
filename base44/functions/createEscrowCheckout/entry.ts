import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      return Response.json({ error: "Stripe not configured. Add STRIPE_SECRET_KEY to your secrets." }, { status: 500 });
    }

    const { payment_id, amount, currency, description } = await req.json();
    const origin = req.headers.get("origin") || "https://app.base44.com";

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[]": "card",
        mode: "payment",
        "line_items[0][price_data][currency]": (currency || "usd").toLowerCase(),
        "line_items[0][price_data][unit_amount]": String(Math.round((amount || 0) * 100)),
        "line_items[0][price_data][product_data][name]": description || "Escrow Payment",
        "line_items[0][quantity]": "1",
        "metadata[payment_id]": payment_id,
        success_url: `${origin}/cash-offers?payment_funded=true`,
        cancel_url: `${origin}/cash-offers?payment_cancelled=true`,
      }),
    });

    const session = await response.json();
    if (!response.ok) {
      return Response.json({ error: session.error?.message || "Failed to create checkout session" }, { status: 400 });
    }

    await base44.asServiceRole.entities.Payment.update(payment_id, { stripe_session_id: session.id });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});