import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { ShippingClient } from './client';

export const dynamic = 'force-dynamic';

export default async function ShippingPage() {
  const ctx = await requirePermission(PERMISSIONS.SHOP_VIEW);
  const rates = await prisma.shippingRate.findMany({
    where: { organizationId: ctx.organization!.id },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return <ShippingClient initial={JSON.parse(JSON.stringify(rates))} canEdit={ctx.permissions.has(PERMISSIONS.SHOP_EDIT)} />;
}
