/**
 * IMPACT is a second art-directed artist profile, built as a parallel to
 * VIELUSOS. Its direction artistique is deliberately different: electric-blue
 * neon, glass/translucent surfaces and a raw techno mood. Keep every IMPACT
 * exception in this one file so it never leaks into VIELUSOS or any other
 * EasyAsso tenant.
 */
export const IMPACT_SUBDOMAIN = 'impact-djraw';

// The Vercel deployment domain this profile answers on (handled in middleware).
export const IMPACT_HOST = 'impact-raw.vercel.app';

// Every host that must resolve to the IMPACT site. The public custom domain and
// the Vercel alias both map here — matched independently of the DB customDomain
// field so no re-seed is needed to add a domain. Only IMPACT is affected;
// VIELUSOS and every other tenant are untouched.
export const IMPACT_DOMAINS = [
  IMPACT_HOST,
  'impactdj-raw.com',
  'www.impactdj-raw.com',
];

// True when a request host (or its apex, minus a leading www.) is an IMPACT domain.
export function isImpactHost(host?: string | null): boolean {
  if (!host) return false;
  const h = host.split(':')[0].toLowerCase();
  const apex = h.replace(/^www\./, '');
  return IMPACT_DOMAINS.some((d) => d === h || d === apex || d === `www.${apex}`);
}

// IMPACT owns this identity. Nothing shown to the artist or the public uses an
// EasyAsso address. The public contact email remains separate from the login.
export const IMPACT_LOGIN_EMAIL = 'contact@skorm-agency.com';
export const IMPACT_LOGIN_PASSWORD = 'impact1234';
export const IMPACT_CONTACT_EMAIL = 'impact.djoff@gmail.com';

export const IMPACT_SOCIALS = {
  instagram: 'https://www.instagram.com/impactdj_raw',
  tiktok: 'https://www.tiktok.com/@impactdj_raw',
  spotify: 'https://open.spotify.com/artist/3AiyQHD9YDWhPX6rKJLkXZ',
  soundcloud: 'https://on.soundcloud.com/gFkxJhH119PUD8bvJG',
  deezer: 'https://link.deezer.com/s/32FJ0eJdg95ujwvQN8jFV',
  youtube: 'https://www.youtube.com/channel/UCdqrxBgSQ7ReX0FmaQBIAfw',
  applemusic: 'https://music.apple.com/fr/artist/impact/1815586907',
  email: `mailto:${IMPACT_CONTACT_EMAIL}`,
} as const;

export const IMPACT_TRACKS = [
  { title: 'YOU MADE IT', artist: 'IMPACT', year: '2026', thumbnail: '/impact/releases/you-made-it.jpg', url: 'https://open.spotify.com/track/00Wuied8VMJHv1FQEvQgTe', source: 'Spotify' },
  { title: 'MAYDAY', artist: 'IMPACT', year: '2026', thumbnail: '/impact/releases/mayday.jpg', url: 'https://open.spotify.com/intl-fr/album/4OZIoOOEWlnUvmux0RcmLD', source: 'Spotify' },
  { title: 'LOCK THE DOOR', artist: 'IMPACT', year: '', thumbnail: '/impact/releases/lock-the-door.jpg', url: 'https://soundcloud.com/impact-518694200/lock-the-door-vf-2', source: 'SoundCloud' },
  { title: 'POWER OF DESTRUCTION', artist: 'IMPACT', year: '', thumbnail: '/impact/releases/power-of-destruction.jpg', url: 'https://soundcloud.com/impact-518694200/power-of-destruction', source: 'SoundCloud' },
] as const;

export const IMPACT_VIDEOS = Array.from({ length: 10 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  return {
    title: `IMPACT · LIVE ESKAPE ${number}`,
    url: `/impact/videos/impact-live-${number}.mp4`,
    poster: `/impact/videos/posters/impact-live-${number}.jpg`,
  };
});

// Favicon / tab icon for IMPACT: the neon-blue mask. Drop the file at
// public/impact/favicon.png (transparent PNG, ~512px). Until it exists the
// wordmark logo.svg is listed as a graceful fallback so the tab is never blank.
export const IMPACT_FAVICON_URL = '/impact/favicon.png';
export const IMPACT_ICONS = [{ url: IMPACT_FAVICON_URL }, { url: '/impact/logo.svg' }];

export const IMPACT_BRAND = {
  logoUrl: '/impact/logo.svg',
  backgroundUrl: '/impact/background.svg',
  accent: '#2f6bff', // bleu électrique
  neon: '#4cc9ff', // halo néon cyan-bleu
  surface: '#05070f', // noir bleuté
};

