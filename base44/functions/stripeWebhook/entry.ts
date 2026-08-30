import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Stripe signature verification using Web Crypto API (timing-safe)
async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300
): Promise<boolean> {
  const parts = signatureHeader.split(',');
  const timestampStr = parts.find((p) => p.startsWith('t='))?.split('=')[1];
  const v1Signature = parts.find((p) => p.startsWith('v1='))?.split('=')[1];
  if (!timestampStr || !v1Signature) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Replay protection — reject events older than tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedHex = Array.from(new Uint8Array(expectedSig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Timing-safe comparison
  if (expectedHex.length !== v1Signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    diff |= expectedHex.charCodeAt(i) ^ v1Signature.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured — webhook cannot verify events.');
      return Response.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const signature = req.headers.get('Stripe-Signature');
    if (!signature) {
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await req.text();

    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const base44 = createClientFromRequest(req);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const paymentId = session.metadata?.payment_id;
        if (paymentId) {
          await base44.asServiceRole.entities.Payment.update(paymentId, {
            status: 'held',
            funded_date: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent,
          });
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentId = charge.metadata?.payment_id;
        if (paymentId) {
          await base44.asServiceRole.entities.Payment.update(paymentId, {
            status: 'refunded',
            refunded_date: new Date().toISOString(),
          });
        }
        break;
      }
      default:
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
});