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

// IMPACT owns this identity. Nothing shown to the artist or the public uses an
// EasyAsso address; the booking address is also the administrator login.
export const IMPACT_LOGIN_EMAIL = 'contact@skorm-agency.com';
export const IMPACT_LOGIN_PASSWORD = 'impact1234';

export const IMPACT_SOCIALS = {
  instagram: 'https://www.instagram.com/impactdj_raw',
  tiktok: 'https://www.tiktok.com/@impactdj_raw',
  spotify: 'https://open.spotify.com/artist/3AiyQHD9YDWhPX6rKJLkXZ',
  soundcloud: 'https://on.soundcloud.com/gFkxJhH119PUD8bvJG',
  deezer: 'https://link.deezer.com/s/32FJ0eJdg95ujwvQN8jFV',
  youtube: 'https://www.youtube.com/channel/UCdqrxBgSQ7ReX0FmaQBIAfw',
  applemusic: 'https://music.apple.com/fr/artist/impact/1815586907',
  email: `mailto:${IMPACT_LOGIN_EMAIL}`,
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

export const IMPACT_BRAND = {
  logoUrl: '/impact/logo.svg',
  backgroundUrl: '/impact/background.svg',
  accent: '#2f6bff', // bleu électrique
  neon: '#4cc9ff', // halo néon cyan-bleu
  surface: '#05070f', // noir bleuté
};

export const IMPACT_SITE_CSS = `
html:has(.impact-site), body:has(.impact-site) { min-height: 100%; background: #05070f !important; }
.impact-site { min-height: 100dvh; background-color: #05070f !important; }
.impact-site main { background: transparent; font-family: "Inter", "Helvetica Neue", Arial, sans-serif; font-weight: 300; }
.impact-site .public-block-shell .text-gray-900, .impact-site .public-block-shell .text-gray-950 { color: #eaf2ff !important; }
.impact-site .public-block-shell .text-gray-600, .impact-site .public-block-shell .text-gray-500 { color: rgba(234,242,255,.66) !important; }
.impact-site .public-block-shell .bg-white { background: rgba(9,13,26,.55) !important; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
.impact-site .public-block-shell .ring-gray-100 { --tw-ring-color: rgba(76,201,255,.22) !important; }
.impact-site .public-header-shell, .impact-site .public-footer-shell { background: rgba(5,7,15,.72) !important; -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); }
.impact-site .public-footer-shell { margin-bottom: 0 !important; border-top: 1px solid rgba(76,201,255,.18); }
.impact-site .public-header-shell { border-bottom: 1px solid rgba(76,201,255,.18); }
.impact-site main h2 { font-family: "Space Grotesk", "Helvetica Neue", Arial, sans-serif !important; font-size: clamp(1.75rem, 3vw, 2.6rem) !important; line-height: 1.02 !important; font-weight: 700 !important; letter-spacing: .16em !important; text-transform: uppercase !important; color: #eaf2ff !important; text-shadow: 0 0 22px rgba(47,107,255,.55), 0 0 42px rgba(76,201,255,.25) !important; }
/* the shared block components emit these utility class names for every brand */
.impact-site .vielusos-fluid { width: 80% !important; max-width: none !important; padding-left: 0 !important; padding-right: 0 !important; }
.impact-site .vielusos-media-shell { padding-left: 0 !important; padding-right: 0 !important; }
.impact-site .public-social-block a { color: rgba(234,242,255,.7) !important; border-color: rgba(76,201,255,.28) !important; }
.impact-site .public-social-block a:hover { color: #ffffff !important; background: rgba(47,107,255,.12); border-color: rgba(76,201,255,.65) !important; box-shadow: 0 0 18px rgba(47,107,255,.45); }
.impact-site .vielusos-media-shell [style*="box-shadow"] { box-shadow: 0 18px 40px -18px rgba(47,107,255,.55) !important; }
.impact-site .public-block-shell a[style*="background"], .impact-site .public-block-shell button[style*="background"] { box-shadow: 0 0 26px rgba(47,107,255,.45); }
@media (min-width: 768px) {
  .impact-site .vielusos-player-card, .impact-site .vielusos-video-card { width: calc((100% - 3rem) / 4) !important; max-width: none !important; }
}
@media (max-width: 640px) {
  .impact-site .public-footer-grid { justify-items: center; text-align: center; }
  .impact-site .public-footer-grid > div { display: flex; width: 100%; flex-direction: column; align-items: center; }
  .impact-site .public-footer-grid ul { align-items: center; justify-content: center; }
  .impact-site .public-footer-bottom { align-items: center !important; justify-content: center !important; text-align: center; }
  .impact-site .public-footer-bottom > div { flex-wrap: wrap; justify-content: center; }
}
`;

// Google Fonts loaded on IMPACT pages (techno geometric + neutral body).
export const IMPACT_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@300;400;600&display=swap';

export function isImpactSite(site?: { subdomain?: string | null } | null): boolean {
  return site?.subdomain === IMPACT_SUBDOMAIN;
}
