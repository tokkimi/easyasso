import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { MessagesClient } from './client';

export const dynamic = 'force-dynamic';
export default async function MessagesPage() {
  const ctx = await requirePermission(PERMISSIONS.SITE_VIEW);
  const messages = await prisma.contactMessage.findMany({ where: { organizationId: ctx.organization!.id, archivedAt: null }, orderBy: { createdAt: 'desc' } });
  return <MessagesClient initial={JSON.parse(JSON.stringify(messages))} />;
}
