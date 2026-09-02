import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { RenderSite, loadSiteByDomain, siteMetadata } from '@/components/site/RenderSite';
import { VIELUSOS_SUBDOMAIN } from '@/lib/vielusos';
import { IMPACT_SUBDOMAIN, isImpactHost } from '@/lib/impact';

// The site editor must be reflected on the public site at the very next load.
// Dynamic rendering avoids serving a stale CDN snapshot after an edit.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
  const { host } = await params;
  const domain = decodeURIComponent(host);
  const apex = domain.replace(/^www\./i, '');
  const impact = isImpactHost(domain);
  const site = impact
    ? await prisma.site.findUnique({ where: { subdomain: IMPACT_SUBDOMAIN }, select: { name: true, header: true, footer: true } })
    : await prisma.site.findFirst({ where: { customDomain: { in: [domain, apex, `www.${apex}`] }, domainVerified: true }, select: { name: true, header: true, footer: true } });
  const brandedSubdomain = apex.toLowerCase() === 'vielusos.com' ? VIELUSOS_SUBDOMAIN : impact ? IMPACT_SUBDOMAIN : undefined;
  return siteMetadata(site, brandedSubdomain);
}

// Rendered for verified custom domains (rewritten by middleware). basePath is
// empty because the domain root maps directly to the site.
export default async function CustomDomainSite({ params }: { params: Promise<{ host: string; path?: string[] }> }) {
  const { host, path } = await params;
  const site = await loadSiteByDomain(decodeURIComponent(host));
  return <RenderSite site={site as any} basePath="" slug={path?.[0]} />;
}
