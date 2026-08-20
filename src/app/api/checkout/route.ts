import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/session';
import { stripe, isDemoMode } from '@/lib/stripe';
import { activateOrganization } from '@/lib/activation';
import { prisma } from '@/lib/prisma';
import { planAccess } from '@/lib/plan';
import { planFor } from '@/lib/plans';
import { airwallexClientEnvironment, airwallexConfigured, createAirwallexPaymentIntent, createAirwallexPaymentLink } from '@/lib/airwallex';

function paymentProviderMessage(raw: string) {
  const value = raw.toLowerCase();
  if (value.includes('insufficient permission') || value.includes('configuration_error')) {
    return 'Le paiement EasyAsso est branché, mais Airwallex refuse la création de la page de paiement. Le compte Airwallex doit avoir le produit Payments activé et autorisé pour accepter les cartes en ligne. Aucun abonnement n’est activé et aucun débit n’a été effectué.';
  }
  return `Airwallex refuse la création du paiement : ${raw}. Aucun débit n’a été effectué.`;
}

export async function POST(req: Request) {
  const ctx = await requireOrg();
  const org = ctx.organization!;
  if (org.planStatus === 'ACTIVE') {
    return NextResponse.json({ url: '/dashboard' });
  }
  const body = await req.json().catch(() => ({}));
  const plan = planFor(body?.plan);
  const priceEur = plan.amountEur;
  const nextUnpaidStatus = planAccess(org).hasAccess ? org.planStatus : 'PENDING_PAYMENT';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Explicit local/demo mode only: skip real payment.
  if (isDemoMode) {
    await activateOrganization(org.id);
    return NextResponse.json({ url: '/onboarding/success?demo=1' });
  }

  // Preferred card processor: Stripe. When a Stripe key is configured, cards go
  // through Stripe Checkout (hosted, PCI-compliant).
  if (stripe) {
    await prisma.organization.update({ where: { id: org.id }, data: { planStatus: nextUnpaidStatus, profile: { ...(org.profile as any || {}), plan: plan.id } } });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: ctx.user.email,
      client_reference_id: org.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: priceEur * 100,
            product_data: { name: `Easy Asso — ${plan.id === 'annual' ? 'abonnement annuel' : 'accès à vie'} du site de votre association` },
          },
        },
      ],
      success_url: `${appUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/onboarding?canceled=1`,
      metadata: { organizationId: org.id, plan: plan.id },
    });

    return NextResponse.json({ url: session.url });
  }

  // Fallback card processor when Stripe is not configured.
  let airwallexError = '';
  if (airwallexConfigured) {
    try {
      const payment = await createAirwallexPaymentLink({ organizationId: org.id, organizationName: org.name, amount: priceEur });
      await prisma.organization.update({
        where: { id: org.id },
        data: { planStatus: nextUnpaidStatus, airwallexPaymentLinkId: payment.id, profile: { ...(org.profile as any || {}), plan: plan.id } },
      });
      return NextResponse.json({ url: payment.url });
    } catch (error: any) {
      airwallexError = error?.message || 'Payment Link Airwallex indisponible';
      console.error('Airwallex payment link failed; trying hosted checkout fallback', airwallexError);
      try {
        const intent = await createAirwallexPaymentIntent({
          organizationId: org.id,
          organizationName: org.name,
          amount: priceEur,
          email: ctx.user.email,
          returnUrl: `${appUrl}/onboarding/success`,
        });
        await prisma.organization.update({
          where: { id: org.id },
          data: { planStatus: nextUnpaidStatus, airwallexPaymentLinkId: intent.id, profile: { ...(org.profile as any || {}), plan: plan.id } },
        });
        const params = new URLSearchParams({
          intent_id: intent.id,
          client_secret: intent.clientSecret,
          currency: intent.currency,
          env: airwallexClientEnvironment,
        });
        return NextResponse.json({ url: `/checkout/airwallex?${params.toString()}` });
      } catch (fallbackError: any) {
        airwallexError = fallbackError?.message || airwallexError;
        console.error('Airwallex hosted checkout failed', airwallexError);
      }
    }
  }

  return NextResponse.json(
    {
      error: airwallexError ? paymentProviderMessage(airwallexError) : 'Le paiement par carte est momentanément indisponible. Vous pouvez régler par virement bancaire. Aucun débit n’a été effectué.',
      code: airwallexError ? 'PAYMENT_PROVIDER_PERMISSION' : 'PAYMENT_PROVIDER_MISSING',
    },
    { status: 503 }
  );
}
