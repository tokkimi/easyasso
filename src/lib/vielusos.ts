/**
 * The VIELUSOS site has a deliberately art-directed presentation that differs
 * from the general EasyAsso templates. Keep this in one place so the exception
 * never leaks into another tenant's public site or dashboard.
 */
export const VIELUSOS_SUBDOMAIN = 'ruche-dpjdd9ne';

export const VIELUSOS_BRAND = {
  logoUrl: '/vielusos/logo.png',
  backgroundUrl: '/vielusos/background.png',
  accent: '#d33f5c',
  surface: '#0b0b10',
};

export function isVielusosSite(site?: { subdomain?: string | null } | null): boolean {
  return site?.subdomain === VIELUSOS_SUBDOMAIN;
}
