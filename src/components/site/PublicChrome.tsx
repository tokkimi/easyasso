'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Facebook, Instagram, Linkedin, Youtube, Music2 } from 'lucide-react';
import type { HeaderConfig, FooterConfig, ButtonConfig } from '@/lib/blocks';
import { NewsletterForm } from './NewsletterForm';

interface NavItem { title: string; slug: string; isHome: boolean }
const SOCIAL_LABELS = new Set(['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'x']);
const isSocialColumn = (column: FooterConfig['columns'][number]) => column.links.length > 0 && column.links.every((link) => SOCIAL_LABELS.has(link.label.toLowerCase()));
const logoFrameClass = 'inline-flex max-w-[220px] items-center rounded-xl bg-white/90 p-1.5 shadow-sm ring-1 ring-black/5 sm:max-w-[280px]';
const headerLogoClass = 'max-h-12 w-auto max-w-full object-contain';
const footerLogoClass = 'max-h-16 w-auto max-w-full object-contain';

function SocialMark({ label }: { label: string }) {
  const key = label.toLowerCase();
  if (key === 'facebook') return <Facebook className="h-6 w-6" />;
  if (key === 'instagram') return <Instagram className="h-6 w-6" />;
  if (key === 'linkedin') return <Linkedin className="h-6 w-6" />;
  if (key === 'youtube') return <Youtube className="h-6 w-6" />;
  if (key === 'tiktok') return <Music2 className="h-6 w-6" />;
  if (key === 'x') return <span className="text-xl font-black leading-none">𝕏</span>;
  return null;
}

export function PublicHeader({
  header, nav, basePath,
}: { header: HeaderConfig; nav: NavItem[]; basePath: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cta: ButtonConfig | undefined = header.cta;
  const link = (slug: string, isHome: boolean) => (isHome ? basePath || '/' : `${basePath}/${slug}`);
  return (
    <header
      style={{ background: header.background, color: header.textColor }}
      className={`public-header-shell ${header.sticky ? 'sticky top-0 z-40' : ''} border-b border-black/5 backdrop-blur`}
    >
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href={basePath || '/'} className="flex min-w-0 flex-1 items-center text-lg font-extrabold">
          {header.logoUrl ? (
            <span className={logoFrameClass}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={header.logoUrl} alt={header.logoText} className={headerLogoClass} />
            </span>
          ) : (
            <span className="truncate">{header.logoText}</span>
          )}
        </Link>
        <div className="public-header-desktop items-center gap-4">
          {header.showNav && (
            <nav className="flex items-center gap-4 text-sm font-medium">
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
        <button type="button" onClick={() => setMenuOpen((open) => !open)} className="public-header-menu-button touch-target shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white/80" aria-expanded={menuOpen} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {menuOpen && (
          <div className="public-header-dropdown absolute left-3 right-3 top-[calc(100%+0.5rem)] z-50 rounded-2xl bg-white p-3 text-gray-900 shadow-2xl ring-1 ring-black/10">
            {header.showNav && <nav className="flex flex-col">{nav.map((p) => <Link key={p.slug} href={link(p.slug, p.isHome)} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-gray-50">{p.title}</Link>)}</nav>}
            {cta && <a href={cta.href.startsWith('/') ? `${basePath}${cta.href}` : cta.href} onClick={() => setMenuOpen(false)} style={{ background: cta.color, color: '#fff' }} className="mt-2 flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold">{cta.text}</a>}
          </div>
        )}
      </div>
    </header>
  );
}

export function PublicFooter({
  footer, orgId, basePath, nav,
}: { footer: FooterConfig; orgId: string; basePath: string; nav: NavItem[] }) {
  return (
    <footer style={{ background: footer.background, color: footer.textColor }} className="public-footer-shell mt-10">
      <div className="public-footer-grid mx-auto grid max-w-5xl gap-8 px-4 py-12">
        <div>
          <div className="text-lg font-extrabold">
            {footer.logoUrl ? (
              <span className={logoFrameClass}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={footer.logoUrl} alt={footer.logoText} className={footerLogoClass} />
              </span>
            ) : footer.logoText}
          </div>
          <p className="mt-3 text-sm opacity-80">{footer.text}</p>
        </div>

        {footer.columns?.map((col, i) => (
          <div key={i}>
            <p className="text-sm font-bold uppercase tracking-wide opacity-90">{col.title}</p>
            <ul className={`mt-3 text-sm opacity-80 ${isSocialColumn(col) ? 'flex flex-wrap gap-2' : 'space-y-2'}`}>
              {col.links.map((l, j) => (
                <li key={j}>
                  <a href={l.href.startsWith('/') ? `${basePath}${l.href}` : l.href} target={isSocialColumn(col) ? '_blank' : undefined} rel={isSocialColumn(col) ? 'noreferrer' : undefined} title={l.label} aria-label={l.label} className={isSocialColumn(col) ? 'grid h-11 w-11 place-items-center rounded-xl border border-current/20 transition hover:bg-white/10 hover:opacity-100' : 'hover:opacity-100'}>
                    {isSocialColumn(col) ? <SocialMark label={l.label} /> : l.label}
                  </a>
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
        <div className="public-footer-bottom mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs opacity-70">
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
