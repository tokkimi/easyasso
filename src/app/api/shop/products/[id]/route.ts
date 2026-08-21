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

async function ownProduct(orgId: string, id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  return product && product.organizationId === orgId ? product : null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const { id } = await params;
    if (!(await ownProduct(ctx.org.id, id))) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    const b = await req.json().catch(() => ({}));
    const data: any = {};
    if (b.name !== undefined) data.name = String(b.name).trim().slice(0, 140);
    if (b.description !== undefined) data.description = String(b.description).slice(0, 4000);
    if (b.priceEuros !== undefined) data.priceCents = euros(b.priceEuros);
    if (b.imageUrl !== undefined) data.imageUrl = b.imageUrl ? String(b.imageUrl).slice(0, 2_000_000) : null;
    if (b.stock !== undefined) data.stock = optionalStock(b.stock);
    if (b.active !== undefined) data.active = !!b.active;
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const { id } = await params;
    if (!(await ownProduct(ctx.org.id, id))) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
