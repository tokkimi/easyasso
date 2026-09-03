import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { siteUrlFor } from '@/lib/utils';
import { ShopClient } from './client';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const ctx = await requirePermission(PERMISSIONS.SITE_VIEW);
  const org = ctx.organization!;
  const [products, site, orders, contrado] = await Promise.all([
    prisma.product.findMany({
      where: { organizationId: org.id },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, description: true, priceCents: true, imageUrl: true, images: true, category: true, brand: true, stock: true, active: true, provider: true },
    }),
    prisma.site.findUnique({ where: { organizationId: org.id }, include: { pages: { select: { slug: true } } } }),
    prisma.order.findMany({ where: { organizationId: org.id, status: { in: ['PAID', 'SHIPPED'] } }, orderBy: { createdAt: 'desc' }, take: 50, include: { items: true } }),
    prisma.externalIntegration.findUnique({ where: { organizationId_provider: { organizationId: org.id, provider: 'contrado' } }, select: { storeName: true, lastSyncedAt: true, lastError: true } }),
  ]);
  const profile = (org.profile as any) || {};
  const enabled = Boolean(profile.shopEnabled ?? profile.hasShop);
  const boutiqueUrl = site ? `${siteUrlFor(site.subdomain, site.customDomain, site.domainVerified)}/boutique` : '';
  const hasBoutiquePage = Boolean(site?.pages.some((p) => p.slug === 'boutique'));
  return (
    <ShopClient
      enabled={enabled}
      initial={JSON.parse(JSON.stringify(products))}
      boutiqueUrl={boutiqueUrl}
      hasBoutiquePage={hasBoutiquePage}
      connectStarted={Boolean(profile.stripeConnectAccountId)}
      connectReady={Boolean(profile.stripeConnectReady)}
      orders={JSON.parse(JSON.stringify(orders))}
      branded={isVielusosSite(site)}
      contrado={contrado ? { connected: true, storeName: contrado.storeName, syncedAt: contrado.lastSyncedAt ? contrado.lastSyncedAt.toISOString() : null, error: contrado.lastError } : { connected: false }}
    />
  );
}
