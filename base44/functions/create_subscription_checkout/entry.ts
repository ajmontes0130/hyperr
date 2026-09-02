import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getPricing } from "../../shared/subscriptionPricing.ts";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to your secrets.' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const { subscription_type, billing_cycle } = body;
    if (!subscription_type) return Response.json({ error: 'subscription_type is required' }, { status: 400 });

    const pricing = getPricing(subscription_type, billing_cycle);
    if (!pricing) return Response.json({ error: 'Invalid subscription type' }, { status: 400 });

    const origin = req.headers.get('origin') || 'https://hyperr.base44.app';
    const currency = 'usd';

    const params = new URLSearchParams();
    params.set('mode', pricing.mode);
    if (user.email) params.set('customer_email', user.email);
    params.set('metadata[user_id]', user.id);
    params.set('metadata[subscription_type]', subscription_type);
    params.set('metadata[billing_cycle]', billing_cycle || 'monthly');
    params.set('success_url', `${origin}/dashboard?upgraded=true`);
    params.set('cancel_url', `${origin}/dashboard?upgraded=cancelled`);

    const productName = `hyperr ${subscription_type.replace(/_/g, ' ')}`;

    if (pricing.mode === 'subscription') {
      const interval = billing_cycle === 'annual' ? 'year' : 'month';
      params.set('line_items[0][price_data][currency]', currency);
      params.set('line_items[0][price_data][unit_amount]', String(pricing.amount));
      params.set('line_items[0][price_data][product_data][name]', `${productName} (${billing_cycle})`);
      params.set('line_items[0][price_data][recurring][interval]', interval);
      params.set('line_items[0][quantity]', '1');
    } else {
      params.set('line_items[0][price_data][currency]', currency);
      params.set('line_items[0][price_data][unit_amount]', String(pricing.amount));
      params.set('line_items[0][price_data][product_data][name]', productName);
      params.set('line_items[0][quantity]', '1');
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await response.json();
    if (!response.ok) {
      console.error('Stripe checkout error:', session.error?.message);
      return Response.json({ error: 'Failed to create checkout session' }, { status: 400 });
    }

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('create_subscription_checkout error:', error.message);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}