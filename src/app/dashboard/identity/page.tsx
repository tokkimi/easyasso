import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { IdentityClient } from './client';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function IdentityPage() {
  const ctx = await requirePermission(PERMISSIONS.SITE_EDIT);
  const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.organization!.id } });
  return (
    <IdentityClient
      theme={(site.theme as any) || {}}
      header={(site.header as any) || {}}
      footer={(site.footer as any) || {}}
      branded={isVielusosSite(site)}
    />
  );
}
