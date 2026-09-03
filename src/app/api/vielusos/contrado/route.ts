import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireApiPermission, handleApiError, ApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { defaultStyleFor } from '@/lib/blocks';
import { readContradoCatalog, readContradoStore } from '@/lib/contrado';
import { decryptSecret, encryptSecret } from '@/lib/secret-box';
import { isVielusosSite } from '@/lib/vielusos';

const PROVIDER = 'contrado';

function cleanApiKey(value: unknown) {
  const key = String(value || '').trim();
  if (key.length < 20 || key.length > 500 || /\s/.test(key)) throw new ApiError(400, 'Collez une clé API Contrado valide.');
  return key;
}

async function ensureBoutiquePage(site: { id: string }) {
  const existing = await prisma.page.findFirst({ where: { siteId: site.id, slug: 'boutique' } });
  if (existing) {
    await prisma.page.update({ where: { id: existing.id }, data: { showInNav: true } });
    return;
  }
  const last = await prisma.page.aggregate({ where: { siteId: site.id }, _max: { order: true } });
  await prisma.page.create({
    data: {
      siteId: site.id,
      title: 'Boutique',
      slug: 'boutique',
      order: (last._max.order ?? 0) + 1,
      showInNav: true,
      blocks: {
        create: [
          { type: 'heading', order: 0, content: { text: 'BOUTIQUE' } as any, style: { ...defaultStyleFor('heading'), align: 'center', paddingY: 32 } as any },
          { type: 'shop', order: 1, content: { title: '', intro: '', search: true, showCategories: true, columns: 4 } as any, style: defaultStyleFor('shop') as any },
        ],
      },
    },
  });
}

function revalidateShop(site: { subdomain: string; customDomain: string | null }) {
  revalidatePath(`/s/${site.subdomain}`);
  revalidatePath(`/s/${site.subdomain}/boutique`);
  revalidatePath('/dashboard/shop');
  if (site.customDomain) {
    revalidatePath(`/domain/${site.customDomain}`);
    revalidatePath(`/domain/${site.customDomain}/boutique`);
  }
}

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    if (!isVielusosSite(site)) throw new ApiError(404, 'Connexion réservée à la boutique VIELUSOS.');
    const body = await req.json().catch(() => ({}));
    const existing = await prisma.externalIntegration.findUnique({
      where: { organizationId_provider: { organizationId: ctx.org.id, provider: PROVIDER } },
    });
    const apiKey = body.apiKey ? cleanApiKey(body.apiKey) : existing ? decryptSecret(existing.secretEncrypted) : '';
    if (!apiKey) throw new ApiError(400, 'Ajoutez d’abord votre clé API Contrado.');

    try {
      const store = await readContradoStore(apiKey);
      const catalog = await readContradoCatalog(apiKey, store.storeId);
      const now = new Date();
      const currentCount = await prisma.product.count({ where: { organizationId: ctx.org.id } });

      await prisma.$transaction(async (tx) => {
        await tx.externalIntegration.upsert({
          where: { organizationId_provider: { organizationId: ctx.org.id, provider: PROVIDER } },
          create: {
            organizationId: ctx.org.id,
            provider: PROVIDER,
            secretEncrypted: encryptSecret(apiKey),
            storeId: store.storeId || null,
            storeName: store.storeName,
            lastSyncedAt: now,
            lastError: null,
          },
          update: {
            ...(body.apiKey ? { secretEncrypted: encryptSecret(apiKey) } : {}),
            storeId: store.storeId || null,
            storeName: store.storeName,
            lastSyncedAt: now,
            lastError: null,
          },
        });
        for (let index = 0; index < catalog.length; index += 1) {
          const product = catalog[index];
          await tx.product.upsert({
            where: { organizationId_provider_externalId: { organizationId: ctx.org.id, provider: PROVIDER, externalId: product.externalId } },
            create: {
              organizationId: ctx.org.id,
              provider: PROVIDER,
              externalId: product.externalId,
              externalData: product.externalData as any,
              name: product.name,
              description: product.description,
              priceCents: product.priceCents,
              images: product.images as any,
              imageUrl: product.images[0] || null,
              category: product.category,
              brand: 'VIELUSOS',
              stock: product.stock,
              active: product.stock !== 0 && product.priceCents > 0,
              order: currentCount + index,
            },
            update: {
              externalData: product.externalData as any,
              name: product.name,
              description: product.description,
              priceCents: product.priceCents,
              images: product.images as any,
              imageUrl: product.images[0] || null,
              category: product.category,
              stock: product.stock,
              active: product.stock !== 0 && product.priceCents > 0,
            },
          });
        }
      });

      const profile = (ctx.org.profile as any) || {};
      await prisma.organization.update({
        where: { id: ctx.org.id },
        data: { profile: { ...profile, hasShop: true, shopEnabled: true } },
      });
      await ensureBoutiquePage(site);
      revalidateShop(site);

      const products = await prisma.product.findMany({
        where: { organizationId: ctx.org.id },
        orderBy: { order: 'asc' },
        select: { id: true, name: true, description: true, priceCents: true, imageUrl: true, images: true, category: true, brand: true, stock: true, active: true, provider: true },
      });
      return NextResponse.json({
        ok: true,
        connected: true,
        storeName: store.storeName,
        syncedAt: now.toISOString(),
        imported: catalog.length,
        products,
      });
    } catch (error: any) {
      const safeError = String(error?.message || 'Synchronisation impossible').replaceAll(apiKey, '[clé masquée]').slice(0, 500);
      if (existing) {
        await prisma.externalIntegration.update({ where: { id: existing.id }, data: { lastError: safeError } }).catch(() => {});
      }
      throw new ApiError(502, safeError);
    }
  } catch (error) {
    return handleApiError(error);
  }
}
