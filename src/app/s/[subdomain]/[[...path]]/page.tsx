import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { RenderSite, loadSiteBySubdomain } from '@/components/site/RenderSite';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params;
  const site = await prisma.site.findUnique({ where: { subdomain } });
  return { title: site?.name || 'Easy Asso' };
}

export default async function PublicSite({ params }: { params: Promise<{ subdomain: string; path?: string[] }> }) {
  const { subdomain, path } = await params;
  const site = await loadSiteBySubdomain(subdomain);
  return <RenderSite site={site as any} basePath={`/s/${subdomain}`} slug={path?.[0]} />;
}
