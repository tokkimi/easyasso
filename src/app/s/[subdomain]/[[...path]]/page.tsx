import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { RenderSite, loadSiteBySubdomain, siteMetadata } from '@/components/site/RenderSite';

// The site editor must be reflected on the public site at the very next load.
// Dynamic rendering avoids serving a stale CDN snapshot after an edit.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params;
  const site = await prisma.site.findUnique({ where: { subdomain }, select: { name: true, header: true, footer: true } });
  return siteMetadata(site, subdomain);
}

export default async function PublicSite({ params }: { params: Promise<{ subdomain: string; path?: string[] }> }) {
  const { subdomain, path } = await params;
  const site = await loadSiteBySubdomain(subdomain);
  return <RenderSite site={site as any} basePath={`/s/${subdomain}`} slug={path?.[0]} />;
}
