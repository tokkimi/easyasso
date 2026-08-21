import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { eurosToCents as euros, optionalStock, cleanImages } from '@/lib/shop';

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
    if (b.images !== undefined) { const imgs = cleanImages(b.images); data.images = imgs as any; data.imageUrl = imgs[0] || null; }
    if (b.category !== undefined) data.category = String(b.category).slice(0, 60);
    if (b.brand !== undefined) data.brand = String(b.brand).slice(0, 80);
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
