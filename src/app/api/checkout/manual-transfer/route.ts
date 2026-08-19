import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { platformBankDetails } from '@/lib/platform-admin';
import { planAccess } from '@/lib/plan';
import { planFor } from '@/lib/plans';

function paymentReference(org: { id: string; slug: string }, existing?: string) {
  const cleanId = org.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const neutralReference = `EA-${cleanId.slice(-10) || 'DOSSIER'}`;
  if (existing === neutralReference) return existing;
  return neutralReference;
}

export async function POST(req: Request) {
  const ctx = await requireOrg();
  const org = ctx.organization!;
  if (org.planStatus === 'ACTIVE') return NextResponse.json({ active: true, url: '/dashboard' });

  const body = await req.json().catch(() => ({}));
  const plan = planFor(body?.plan);

  const currentProfile = (org.profile || {}) as Record<string, any>;
  const currentManual = (currentProfile.easyassoManualPayment || {}) as Record<string, any>;
  const reference = paymentReference(org, currentManual.reference);
  const requestedAt = currentManual.requestedAt || new Date().toISOString();
  const nextUnpaidStatus = planAccess(org).hasAccess ? org.planStatus : 'PENDING_PAYMENT';

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      planStatus: nextUnpaidStatus,
      profile: {
        ...currentProfile,
        plan: plan.id,
        easyassoManualPayment: {
          ...currentManual,
          method: 'BANK_TRANSFER',
          status: 'WAITING_TRANSFER',
          plan: plan.id,
          amountEur: plan.amountEur,
          reference,
          requestedAt,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    plan: plan.id,
    amountEur: plan.amountEur,
    reference,
    bank: platformBankDetails(),
  });
}
