/**
 * The VIELUSOS site has a deliberately art-directed presentation that differs
 * from the general EasyAsso templates. Keep this in one place so the exception
 * never leaks into another tenant's public site or dashboard.
 */
export const VIELUSOS_SUBDOMAIN = "ruche-dpjdd9ne";

export const VIELUSOS_BRAND = {
  logoUrl: "/vielusos/logo.png",
  backgroundUrl: "/vielusos/background.png",
  accent: "#f2f2f2",
  surface: "#0b0b10",
};

export const VIELUSOS_FONT_STACK =
  '"Montserrat", "Helvetica Neue", Arial, sans-serif';
export const VIELUSOS_TITLE_FONT_STACK =
  '"Cormorant Garamond", "Times New Roman", serif';

export const VIELUSOS_SITE_CSS = `
html:has(.vielusos-site), body:has(.vielusos-site) { min-height: 100%; background: #0b0b10 !important; }
.vielusos-site { min-height: 100dvh; background-color: #0b0b10 !important; font-family: ${VIELUSOS_FONT_STACK} !important; font-weight: 300; }
.vielusos-site *, .vielusos-site *::before, .vielusos-site *::after { font-family: ${VIELUSOS_FONT_STACK} !important; }
.vielusos-site main { background: transparent; font-weight: 300; }
.vielusos-site .public-block-shell .text-gray-900, .vielusos-site .public-block-shell .text-gray-950 { color: #f7f7fb !important; }
.vielusos-site .public-block-shell .text-gray-600, .vielusos-site .public-block-shell .text-gray-500 { color: rgba(247,247,251,.72) !important; }
.vielusos-site .public-block-shell .bg-white { background: rgba(10,10,15,.68) !important; }
.vielusos-site .public-block-shell .ring-gray-100 { --tw-ring-color: rgba(255,255,255,.18) !important; }
.vielusos-site .public-header-shell:not(.public-header-overlay), .vielusos-site .public-footer-shell { background: #0b0b10 !important; }
.vielusos-site .public-header-overlay { background: rgba(5,5,9,.06) !important; }
.vielusos-site .public-footer-shell { margin-bottom: 0 !important; }
.vielusos-site .vielusos-action {
  background: rgba(0,0,0,.18) !important;
  color: #fff !important;
  border: 1px solid rgba(255,255,255,.45) !important;
  border-radius: 9999px !important;
  padding: .75rem 1.75rem !important;
  font-size: .6875rem !important;
  line-height: 1.2 !important;
  font-weight: 600 !important;
  letter-spacing: .24em !important;
  text-transform: uppercase !important;
  box-shadow: none !important;
  backdrop-filter: blur(6px);
}
.vielusos-site .vielusos-action:hover { background: #fff !important; color: #09090d !important; border-color: #fff !important; }
.vielusos-site .vielusos-action:disabled { opacity: .45 !important; }
.vielusos-site .vielusos-title, .vielusos-site main :where(h1, h2, h3, h4, h5, h6) { font-family: ${VIELUSOS_TITLE_FONT_STACK} !important; }
.vielusos-site .vielusos-track-title { font-family: ${VIELUSOS_FONT_STACK} !important; font-weight: 600 !important; letter-spacing: .24em !important; text-transform: uppercase !important; }
.vielusos-site .vielusos-artist-name { font-family: ${VIELUSOS_TITLE_FONT_STACK} !important; font-weight: 300 !important; letter-spacing: .18em !important; text-transform: uppercase !important; }
.vielusos-site main h2 { font-size: clamp(1.75rem, 3vw, 2.5rem) !important; line-height: 1 !important; font-weight: 300 !important; letter-spacing: .18em !important; text-transform: uppercase !important; }
.vielusos-site .vielusos-fluid { width: 80% !important; max-width: none !important; padding-left: 0 !important; padding-right: 0 !important; }
.vielusos-site .vielusos-media-shell { padding-left: 0 !important; padding-right: 0 !important; }
@media (min-width: 768px) {
  .vielusos-site .vielusos-player-card, .vielusos-site .vielusos-video-card { width: calc((100% - 3rem) / 4) !important; max-width: none !important; }
}
@media (max-width: 640px) {
  .vielusos-site .public-footer-grid { justify-items: center; text-align: center; }
  .vielusos-site .public-footer-grid > div { display: flex; width: 100%; flex-direction: column; align-items: center; }
  .vielusos-site .public-footer-grid ul { align-items: center; justify-content: center; }
  .vielusos-site .public-footer-bottom { align-items: center !important; justify-content: center !important; text-align: center; }
  .vielusos-site .public-footer-bottom > div { flex-wrap: wrap; justify-content: center; }
}
`;

export function isVielusosSite(
  site?: { subdomain?: string | null } | null,
): boolean {
  return site?.subdomain === VIELUSOS_SUBDOMAIN;
}

export function vielusosStoredLogoUrl(
  site?: { header?: unknown; footer?: unknown } | null,
): string {
  const header = (site?.header as any) || {};
  const footer = (site?.footer as any) || {};
  const saved = [header.vielusosLogoUrl, footer.vielusosLogoUrl].find(
    (value) => typeof value === "string" && value.trim(),
  );
  return saved ? String(saved) : VIELUSOS_BRAND.logoUrl;
}

export function vielusosLogoUrl(
  site?: { header?: unknown; footer?: unknown } | null,
): string {
  const saved = vielusosStoredLogoUrl(site);
  return saved.startsWith("data:image/") ? "/api/vielusos/logo" : saved;
}
