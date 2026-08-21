import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ShopClient } from './client';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const ctx = await requirePermission(PERMISSIONS.SITE_VIEW);
  const org = ctx.organization!;
  const products = await prisma.product.findMany({ where: { organizationId: org.id }, orderBy: { order: 'asc' } });
  const enabled = Boolean((org.profile as any)?.shopEnabled ?? (org.profile as any)?.hasShop);
  return <ShopClient enabled={enabled} initial={JSON.parse(JSON.stringify(products))} />;
}
