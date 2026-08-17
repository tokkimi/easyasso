import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { TEMPLATES } from '@/lib/templates';
import { GenerateClient } from './client';

export const dynamic = 'force-dynamic';

export default async function GeneratePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const ctx = await requirePermission(PERMISSIONS.SITE_EDIT);
  const { welcome } = await searchParams;
  const categories = TEMPLATES.map((t) => ({ id: t.id, name: t.name }));
  const site = await prisma.site.findUnique({
    where: { organizationId: ctx.organization!.id },
    select: { header: true, footer: true },
  });
  const header = (site?.header as any) || {};
  const footer = (site?.footer as any) || {};
  const initialLogo = header.logoUrl || footer.logoUrl || '';
  return <GenerateClient orgName={ctx.organization!.name} profile={(ctx.organization!.profile as any) || {}} categories={categories} welcome={!!welcome} initialLogo={initialLogo} />;
}
