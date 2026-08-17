import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { RenderSite, loadSiteByDomain } from '@/components/site/RenderSite';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
  const { host } = await params;
  const site = await prisma.site.findFirst({ where: { customDomain: decodeURIComponent(host) } });
  return { title: site?.name || 'Easy Asso' };
}

// Rendered for verified custom domains (rewritten by middleware). basePath is
// empty because the domain root maps directly to the site.
export default async function CustomDomainSite({ params }: { params: Promise<{ host: string; path?: string[] }> }) {
  const { host, path } = await params;
  const site = await loadSiteByDomain(decodeURIComponent(host));
  return <RenderSite site={site as any} basePath="" slug={path?.[0]} />;
}
