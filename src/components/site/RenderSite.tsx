import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DEFAULT_HEADER, DEFAULT_FOOTER, type HeaderConfig, type FooterConfig } from '@/lib/blocks';
import { PublicBlock } from './PublicBlock';
import { PublicHeader, PublicFooter } from './PublicChrome';
import { ContactBubble } from './ContactBubble';
import { PageViewTracker } from './PageViewTracker';
import { themeStyle, brandCss } from '@/lib/render';
import { googleFontsHref } from '@/lib/fonts';
import { canShowPublicSite } from '@/lib/plan';

type SiteWithPages = NonNullable<Awaited<ReturnType<typeof loadSiteBySubdomain>>>;

export async function loadSiteBySubdomain(subdomain: string) {
  return prisma.site.findUnique({
    where: { subdomain },
    include: {
      organization: { select: { planStatus: true, trialEndsAt: true, profile: true } },
      pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
    },
  });
}
export async function loadSiteByDomain(domain: string) {
  return prisma.site.findFirst({
    where: { customDomain: domain, domainVerified: true },
    include: {
      organization: { select: { planStatus: true, trialEndsAt: true, profile: true } },
      pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
    },
  });
}

// SEO metadata for a public tenant site (title, description, Open Graph/Twitter
// with the association's logo). `absolute` title keeps the tenant's own name
// without the EasyAsso suffix.
export function siteMetadata(site: { name: string; header: unknown; footer: unknown } | null): Metadata {
  if (!site) return { title: 'Easy Asso' };
  const footer = (site.footer as any) || {};
  const header = (site.header as any) || {};
  const raw = typeof footer.text === 'string' && footer.text.trim() ? footer.text.trim() : `Le site de ${site.name}.`;
  const description = raw.slice(0, 300);
  const image = header.logoUrl || footer.logoUrl;
  return {
    title: { absolute: site.name },
    description,
    openGraph: { title: site.name, description, type: 'website', images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary', title: site.name, description },
  };
}

export function RenderSite({ site, basePath, slug }: { site: SiteWithPages; basePath: string; slug?: string }) {
  if (!site) notFound();
  if (!site.published || !canShowPublicSite(site.organization)) return <SiteOffline />;

  const header = { ...DEFAULT_HEADER, ...(site.header as any) } as HeaderConfig;
  const footer = { ...DEFAULT_FOOTER, ...(site.footer as any) } as FooterConfig;
  const nav = site.pages.filter((p) => p.showInNav).map((p) => ({ title: p.title, slug: p.slug, isHome: p.isHome }));
  const theme = (site.theme as any) || {};
  const fontHref = googleFontsHref(theme.font);

  // Floating contact bubble — shown on every page of every site (opt-out via
  // footer.showContactBubble = false in the editor).
  const profile = (((site.organization as any)?.profile) || {}) as Record<string, any>;
  const bubble = (footer as any).showContactBubble === false ? null : (
    <ContactBubble
      name={site.name}
      slogan={footer.text}
      logoUrl={(header as any).logoUrl || (footer as any).logoUrl}
      email={profile.email}
      phone={profile.phone}
      organizationId={site.organizationId}
      locale={profile.language === 'en' ? 'en' : 'fr'}
    />
  );

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
        {bubble}
      </div>
    );
  }

  const page = slug ? site.pages.find((p) => p.slug === slug) : site.pages.find((p) => p.isHome) || site.pages[0];
  if (!page) notFound();

  return (
    <div className="flex min-h-screen flex-col" style={themeStyle(theme)}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      <PageViewTracker organizationId={site.organizationId} path={page.slug} />
      <PublicHeader header={header} nav={nav} basePath={basePath} />
      <main className="flex-1 py-8">
        {page.blocks.length === 0 ? (
          <p className="py-20 text-center text-gray-400">Cette page est vide.</p>
        ) : (
          page.blocks.map((b) => <PublicBlock key={b.id} type={b.type} content={b.content as any} style={b.style as any} basePath={basePath} organizationId={site.organizationId} />)
        )}
      </main>
      <PublicFooter footer={footer} orgId={site.organizationId} basePath={basePath} nav={nav} />
      {bubble}
    </div>
  );
}

function SiteOffline() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 px-4 py-12 text-center">
      <section className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Site hors ligne</p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Ce site est temporairement indisponible.</h1>
        <p className="mt-4 text-gray-600">
          L’association doit finaliser son activation pour remettre son site en ligne.
        </p>
      </section>
    </main>
  );
}
