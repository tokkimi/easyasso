import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, requireApiPermission } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';

function euros(value: unknown, nullable = false) {
  if (value === '' || value == null) return nullable ? null : 0;
  const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : nullable ? null : 0;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SHOP_EDIT); const { id } = await params;
    const own = await prisma.shippingRate.findFirst({ where: { id, organizationId: ctx.org.id } });
    if (!own) return NextResponse.json({ error: 'Tarif introuvable.' }, { status: 404 });
    const b = await req.json().catch(() => ({}));
    const rate = await prisma.shippingRate.update({ where: { id }, data: {
      ...(b.name !== undefined ? { name: String(b.name).trim().slice(0, 100) } : {}),
      ...(b.countryCodes !== undefined ? { countryCodes: Array.from(new Set(String(b.countryCodes).split(/[,;\s]+/).map((x) => x.toUpperCase()).filter((x) => /^[A-Z]{2}$/.test(x)))) } : {}),
      ...(b.priceEuros !== undefined ? { priceCents: euros(b.priceEuros) as number } : {}),
      ...(b.freeAboveEuros !== undefined ? { freeAboveCents: euros(b.freeAboveEuros, true) } : {}),
      ...(b.minDeliveryDays !== undefined ? { minDeliveryDays: b.minDeliveryDays === '' ? null : Math.max(0, Number(b.minDeliveryDays) || 0) } : {}),
      ...(b.maxDeliveryDays !== undefined ? { maxDeliveryDays: b.maxDeliveryDays === '' ? null : Math.max(0, Number(b.maxDeliveryDays) || 0) } : {}),
      ...(b.active !== undefined ? { active: !!b.active } : {}),
    } });
    return NextResponse.json({ rate });
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SHOP_EDIT); const { id } = await params;
    const deleted = await prisma.shippingRate.deleteMany({ where: { id, organizationId: ctx.org.id } });
    if (!deleted.count) return NextResponse.json({ error: 'Tarif introuvable.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
