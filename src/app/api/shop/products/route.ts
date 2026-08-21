import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

function euros(value: unknown) {
  return Math.max(0, Math.round((Number(value) || 0) * 100));
}
function optionalStock(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Create a product for this organization's shop.
export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const b = await req.json().catch(() => ({}));
    const name = String(b.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Le nom du produit est requis.' }, { status: 400 });
    const count = await prisma.product.count({ where: { organizationId: ctx.org.id } });
    const product = await prisma.product.create({
      data: {
        organizationId: ctx.org.id,
        name: name.slice(0, 140),
        description: String(b.description || '').slice(0, 4000),
        priceCents: euros(b.priceEuros),
        imageUrl: b.imageUrl ? String(b.imageUrl).slice(0, 2_000_000) : null,
        stock: optionalStock(b.stock),
        active: b.active === undefined ? true : !!b.active,
        order: count,
      },
    });
    return NextResponse.json({ product });
  } catch (e) { return handleApiError(e); }
}
