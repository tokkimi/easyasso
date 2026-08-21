import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { eurosToCents as euros, optionalStock, cleanImages } from '@/lib/shop';

// Create a product for this organization's shop.
export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const b = await req.json().catch(() => ({}));
    const name = String(b.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Le nom du produit est requis.' }, { status: 400 });
    const count = await prisma.product.count({ where: { organizationId: ctx.org.id } });
    const images = cleanImages(b.images ?? (b.imageUrl ? [b.imageUrl] : []));
    const product = await prisma.product.create({
      data: {
        organizationId: ctx.org.id,
        name: name.slice(0, 140),
        description: String(b.description || '').slice(0, 4000),
        priceCents: euros(b.priceEuros),
        images: images as any,
        imageUrl: images[0] || null,
        category: String(b.category || '').slice(0, 60),
        brand: String(b.brand || '').slice(0, 80),
        stock: optionalStock(b.stock),
        active: b.active === undefined ? true : !!b.active,
        order: count,
      },
    });
    return NextResponse.json({ product });
  } catch (e) { return handleApiError(e); }
}
