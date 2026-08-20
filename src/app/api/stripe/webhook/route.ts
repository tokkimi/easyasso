import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { planFor } from '@/lib/plans';
import { activateOrganization } from '@/lib/activation';

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ ok: true, demo: true });

  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();

  let event;
  try {
    event = secret && sig ? stripe.webhooks.constructEvent(raw, sig, secret) : JSON.parse(raw);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const orgId = session.metadata?.organizationId || session.client_reference_id;
    const plan = planFor(session.metadata?.plan);
    const correctAmount = session.amount_total === plan.amountEur * 100 && session.currency === 'eur';
    if (orgId && session.payment_status === 'paid' && correctAmount) await activateOrganization(orgId, session.id);
  }

  return NextResponse.json({ received: true });
}
