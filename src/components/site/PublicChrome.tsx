import Link from 'next/link';
import type { HeaderConfig, FooterConfig, ButtonConfig } from '@/lib/blocks';
import { NewsletterForm } from './NewsletterForm';

interface NavItem { title: string; slug: string; isHome: boolean }

export function PublicHeader({
  header, nav, basePath,
}: { header: HeaderConfig; nav: NavItem[]; basePath: string }) {
  const cta: ButtonConfig | undefined = header.cta;
  const link = (slug: string, isHome: boolean) => (isHome ? basePath || '/' : `${basePath}/${slug}`);
  return (
    <header
      style={{ background: header.background, color: header.textColor }}
      className={`${header.sticky ? 'sticky top-0 z-40' : ''} border-b border-black/5 backdrop-blur`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href={basePath || '/'} className="flex items-center gap-2 text-lg font-extrabold">
          {header.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={header.logoUrl} alt={header.logoText} className="h-8 w-auto" />
          ) : (
            header.logoText
          )}
        </Link>
        <div className="flex items-center gap-4">
          {header.showNav && (
            <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
              {nav.map((p) => (
                <Link key={p.slug} href={link(p.slug, p.isHome)} className="opacity-80 hover:opacity-100">{p.title}</Link>
              ))}
            </nav>
          )}
          {cta && (
            <a
              href={cta.href.startsWith('/') ? `${basePath}${cta.href}` : cta.href}
              style={cta.variant === 'solid'
                ? { background: cta.color, color: '#fff' }
                : { border: `2px solid ${cta.color}`, color: cta.color }}
              className="rounded-lg px-4 py-2 text-sm font-semibold"
            >
              {cta.text}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter({
  footer, orgId, basePath, nav,
}: { footer: FooterConfig; orgId: string; basePath: string; nav: NavItem[] }) {
  return (
    <footer style={{ background: footer.background, color: footer.textColor }} className="mt-10">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="text-lg font-extrabold">
            {footer.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={footer.logoUrl} alt={footer.logoText} className="h-8 w-auto" />
            ) : footer.logoText}
          </div>
          <p className="mt-3 text-sm opacity-80">{footer.text}</p>
        </div>

        {footer.columns?.map((col, i) => (
          <div key={i}>
            <p className="text-sm font-bold uppercase tracking-wide opacity-90">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm opacity-80">
              {col.links.map((l, j) => (
                <li key={j}>
                  <a href={l.href.startsWith('/') ? `${basePath}${l.href}` : l.href} className="hover:opacity-100">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {footer.showNewsletter && (
          <div>
            <p className="text-sm font-bold uppercase tracking-wide opacity-90">{footer.newsletterTitle}</p>
            <div className="mt-3"><NewsletterForm orgId={orgId} /></div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs opacity-70">
          <span>{footer.allRightsText}</span>
          <div className="flex gap-4">
            {footer.showCgv && <a href={`${basePath}/cgv`} className="hover:opacity-100">CGV</a>}
            {footer.showMentions && <a href={`${basePath}/mentions-legales`} className="hover:opacity-100">Mentions légales</a>}
          </div>
        </div>
      </div>
    </footer>
  );
}
