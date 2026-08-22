import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DEFAULT_HEADER, DEFAULT_FOOTER, type HeaderConfig, type FooterConfig } from '@/lib/blocks';
import { PublicBlock } from './PublicBlock';
import { PublicHeader, PublicFooter } from './PublicChrome';
import { ContactBubble } from './ContactBubble';
import { CustomerAccessForm } from './CustomerAccessForm';
import { PageViewTracker } from './PageViewTracker';
import { themeStyle, brandCss } from '@/lib/render';
import { googleFontsHref } from '@/lib/fonts';
import { canShowPublicSite } from '@/lib/plan';
import { isVielusosSite, VIELUSOS_BRAND } from '@/lib/vielusos';

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
export function siteMetadata(site: { name: string; header: unknown; footer: unknown } | null, subdomain?: string): Metadata {
  if (!site) return { title: 'Easy Asso' };
  const footer = (site.footer as any) || {};
  const header = (site.header as any) || {};
  const raw = typeof footer.text === 'string' && footer.text.trim() ? footer.text.trim() : `Le site de ${site.name}.`;
  const description = raw.slice(0, 300);
  const image = isVielusosSite({ subdomain }) ? VIELUSOS_BRAND.logoUrl : (header.logoUrl || footer.logoUrl);
  return {
    title: { absolute: site.name },
    description,
    // Each published site uses its own uploaded logo for the browser tab and
    // home-screen shortcut. Fall back to EasyAsso's default only when no logo
    // was provided by the site owner.
    icons: image ? { icon: [{ url: image }], apple: [{ url: image }] } : undefined,
    openGraph: { title: site.name, description, type: 'website', images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary', title: site.name, description },
  };
}

// Active products for a tenant shop, newest first, shaped for the catalogue.
async function loadShopProducts(organizationId: string) {
  const rows = await prisma.product.findMany({
    where: { organizationId, active: true },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  return rows.map((p) => {
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      images: images.length ? images : p.imageUrl ? [p.imageUrl] : [],
      category: p.category,
      brand: p.brand,
      stock: p.stock,
    };
  });
}

export async function RenderSite({ site, basePath, slug }: { site: SiteWithPages; basePath: string; slug?: string }) {
  if (!site) notFound();
  if (!site.published || !canShowPublicSite(site.organization)) return <SiteOffline />;

  const header = { ...DEFAULT_HEADER, ...(site.header as any) } as HeaderConfig;
  const footer = { ...DEFAULT_FOOTER, ...(site.footer as any) } as FooterConfig;
  const profile = (((site.organization as any)?.profile) || {}) as Record<string, any>;
  const vielusos = isVielusosSite(site);
  const publicHeader = vielusos
    ? { ...header, logoUrl: VIELUSOS_BRAND.logoUrl, logoText: site.name.toUpperCase(), background: VIELUSOS_BRAND.surface, textColor: '#f7f7fb' }
    : header;
  const publicFooter = vielusos
    ? { ...footer, logoUrl: VIELUSOS_BRAND.logoUrl, logoText: site.name.toUpperCase(), background: VIELUSOS_BRAND.surface, textColor: '#f7f7fb' }
    : footer;
  const shopEnabled = Boolean(profile.shopEnabled ?? profile.hasShop);
  const nav = site.pages.filter((p) => p.showInNav && (p.slug !== 'boutique' || shopEnabled)).map((p) => ({ title: p.title, slug: p.slug, isHome: p.isHome }));
  const theme = (site.theme as any) || {};
  const fontHref = googleFontsHref(theme.font);

  // Floating contact bubble — shown on every page of every site (opt-out via
  // footer.showContactBubble = false in the editor).
  const bubble = (footer as any).showContactBubble === false ? null : (
    <ContactBubble
      name={site.name}
      slogan={(footer as any).contactBubbleText || publicFooter.text}
      sloganEn={(footer as any).contactBubbleTextEn}
      logoUrl={(publicHeader as any).logoUrl || (publicFooter as any).logoUrl}
      email={(footer as any).contactBubbleEmail || profile.email}
      phone={(footer as any).contactBubblePhone || profile.phone}
      organizationId={site.organizationId}
      locale={profile.language === 'en' ? 'en' : 'fr'}
    />
  );

  if (slug === 'client') {
    return (
      <div className={`flex min-h-screen flex-col ${vielusos ? 'vielusos-site' : ''}`} style={publicSiteStyle(theme, vielusos)}>
        {fontHref && <link rel="stylesheet" href={fontHref} />}
        <style dangerouslySetInnerHTML={{ __html: `${brandCss(theme.primary)}${vielusosCss(vielusos)}` }} />
        <PublicHeader header={publicHeader} nav={nav} basePath={basePath} />
        <ClientAccessPage organizationId={site.organizationId} organizationName={site.name} locale={profile.language === 'en' ? 'en' : 'fr'} branded={vielusos} />
        <PublicFooter footer={publicFooter} orgId={site.organizationId} basePath={basePath} nav={nav} />
        {bubble}
      </div>
    );
  }

  if (slug === 'cgv' || slug === 'mentions-legales') {
    const isCgv = slug === 'cgv';
    return (
      <div className={`min-h-screen ${vielusos ? 'vielusos-site' : ''}`} style={publicSiteStyle(theme, vielusos)}>
        {fontHref && <link rel="stylesheet" href={fontHref} />}
        <style dangerouslySetInnerHTML={{ __html: `${brandCss(theme.primary)}${vielusosCss(vielusos)}` }} />
        <PublicHeader header={publicHeader} nav={nav} basePath={basePath} />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-extrabold">{isCgv ? 'Conditions générales' : 'Mentions légales'}</h1>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-600">{isCgv ? publicFooter.cgvContent : publicFooter.mentionsContent}</p>
        </main>
        <PublicFooter footer={publicFooter} orgId={site.organizationId} basePath={basePath} nav={nav} />
        {bubble}
      </div>
    );
  }

  if (slug === 'boutique' && !shopEnabled) notFound();

  const page = slug ? site.pages.find((p) => p.slug === slug) : site.pages.find((p) => p.isHome) || site.pages[0];
  if (!page) notFound();

  // Load products only when the page actually shows a shop block, and only when
  // the shop is enabled for this organization.
  const shopReady = Boolean(profile.stripeConnectReady);
  const hasShopBlock = page.blocks.some((b) => b.type === 'shop');
  const products = hasShopBlock && shopEnabled ? await loadShopProducts(site.organizationId) : [];

  return (
    <div className={`flex min-h-screen flex-col ${vielusos ? 'vielusos-site' : ''}`} style={publicSiteStyle(theme, vielusos)}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      {vielusos && <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@300;400;500&display=swap" />}
      <style dangerouslySetInnerHTML={{ __html: `${brandCss(theme.primary)}${vielusosCss(vielusos)}` }} />
      <PageViewTracker organizationId={site.organizationId} path={page.slug} />
      <PublicHeader header={publicHeader} nav={nav} basePath={basePath} />
      {vielusos && page.isHome && <VielusosHero title={site.name} config={(header as any).vielusosHero} />}
      {vielusos && (page.slug === 'bio' || page.slug === 'about') && <VielusosBio blocks={page.blocks as any[]} config={(header as any).vielusosBio} />}
      <main className="flex-1 py-8">
        {vielusos && (page.slug === 'bio' || page.slug === 'about') ? null : page.blocks.length === 0 ? (
          <p className="py-20 text-center text-gray-400">Cette page est vide.</p>
        ) : (
          page.blocks.map((b) => <PublicBlock key={b.id} type={b.type} content={b.content as any} style={b.style as any} basePath={basePath} organizationId={site.organizationId} products={b.type === 'shop' ? products : undefined} shopReady={b.type === 'shop' ? shopReady : undefined} />)
        )}
      </main>
      <PublicFooter footer={publicFooter} orgId={site.organizationId} basePath={basePath} nav={nav} />
      {bubble}
    </div>
  );
}

function VielusosBio({ blocks, config }: { blocks: any[]; config?: HeaderConfig['vielusosBio'] }) {
  const copy = blocks
    .flatMap((block) => {
      const content = (block?.content || {}) as Record<string, unknown>;
      return [content.text, content.body, content.description, content.subtitle];
    })
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 40)
    .filter((value) => !/(association|associatif|bénévole|bénévoles|don|adhérent|public accompagné|partenaires)/i.test(value))
    .map((value) => value.trim())
    .slice(0, 2);

  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-black/35 px-5 py-12 md:px-12 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.05fr_.95fr] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-white/55">{config?.eyebrow || 'VIELUSOS · ARTISTE'}</p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-6xl">{config?.title || 'À PROPOS'}</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-white/70 md:text-lg">
            {(config?.paragraphs?.filter(Boolean).length ? config.paragraphs : copy).length > 0 ? (config?.paragraphs?.filter(Boolean).length ? config.paragraphs : copy).map((text, index) => <p key={index}>{text}</p>) : (
              <>
                <p>VIELUSOS creates dark, cinematic music driven by a constant tension between fragility, power and light. Every release is conceived as a scene: an atmosphere, a voice, an image and an emotion that lingers after listening.</p>
                <p>Moving between introspective productions and rawer impulses, the project builds its world through contrast. Textures, silence and melody shape a distinctive signature where visual storytelling meets sound.</p>
                <p className="text-white/55">PRODUCTION · WRITING · ART DIRECTION</p>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.images?.[0] || '/vielusos/profile.jpg'} alt="VIELUSOS" className="col-span-2 aspect-[16/9] w-full rounded-2xl object-cover object-center shadow-2xl ring-1 ring-white/15" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.images?.[1] || '/vielusos/profile-2.png'} alt="" className="aspect-square w-full rounded-2xl object-cover shadow-xl ring-1 ring-white/15" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.images?.[2] || '/vielusos/angel-in-hell.png'} alt="" className="aspect-square w-full rounded-2xl object-cover shadow-xl ring-1 ring-white/15" />
        </div>
      </div>
    </section>
  );
}

