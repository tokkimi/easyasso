import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { RenderSite, loadSiteByDomain } from '@/components/site/RenderSite';

// Cache verified custom-domain pages on the CDN, refreshing in the background
// at most once a minute (edits call revalidatePath for an immediate refresh).
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
  const { host } = await params;
  const site = await prisma.site.findFirst({ where: { customDomain: decodeURIComponent(host), domainVerified: true } });
  return { title: site?.name || 'Easy Asso' };
}

// Rendered for verified custom domains (rewritten by middleware). basePath is
// empty because the domain root maps directly to the site.
export default async function CustomDomainSite({ params }: { params: Promise<{ host: string; path?: string[] }> }) {
  const { host, path } = await params;
  const site = await loadSiteByDomain(decodeURIComponent(host));
  return <RenderSite site={site as any} basePath="" slug={path?.[0]} />;
}
