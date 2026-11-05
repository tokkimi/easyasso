import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public: active shipping rates of a shop, so the cart can show the delivery
// cost before payment (the checkout recomputes it server-side anyway).
export async function GET(req: Request) {
  const organizationId = new URL(req.url).searchParams.get('organizationId') || '';
  if (!organizationId) return NextResponse.json({ rates: [] });
  const rates = await prisma.shippingRate.findMany({
    where: { organizationId, active: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, countryCodes: true, priceCents: true, freeAboveCents: true, minOrderCents: true, maxOrderCents: true, minDeliveryDays: true, maxDeliveryDays: true },
  });
  return NextResponse.json({ rates });
}