function VielusosHero({ title, config }: { title: string; config?: HeaderConfig['vielusosHero'] }) {
  return (
    <section className="relative isolate aspect-video w-full overflow-hidden bg-[#08080c]" aria-label={title}>
      <video
        className="absolute inset-0 h-full w-full object-contain opacity-80"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={VIELUSOS_BRAND.backgroundUrl}
        aria-hidden="true"
      >
        <source src={config?.videoUrl || '/vielusos/banner.mp4'} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-[#08080c]" aria-hidden="true" />
      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="flex max-w-xl flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {config?.showLogo !== false && <img src={VIELUSOS_BRAND.logoUrl} alt="" className="mb-5 h-32 w-32 object-contain opacity-95 drop-shadow-[0_0_18px_rgba(255,255,255,.18)] md:h-44 md:w-44" />}
          {config?.showName !== false && <p className="text-4xl font-light uppercase leading-none tracking-[0.32em] text-white md:text-6xl" style={{ fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>{title.toUpperCase()}</p>}
          {config?.showTagline !== false && <h1 className="mt-5 text-lg font-light uppercase tracking-[0.24em] text-white/85 md:text-2xl" style={{ fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>POWER OF EMOTION</h1>}
        </div>
      </div>
    </section>
  );
}

function publicSiteStyle(theme: any, vielusos: boolean): React.CSSProperties {
  const base = themeStyle(theme);
  if (!vielusos) return base;
  return {
    ...base,
    backgroundColor: VIELUSOS_BRAND.surface,
    backgroundImage: `linear-gradient(rgba(8, 8, 12, .72), rgba(8, 8, 12, .72)), url(${VIELUSOS_BRAND.backgroundUrl})`,
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    color: '#f7f7fb',
  };
}

function vielusosCss(enabled: boolean): string {
  if (!enabled) return '';
  return `
.vielusos-site main { background: transparent; font-family: "Montserrat", "Helvetica Neue", Arial, sans-serif; font-weight: 300; }
.vielusos-site .public-block-shell .text-gray-900, .vielusos-site .public-block-shell .text-gray-950 { color: #f7f7fb !important; }
.vielusos-site .public-block-shell .text-gray-600, .vielusos-site .public-block-shell .text-gray-500 { color: rgba(247,247,251,.72) !important; }
.vielusos-site .public-block-shell .bg-white { background: rgba(10,10,15,.68) !important; }
.vielusos-site .public-block-shell .ring-gray-100 { --tw-ring-color: rgba(255,255,255,.18) !important; }
.vielusos-site .public-header-shell, .vielusos-site .public-footer-shell { background: #0b0b10 !important; }
.vielusos-site main h2 { font-family: "Cormorant Garamond", "Times New Roman", serif !important; font-size: clamp(1.75rem, 3vw, 2.5rem) !important; line-height: 1 !important; font-weight: 300 !important; letter-spacing: .18em !important; text-transform: uppercase !important; }
.vielusos-site .vielusos-fluid { max-width: none !important; }
.vielusos-site .vielusos-media-shell { padding-left: clamp(1.25rem, 4vw, 3rem) !important; padding-right: clamp(1.25rem, 4vw, 3rem) !important; }
@media (min-width: 768px) {
  .vielusos-site .vielusos-player-card, .vielusos-site .vielusos-video-card { width: calc((100% - 3rem) / 4) !important; max-width: none !important; }
}
`;
}

function ClientAccessPage({ organizationId, organizationName, locale, branded = false }: { organizationId: string; organizationName: string; locale: 'fr' | 'en'; branded?: boolean }) {
  const en = locale === 'en';
  return (
    <main className={`flex-1 px-4 py-12 ${branded ? 'bg-transparent' : 'bg-gray-50'}`}>
      <section className={`mx-auto max-w-2xl rounded-3xl p-5 text-center shadow-sm sm:p-7 md:rounded-[2rem] md:p-10 ${branded ? 'bg-[#0b0b10]/55 text-[#f7f7fb] ring-1 ring-white/15 backdrop-blur-xl' : 'bg-white ring-1 ring-gray-200'}`}>
        <p className={`text-sm font-bold uppercase tracking-[0.2em] ${branded ? 'text-[#d33f5c]' : 'text-[var(--brand)]'}`}>
          {branded ? 'Vielusos · espace client' : en ? 'Customer area' : 'Espace client'}
        </p>
        <h1 className={`mt-3 text-2xl font-black sm:text-3xl md:text-4xl ${branded ? 'text-white' : 'text-gray-900'}`}>
          {en ? 'Sign in or create your customer account' : 'Connexion ou inscription client'}
        </h1>
        <p className={`mx-auto mt-4 max-w-xl ${branded ? 'text-white/65' : 'text-gray-600'}`}>
          {en
            ? `Use your email to sign in or create your customer profile on ${organizationName}'s website.`
            : `Utilisez votre email pour vous connecter ou créer votre profil client sur le site de ${organizationName}.`}
        </p>
        <CustomerAccessForm organizationId={organizationId} organizationName={organizationName} locale={locale} branded={branded} />
      </section>
    </main>
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
