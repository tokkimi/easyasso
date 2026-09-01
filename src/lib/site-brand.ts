/**
 * Small brand abstraction shared by the public renderer, the editor preview and
 * the dashboard chrome. It lets IMPACT reuse the exact same structural layout as
 * VIELUSOS while keeping each brand's art direction (colours, fonts, CSS,
 * bespoke sections) fully separate. VIELUSOS values are returned unchanged, so
 * its behaviour is identical to before this file existed.
 */
import {
  isVielusosSite,
  VIELUSOS_BRAND,
  VIELUSOS_SITE_CSS,
} from './vielusos';
import {
  isImpactSite,
  IMPACT_BRAND,
  IMPACT_SITE_CSS,
  IMPACT_FONTS_HREF,
} from './impact';

export type BrandKey = 'vielusos' | 'impact';

export interface SiteBrand {
  key: BrandKey;
  /** logo/background/accent/surface tokens */
  brand: { logoUrl: string; backgroundUrl: string; accent: string; surface: string };
  /** scoped CSS injected on public + editor surfaces */
  css: string;
  /** class toggled on the public/editor site wrapper */
  siteClass: string;
  /** class toggled on the dashboard content wrapper */
  dashboardContentClass: string;
  /** class toggled on the editor form surface */
  editorSurfaceClass: string;
  /** extra Google Fonts stylesheet, if the brand needs one */
  fontsHref: string | null;
  /** default TikTok handle used by the social/instagram block */
  tiktokUsername: string;
  /** uppercased display name transform applied to the brand name */
  displayName: (name: string) => string;
}

const VIELUSOS_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@300;400;500&display=swap';

const CONFIG: Record<BrandKey, Omit<SiteBrand, 'key'>> = {
  vielusos: {
    brand: VIELUSOS_BRAND,
    css: VIELUSOS_SITE_CSS,
    siteClass: 'vielusos-site',
    dashboardContentClass: 'vielusos-dashboard-content',
    editorSurfaceClass: 'vielusos-editor-surface',
    fontsHref: VIELUSOS_FONTS_HREF,
    tiktokUsername: 'vielusos',
    displayName: (name) => name.toUpperCase(),
  },
  impact: {
    brand: { logoUrl: IMPACT_BRAND.logoUrl, backgroundUrl: IMPACT_BRAND.backgroundUrl, accent: IMPACT_BRAND.accent, surface: IMPACT_BRAND.surface },
    css: IMPACT_SITE_CSS,
    siteClass: 'impact-site',
    dashboardContentClass: 'impact-dashboard-content',
    editorSurfaceClass: 'impact-editor-surface',
    fontsHref: IMPACT_FONTS_HREF,
    tiktokUsername: 'impactdj_raw',
    displayName: (name) => name.toUpperCase(),
  },
};

/** Resolve the brand key for a site, or null for a normal EasyAsso tenant. */
export function siteBrandKey(site?: { subdomain?: string | null } | null): BrandKey | null {
  if (isVielusosSite(site)) return 'vielusos';
  if (isImpactSite(site)) return 'impact';
  return null;
}

/** Full brand config for a site, or null for a normal EasyAsso tenant. */
export function siteBrand(site?: { subdomain?: string | null } | null): SiteBrand | null {
  const key = siteBrandKey(site);
  return key ? { key, ...CONFIG[key] } : null;
}

/** True for any art-directed artist profile (VIELUSOS or IMPACT). */
export function isArtistSite(site?: { subdomain?: string | null } | null): boolean {
  return siteBrandKey(site) !== null;
}
