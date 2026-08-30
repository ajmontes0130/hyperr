import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to your secrets.' }, { status: 500 });
    }

    const { payment_id } = await req.json();
    if (!payment_id) {
      return Response.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    // Fetch the payment from the DB — never trust client-sent amounts
    const payment = await base44.asServiceRole.entities.Payment.get(payment_id);
    if (!payment) return Response.json({ error: 'Payment not found' }, { status: 404 });

    // Verify the authenticated user is the business owner of this payment
    if (payment.business_user_id !== user.id) {
      return Response.json({ error: 'Unauthorized — you can only fund your own payments' }, { status: 403 });
    }

    // Only allow funding payments that are in the unfunded state
    if (payment.status !== 'unfunded') {
      return Response.json({ error: 'This payment cannot be funded in its current state' }, { status: 400 });
    }

    // Use the DB-stored amount, not a client-provided value
    const amount = payment.amount;
    const currency = payment.currency || 'usd';
    const description = `Escrow payment to ${payment.creator_name || 'creator'}`;
    const origin = req.headers.get('origin') || 'https://hyperr.base44.app';

    // 3% service fee charged to the business; creator receives the original amount
    const serviceFeeRate = 0.03;
    const totalAmount = Math.round(amount * (1 + serviceFeeRate) * 100); // in cents

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        mode: 'payment',
        'line_items[0][price_data][currency]': currency.toLowerCase(),
        'line_items[0][price_data][unit_amount]': String(totalAmount),
        'line_items[0][price_data][product_data][name]': description,
        'line_items[0][price_data][product_data][description]': 'Includes 3% platform service fee',
        'line_items[0][quantity]': '1',
        'metadata[payment_id]': payment_id,
        success_url: `${origin}/cash-offers?payment_funded=true`,
        cancel_url: `${origin}/cash-offers?payment_cancelled=true`,
      }),
    });

    const session = await response.json();
    if (!response.ok) {
      console.error('Stripe checkout error:', session.error?.message);
      return Response.json({ error: 'Failed to create checkout session' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Payment.update(payment_id, { stripe_session_id: session.id });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createEscrowCheckout error:', error.message);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
});