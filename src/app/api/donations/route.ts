import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.DONATIONS_EDIT);
    const b = await req.json();
    const donation = await prisma.donation.create({
      data: {
        organizationId: ctx.org.id,
        donorId: b.donorId || null,
        campaignId: b.campaignId || null,
        amountCents: Math.round((Number(b.amountEuros) || 0) * 100),
        method: b.method || 'CASH',
        status: b.status || 'COMPLETED',
        isRecurring: !!b.isRecurring,
        message: b.message || null,
        donatedAt: b.donatedAt ? new Date(b.donatedAt) : new Date(),
      },
    });
    return NextResponse.json(donation);
  } catch (e) { return handleApiError(e); }
}
