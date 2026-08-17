import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { TEMPLATES } from '@/lib/templates';
import { GenerateClient } from './client';

export const dynamic = 'force-dynamic';

export default async function GeneratePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const ctx = await requirePermission(PERMISSIONS.SITE_EDIT);
  const { welcome } = await searchParams;
  const categories = TEMPLATES.map((t) => ({ id: t.id, name: t.name }));
  return <GenerateClient orgName={ctx.organization!.name} categories={categories} welcome={!!welcome} />;
}
