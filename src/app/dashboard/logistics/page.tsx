import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { LogisticsClient } from './client';

export const dynamic = 'force-dynamic';

export default async function LogisticsPage() {
  const ctx = await requirePermission(PERMISSIONS.LOGISTICS_VIEW);
  const orders = await prisma.order.findMany({
    where: { organizationId: ctx.organization!.id }, orderBy: { createdAt: 'desc' }, take: 250,
    include: { items: true, events: { orderBy: { createdAt: 'desc' } } },
  });
  return <LogisticsClient initial={JSON.parse(JSON.stringify(orders))} canEdit={ctx.permissions.has(PERMISSIONS.LOGISTICS_EDIT)} />;
}