export const IMPACT_SITE_CSS = `
html:has(.impact-site), body:has(.impact-site) { min-height: 100%; background: #02030a !important; }
.impact-site { min-height: 100dvh; color: #eaf2ff !important; background-color: #02030a !important; background-image: radial-gradient(70% 44% at 50% -8%, rgba(47,107,255,.28), transparent 68%), radial-gradient(36% 24% at 88% 38%, rgba(76,201,255,.12), transparent 72%) !important; }
.impact-site[data-impact-theme="light"] { color: #07101f !important; background-color: #fff !important; background-image: radial-gradient(44% 28% at 82% 4%, rgba(47,107,255,.12), transparent 75%), radial-gradient(32% 20% at 8% 38%, rgba(76,201,255,.09), transparent 72%) !important; }
.impact-site main { background: transparent; font-family: "Inter", "Helvetica Neue", Arial, sans-serif; font-weight: 300; }
.impact-site .public-block-shell .text-gray-900, .impact-site .public-block-shell .text-gray-950 { color: #eaf2ff !important; }
.impact-site .public-block-shell .text-gray-600, .impact-site .public-block-shell .text-gray-500 { color: rgba(234,242,255,.66) !important; }
.impact-site .public-block-shell .bg-white { background: rgba(9,13,26,.55) !important; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
.impact-site .public-block-shell .ring-gray-100 { --tw-ring-color: rgba(76,201,255,.22) !important; }
.impact-site[data-impact-theme="light"] .public-block-shell .text-gray-900, .impact-site[data-impact-theme="light"] .public-block-shell .text-gray-950 { color: #07101f !important; }
.impact-site[data-impact-theme="light"] .public-block-shell .text-gray-600, .impact-site[data-impact-theme="light"] .public-block-shell .text-gray-500 { color: rgba(7,16,31,.64) !important; }
.impact-site[data-impact-theme="light"] .public-block-shell .bg-white { background: rgba(255,255,255,.58) !important; border: 1px solid rgba(47,107,255,.13); box-shadow: 0 20px 60px rgba(31,80,180,.08) !important; }
.impact-site .public-header-shell, .impact-site .public-footer-shell { background: rgba(2,3,10,.72) !important; color: #eaf2ff !important; -webkit-backdrop-filter: blur(22px); backdrop-filter: blur(22px); }
.impact-site[data-impact-theme="light"] .public-header-shell, .impact-site[data-impact-theme="light"] .public-footer-shell { background: rgba(255,255,255,.76) !important; color: #07101f !important; border-color: rgba(47,107,255,.14) !important; box-shadow: 0 12px 38px rgba(31,80,180,.06); }
.impact-site .public-footer-shell { margin-bottom: 0 !important; border-top: 1px solid rgba(76,201,255,.18); }
.impact-site .public-header-shell { border-bottom: 1px solid rgba(76,201,255,.18); }
.impact-site main h2 { font-family: "Space Grotesk", "Helvetica Neue", Arial, sans-serif !important; font-size: clamp(1.75rem, 3vw, 2.6rem) !important; line-height: 1.02 !important; font-weight: 700 !important; letter-spacing: .16em !important; text-transform: uppercase !important; color: #eaf2ff !important; text-shadow: 0 0 22px rgba(47,107,255,.55), 0 0 42px rgba(76,201,255,.25) !important; }
.impact-site[data-impact-theme="light"] main h2 { color: #07101f !important; text-shadow: 0 0 24px rgba(47,107,255,.22) !important; }
/* the shared block components emit these utility class names for every brand */
.impact-site .vielusos-fluid { width: 90% !important; max-width: none !important; padding-left: 0 !important; padding-right: 0 !important; }
.impact-site .vielusos-media-shell { padding-left: 0 !important; padding-right: 0 !important; }
.impact-site .public-social-block a { color: rgba(234,242,255,.7) !important; border-color: rgba(76,201,255,.28) !important; }
.impact-site .public-social-block a:hover { color: #ffffff !important; background: rgba(47,107,255,.12); border-color: rgba(76,201,255,.65) !important; box-shadow: 0 0 18px rgba(47,107,255,.45); }
.impact-site[data-impact-theme="light"] .public-social-block a { color: rgba(7,16,31,.7) !important; }
.impact-site .vielusos-media-shell [style*="box-shadow"] { box-shadow: 0 18px 40px -18px rgba(47,107,255,.55) !important; }
.impact-site .public-block-shell a[style*="background"], .impact-site .public-block-shell button[style*="background"] { box-shadow: 0 0 26px rgba(47,107,255,.45); }
.impact-site[data-impact-theme="light"] .impact-header-dropdown { background: rgba(255,255,255,.78) !important; border-color: rgba(47,107,255,.18) !important; color: #07101f !important; box-shadow: 0 24px 70px rgba(31,80,180,.15) !important; }
.impact-site[data-impact-theme="light"] .impact-header-dropdown img { filter: none !important; }
.impact-site[data-impact-theme="light"] .impact-header-dropdown a:not([style]) { color: #07101f !important; border-color: rgba(47,107,255,.12) !important; }
.impact-site[data-impact-theme="light"] .public-header-menu-button { border-color: rgba(47,107,255,.24) !important; color: #07101f !important; background: rgba(255,255,255,.45) !important; }
.impact-site[data-impact-theme="light"] .impact-theme-toggle { border-color: rgba(47,107,255,.18) !important; background: rgba(47,107,255,.06); }

.impact-hero { height: clamp(25rem, 62vh, 44rem); background: #02030a; }
.impact-hero-light-media { display: none; }
.impact-hero-dark-media { display: block; filter: brightness(.48) saturate(1.32) contrast(1.18); }
.impact-hero-overlay { background: radial-gradient(55% 50% at 50% 42%, rgba(47,107,255,.12), transparent 70%), linear-gradient(to bottom, rgba(2,3,10,.25), rgba(2,3,10,.58) 68%, #02030a); }
.impact-hero-content { display: none !important; }
.impact-hero-logo { filter: drop-shadow(0 0 24px rgba(47,107,255,.7)); }
.impact-hero-name { color: #fff; text-shadow: 0 0 26px rgba(47,107,255,.72), 0 0 52px rgba(76,201,255,.34); }
.impact-hero-tagline { color: #9dc7ff; }
.impact-site[data-impact-theme="light"] .impact-hero { background: #fff; }
.impact-site[data-impact-theme="light"] .impact-hero-dark-media { display: none; }
.impact-site[data-impact-theme="light"] .impact-hero-light-media { display: block; filter: saturate(.9) contrast(1.04); opacity: .62; }
.impact-site[data-impact-theme="light"] .impact-hero-overlay { background: radial-gradient(45% 42% at 50% 42%, rgba(255,255,255,.14), transparent 70%), linear-gradient(to bottom, rgba(255,255,255,.18), rgba(255,255,255,.68) 72%, #fff); }
.impact-site[data-impact-theme="light"] .impact-hero-content { display: flex !important; }
.impact-site[data-impact-theme="light"] .impact-hero-name { color: #07101f; text-shadow: 0 0 28px rgba(47,107,255,.32); }
.impact-site[data-impact-theme="light"] .impact-hero-tagline { color: #174dbd; }

.impact-track-heading { font-size: clamp(1.35rem, 2.1vw, 2rem) !important; letter-spacing: .1em !important; text-shadow: none !important; }
.impact-track-rail { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 0 2px 10px; scrollbar-width: none; }
.impact-track-rail::-webkit-scrollbar { display: none; }
.impact-track-card { width: clamp(17rem, 24vw, 23rem); overflow: hidden; border-radius: 14px; color: #eef4ff; background: rgba(6,8,16,.74); border: 1px solid rgba(255,255,255,.12); box-shadow: 0 18px 50px rgba(0,0,0,.28); transition: transform .25s ease, border-color .25s ease; }
.impact-track-card:hover { transform: translateY(-3px); border-color: rgba(76,201,255,.48); }
.impact-track-artwork { position: relative; display: grid; aspect-ratio: 16/9; place-items: center; overflow: hidden; background: #090b12; }
.impact-track-artwork img { position: absolute; inset: 0; height: 100%; width: 100%; object-fit: contain; }
.impact-track-play { position: absolute; left: 50%; top: 50%; display: grid; height: 48px; width: 48px; transform: translate(-50%,-50%); place-items: center; border-radius: 999px; color: #fff; background: #2f6bff; box-shadow: 0 0 0 1px rgba(255,255,255,.2), 0 0 28px rgba(47,107,255,.62); }
.impact-track-meta { min-height: 74px; padding: 15px 16px; border-top: 1px solid rgba(255,255,255,.08); }
.impact-track-arrow { position: absolute; top: 50%; z-index: 10; display: grid; height: 34px; width: 34px; transform: translateY(-50%); place-items: center; border: 1px solid rgba(255,255,255,.13); border-radius: 999px; color: #fff; background: rgba(0,0,0,.62); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.impact-site[data-impact-theme="light"] .impact-track-card { color: #07101f; background: rgba(255,255,255,.64); border-color: rgba(47,107,255,.16); box-shadow: 0 20px 55px rgba(31,80,180,.09); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); }
.impact-site[data-impact-theme="light"] .impact-track-artwork { background: rgba(230,239,255,.54); }
.impact-site[data-impact-theme="light"] .impact-track-meta { border-color: rgba(47,107,255,.1); }
.impact-site[data-impact-theme="light"] .impact-track-arrow { color: #07101f; border-color: rgba(47,107,255,.18); background: rgba(255,255,255,.68); }

.impact-gallery-grid { width: 90%; margin: 0 auto; columns: 3; column-gap: 16px; }
.impact-gallery-frame { break-inside: avoid; margin: 0 0 16px; overflow: hidden; border-radius: 16px; background: #fff; border: 1px solid rgba(76,201,255,.22); box-shadow: 0 18px 55px rgba(0,0,0,.24); }
.impact-gallery-frame img { display: block; width: 100%; height: auto; object-fit: contain; }
.impact-site[data-impact-theme="light"] .impact-gallery-frame { border-color: rgba(47,107,255,.14); box-shadow: 0 20px 55px rgba(31,80,180,.1); }
.impact-bio-photo { background: #fff; box-shadow: 0 18px 50px -18px rgba(47,107,255,.58); outline: 1px solid rgba(76,201,255,.24); }
.impact-site[data-impact-theme="light"] section[data-no-translate] { background: rgba(255,255,255,.58) !important; border-color: rgba(47,107,255,.14) !important; }
.impact-site[data-impact-theme="light"] section[data-no-translate] h2, .impact-site[data-impact-theme="light"] section[data-no-translate] p { color: #07101f !important; text-shadow: none !important; }
/* IMPACT listening / social icons: a single monochrome row (blue glow),
   horizontal-scrollable on every width including mobile — no platform colours,
   no wrapping. Black in light mode, white in dark mode. */
.impact-site .streaming-links-row, .impact-site .public-social-block {
  flex-wrap: nowrap !important;
  justify-content: flex-start !important;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 6px;
}
.impact-site .streaming-links-row::-webkit-scrollbar, .impact-site .public-social-block::-webkit-scrollbar { display: none; }
.impact-site .streaming-links-row > a, .impact-site .public-social-block > a { flex: 0 0 auto; scroll-snap-align: start; }
/* dark (default): white icons + blue glow */
.impact-site .streaming-links-row a { color: #ffffff !important; text-shadow: 0 0 12px rgba(47,107,255,.55); }
.impact-site .streaming-links-row a span { color: inherit !important; }
.impact-site .public-social-block a { color: #ffffff !important; border-color: rgba(76,201,255,.3) !important; }
.impact-site .streaming-links-row a svg,
.impact-site .streaming-links-row a img,
.impact-site .streaming-links-row a span[style],
.impact-site .public-social-block a svg,
.impact-site .public-social-block a img { filter: brightness(0) invert(1) drop-shadow(0 0 7px rgba(47,107,255,.9)) !important; }
/* light: black icons + blue glow */
.impact-site[data-impact-theme="light"] .streaming-links-row a { color: #05070f !important; text-shadow: 0 0 10px rgba(47,107,255,.32); }
.impact-site[data-impact-theme="light"] .public-social-block a { color: #05070f !important; }
.impact-site[data-impact-theme="light"] .streaming-links-row a svg,
.impact-site[data-impact-theme="light"] .streaming-links-row a img,
.impact-site[data-impact-theme="light"] .streaming-links-row a span[style],
.impact-site[data-impact-theme="light"] .public-social-block a svg,
.impact-site[data-impact-theme="light"] .public-social-block a img { filter: brightness(0) drop-shadow(0 0 6px rgba(47,107,255,.7)) !important; }
@media (min-width: 768px) {
  .impact-site .vielusos-player-card, .impact-site .vielusos-video-card { width: calc((100% - 3rem) / 4) !important; max-width: none !important; }
}
@media (max-width: 640px) {
  .impact-site .vielusos-fluid, .impact-gallery-grid { width: 92% !important; }
  .impact-hero { height: 72svh; min-height: 30rem; max-height: 42rem; }
  .impact-track-card { width: min(82vw, 20rem); }
  .impact-gallery-grid { columns: 1; }
  .impact-site .public-footer-grid { justify-items: center; text-align: center; }
  .impact-site .public-footer-grid > div { display: flex; width: 100%; flex-direction: column; align-items: center; }
  .impact-site .public-footer-grid ul { align-items: center; justify-content: center; }
  .impact-site .public-footer-bottom { align-items: center !important; justify-content: center !important; text-align: center; }
  .impact-site .public-footer-bottom > div { flex-wrap: wrap; justify-content: center; }
}
@media (min-width: 641px) and (max-width: 960px) { .impact-gallery-grid { columns: 2; } }
`;

// Google Fonts loaded on IMPACT pages (techno geometric + neutral body).
export const IMPACT_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@300;400;600&display=swap';

export function isImpactSite(site?: { subdomain?: string | null } | null): boolean {
  return site?.subdomain === IMPACT_SUBDOMAIN;
}
