import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, requireApiPermission } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';

function cents(value: unknown, nullable = false) {
  if (value === '' || value == null) return nullable ? null : 0;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number * 100)) : nullable ? null : 0;
}
function data(b: any) {
  return {
    name: String(b.name || 'Livraison standard').trim().slice(0, 100),
    countryCodes: Array.from(new Set(String(b.countryCodes || '').split(/[,;\s]+/).map((x) => x.trim().toUpperCase()).filter((x) => /^[A-Z]{2}$/.test(x)))),
    priceCents: cents(b.priceEuros) as number,
    freeAboveCents: cents(b.freeAboveEuros, true),
    minOrderCents: cents(b.minOrderEuros) as number,
    maxOrderCents: cents(b.maxOrderEuros, true),
    minDeliveryDays: b.minDeliveryDays === '' || b.minDeliveryDays == null ? null : Math.max(0, Number(b.minDeliveryDays) || 0),
    maxDeliveryDays: b.maxDeliveryDays === '' || b.maxDeliveryDays == null ? null : Math.max(0, Number(b.maxDeliveryDays) || 0),
    active: b.active !== false,
  };
}

export async function GET() {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SHOP_VIEW);
    return NextResponse.json({ rates: await prisma.shippingRate.findMany({ where: { organizationId: ctx.org.id }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }) });
  } catch (e) { return handleApiError(e); }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SHOP_EDIT);
    const b = await req.json().catch(() => ({}));
    const count = await prisma.shippingRate.count({ where: { organizationId: ctx.org.id } });
    const rate = await prisma.shippingRate.create({ data: { organizationId: ctx.org.id, ...data(b), order: count } });
    return NextResponse.json({ rate });
  } catch (e) { return handleApiError(e); }
}
