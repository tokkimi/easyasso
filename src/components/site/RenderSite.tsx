import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DEFAULT_HEADER, DEFAULT_FOOTER, type HeaderConfig, type FooterConfig } from '@/lib/blocks';
import { PublicBlock } from './PublicBlock';
import { PublicHeader, PublicFooter } from './PublicChrome';
import { themeStyle, brandCss } from '@/lib/render';
import { googleFontsHref } from '@/lib/fonts';

type SiteWithPages = NonNullable<Awaited<ReturnType<typeof loadSiteBySubdomain>>>;

export async function loadSiteBySubdomain(subdomain: string) {
  return prisma.site.findUnique({
    where: { subdomain },
    include: { pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } } },
  });
}
export async function loadSiteByDomain(domain: string) {
  return prisma.site.findFirst({
    where: { customDomain: domain, domainVerified: true },
    include: { pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } } },
  });
}

export function RenderSite({ site, basePath, slug }: { site: SiteWithPages; basePath: string; slug?: string }) {
  if (!site || !site.published) notFound();

  const header = { ...DEFAULT_HEADER, ...(site.header as any) } as HeaderConfig;
  const footer = { ...DEFAULT_FOOTER, ...(site.footer as any) } as FooterConfig;
  const nav = site.pages.filter((p) => p.showInNav).map((p) => ({ title: p.title, slug: p.slug, isHome: p.isHome }));
  const theme = (site.theme as any) || {};
  const fontHref = googleFontsHref(theme.font);

  if (slug === 'cgv' || slug === 'mentions-legales') {
    const isCgv = slug === 'cgv';
    return (
      <div className="min-h-screen" style={themeStyle(theme)}>
        {fontHref && <link rel="stylesheet" href={fontHref} />}
        <style dangerouslySetInnerHTML={{ __html: brandCss(theme.primary) }} />
        <PublicHeader header={header} nav={nav} basePath={basePath} />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-extrabold">{isCgv ? 'Conditions générales' : 'Mentions légales'}</h1>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-600">{isCgv ? footer.cgvContent : footer.mentionsContent}</p>
        </main>
        <PublicFooter footer={footer} orgId={site.organizationId} basePath={basePath} nav={nav} />
      </div>
    );
  }

  const page = slug ? site.pages.find((p) => p.slug === slug) : site.pages.find((p) => p.isHome) || site.pages[0];
  if (!page) notFound();

  prisma.siteEvent.create({ data: { organizationId: site.organizationId, type: 'pageview', path: page.slug } }).catch(() => {});

  return (
    <div className="flex min-h-screen flex-col" style={themeStyle(theme)}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      <PublicHeader header={header} nav={nav} basePath={basePath} />
      <main className="flex-1 py-8">
        {page.blocks.length === 0 ? (
          <p className="py-20 text-center text-gray-400">Cette page est vide.</p>
        ) : (
          page.blocks.map((b) => <PublicBlock key={b.id} type={b.type} content={b.content as any} style={b.style as any} basePath={basePath} />)
        )}
      </main>
      <PublicFooter footer={footer} orgId={site.organizationId} basePath={basePath} nav={nav} />
    </div>
  );
}
