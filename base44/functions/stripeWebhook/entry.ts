import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.text();
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const paymentId = session.metadata?.payment_id;
        if (paymentId) {
          await base44.asServiceRole.entities.Payment.update(paymentId, {
            status: "held",
            funded_date: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent,
          });
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const paymentId = charge.metadata?.payment_id;
        if (paymentId) {
          await base44.asServiceRole.entities.Payment.update(paymentId, {
            status: "refunded",
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
    return Response.json({ error: error.message }, { status: 500 });
  }
});