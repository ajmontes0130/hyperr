import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Stripe not configured.' }, { status: 500 });
    }

    const { payment_id } = await req.json();
    if (!payment_id) {
      return Response.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const payment = await base44.asServiceRole.entities.Payment.get(payment_id);
    if (!payment) return Response.json({ error: 'Payment not found' }, { status: 404 });

    // Only the business owner who funded the escrow or an admin may release funds
    if (payment.business_user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized — only the business owner can release funds' }, { status: 403 });
    }

    if (payment.status !== 'delivered') {
      return Response.json({ error: 'Can only release funds after delivery is confirmed' }, { status: 400 });
    }

    // Look up creator's Stripe Connect account
    let stripeAccountId = null;
    if (payment.creator_profile_id) {
      const creator = await base44.asServiceRole.entities.CreatorProfile.get(payment.creator_profile_id);
      stripeAccountId = creator?.stripe_account_id;
    }

    if (!stripeAccountId) {
      return Response.json({ error: 'Creator has not connected a Stripe account for payouts' }, { status: 400 });
    }

    const response = await fetch('https://api.stripe.com/v1/transfers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // Creator receives the original agreed amount (3% fee was collected on top from the business)
      body: new URLSearchParams({
        amount: String(Math.round((payment.amount || 0) * 100)),
        currency: (payment.currency || 'usd').toLowerCase(),
        destination: stripeAccountId,
        'metadata[payment_id]': payment_id,
      }),
    });

    const transfer = await response.json();
    if (!response.ok) {
      console.error('Stripe transfer error:', transfer.error?.message);
      return Response.json({ error: 'Transfer failed' }, { status: 400 });
    }

    // Mark payment as released
    await base44.asServiceRole.entities.Payment.update(payment_id, {
      status: 'released',
      stripe_transfer_id: transfer.id,
      released_date: new Date().toISOString(),
    });

    // Notify platform owner via email
    const adminEmail = Deno.env.get('ADMIN_EMAIL');
    if (adminEmail) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `💸 Payment Released — ${payment.creator_name}`,
        body: `A payment has been released to a creator.\n\nCreator: ${payment.creator_name}\nBusiness: ${payment.business_name}\nAmount: $${payment.amount} ${payment.currency?.toUpperCase() || 'USD'}\nPlatform: ${payment.platform}\nTransfer ID: ${transfer.id}\nPayment ID: ${payment_id}`,
      });
    }

    return Response.json({ transfer_id: transfer.id });
  } catch (error) {
    console.error('releaseEscrowFunds error:', error.message);
    return Response.json({ error: 'Failed to release funds' }, { status: 500 });
  }
});