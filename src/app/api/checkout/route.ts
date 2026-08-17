import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/session';
import { stripe, isDemoMode, PRICE_EUR } from '@/lib/stripe';
import { activateOrganization } from '@/lib/activation';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const ctx = await requireOrg();
  const org = ctx.organization!;
  if (org.planStatus === 'ACTIVE') {
    return NextResponse.json({ url: '/dashboard' });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Explicit local/demo mode only: skip real payment.
  if (isDemoMode) {
    await activateOrganization(org.id);
    return NextResponse.json({ url: '/onboarding/success?demo=1' });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: 'Le paiement sécurisé est momentanément indisponible. Aucun débit n’a été effectué.' },
      { status: 503 }
    );
  }

  await prisma.organization.update({ where: { id: org.id }, data: { planStatus: 'PENDING_PAYMENT' } });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: ctx.user.email,
    client_reference_id: org.id,
    line_items: process.env.STRIPE_PRICE_ID
      ? [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }]
      : [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: PRICE_EUR * 100,
              product_data: { name: 'Easy Asso — Création du site de votre association' },
            },
          },
        ],
    success_url: `${appUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/onboarding?canceled=1`,
    metadata: { organizationId: org.id },
  });

  return NextResponse.json({ url: session.url });
}
