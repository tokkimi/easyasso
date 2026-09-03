import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireApiPermission, handleApiError, ApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { fetchContradoProducts } from '@/lib/contrado';

function revalidateShop(site: { subdomain: string; customDomain?: string | null } | null) {
  if (!site) return;
  revalidatePath(`/s/${site.subdomain}`);
  revalidatePath(`/s/${site.subdomain}/boutique`);
  if (site.customDomain) {
    revalidatePath(`/domain/${site.customDomain}`);
    revalidatePath(`/domain/${site.customDomain}/boutique`);
  }
}

// Status of the external-catalogue connection (never returns the stored token).
export async function GET() {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const org = await prisma.organization.findUnique({ where: { id: ctx.org.id } });
    const feed = ((org?.profile as any) || {}).shopFeed || {};
    return NextResponse.json({
      provider: feed.provider || 'contrado',
      url: feed.url || '',
      hasToken: Boolean(feed.token),
      lastCount: feed.lastCount ?? null,
      lastImportAt: feed.lastImportAt ?? null,
    });
  } catch (e) { return handleApiError(e); }
}

// Connect / refresh: pull the merchant's catalogue and mirror it into their own
// products so it displays and sells on their site — visitors are never redirected.
export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const body = await req.json().catch(() => ({}));
    const org = await prisma.organization.findUnique({ where: { id: ctx.org.id } });
    const profile = (org?.profile as any) || {};
    const prevFeed = profile.shopFeed || {};

    const url = String(body.url || prevFeed.url || '').trim();
    // Reuse the stored token if the field was left blank (so it isn't re-typed).
    const token = String((body.token ?? '') || prevFeed.token || '').trim();
    if (!url) throw new ApiError(400, 'Ajoutez le lien de l’API Contrado.');

    const { items, diagnostic } = await fetchContradoProducts(url, token);

    const site = await prisma.site.findUnique({ where: { organizationId: ctx.org.id } });

    // Remove the products we previously imported (never touches manual products).
    const prevIds: string[] = Array.isArray(prevFeed.importedIds) ? prevFeed.importedIds : [];
    if (prevIds.length) {
      await prisma.product.deleteMany({ where: { organizationId: ctx.org.id, id: { in: prevIds } } });
    }

    const agg = await prisma.product.aggregate({ where: { organizationId: ctx.org.id }, _max: { order: true } });
    let order = (agg._max.order ?? -1) + 1;

    const createdIds: string[] = [];
    for (const p of items) {
      const created = await prisma.product.create({
        data: {
          organizationId: ctx.org.id,
          name: p.name,
          description: p.description,
          priceCents: p.priceCents,
          currency: 'eur',
          imageUrl: p.images[0] || null,
          images: p.images,
          category: p.category,
          brand: p.brand,
          stock: null,
          active: true,
          order: order++,
        },
        select: { id: true },
      });
      createdIds.push(created.id);
    }

    await prisma.organization.update({
      where: { id: ctx.org.id },
      data: {
        profile: {
          ...profile,
          shopFeed: {
            provider: 'contrado',
            url,
            token,
            importedIds: createdIds,
            lastCount: createdIds.length,
            lastImportAt: new Date().toISOString(),
          },
        },
      },
    });

    revalidateShop(site);
    return NextResponse.json({ ok: true, count: createdIds.length, diagnostic });
  } catch (e) { return handleApiError(e); }
}

// Disconnect: forget the credentials and remove the imported products.
export async function DELETE() {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const org = await prisma.organization.findUnique({ where: { id: ctx.org.id } });
    const profile = (org?.profile as any) || {};
    const prevIds: string[] = Array.isArray(profile.shopFeed?.importedIds) ? profile.shopFeed.importedIds : [];
    if (prevIds.length) {
      await prisma.product.deleteMany({ where: { organizationId: ctx.org.id, id: { in: prevIds } } });
    }
    const nextProfile = { ...profile };
    delete nextProfile.shopFeed;
    await prisma.organization.update({ where: { id: ctx.org.id }, data: { profile: nextProfile } });
    const site = await prisma.site.findUnique({ where: { organizationId: ctx.org.id } });
    revalidateShop(site);
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
