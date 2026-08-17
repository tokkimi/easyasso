import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PRICE_EUR } from '@/lib/stripe';
import { platformBankDetails } from '@/lib/platform-admin';

function paymentReference(org: { id: string; slug: string }, existing?: string) {
  const cleanId = org.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const neutralReference = `EA-${cleanId.slice(-10) || 'DOSSIER'}`;
  if (existing === neutralReference) return existing;
  return neutralReference;
}

export async function POST() {
  const ctx = await requireOrg();
  const org = ctx.organization!;
  if (org.planStatus === 'ACTIVE') return NextResponse.json({ active: true, url: '/dashboard' });

  const currentProfile = (org.profile || {}) as Record<string, any>;
  const currentManual = (currentProfile.easyassoManualPayment || {}) as Record<string, any>;
  const reference = paymentReference(org, currentManual.reference);
  const requestedAt = currentManual.requestedAt || new Date().toISOString();

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      planStatus: 'PENDING_PAYMENT',
      profile: {
        ...currentProfile,
        easyassoManualPayment: {
          ...currentManual,
          method: 'BANK_TRANSFER',
          status: 'WAITING_TRANSFER',
          amountEur: PRICE_EUR,
          reference,
          requestedAt,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    amountEur: PRICE_EUR,
    reference,
    bank: platformBankDetails(),
  });
}
