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

export const IMPACT_SPOTIFY_TRACKS = [
  { title: 'MAYDAY', artist: 'IMPACT', year: '2026', releaseDate: '2026-02-27', thumbnail: '/impact/releases/mayday.jpg', url: 'https://open.spotify.com/track/593KEnbri737YiL6rqQ6rh', source: 'Spotify', playCount: '14 831' },
  { title: 'YOU MADE IT', artist: 'IMPACT', year: '2026', releaseDate: '2026-02-24', thumbnail: '/impact/releases/you-made-it.jpg', url: 'https://open.spotify.com/track/00Wuied8VMJHv1FQEvQgTe', source: 'Spotify', playCount: '6 117' },
  { title: 'LOCK THE DOOR', artist: 'IMPACT', year: '2025', releaseDate: '2025-09-17', thumbnail: '/impact/releases/lock-the-door.jpg', url: 'https://open.spotify.com/track/2yMBrQS2RaEuaqeoMg79Kb', source: 'Spotify', playCount: '7 382' },
  { title: 'POWER OF DESTRUCTION', artist: 'IMPACT', year: '2025', releaseDate: '2025-05-22', thumbnail: '/impact/releases/power-of-destruction.jpg', url: 'https://open.spotify.com/track/02UzYVHuaclC9y4HMo4qtN', source: 'Spotify' },
] as const;

export const IMPACT_SOUNDCLOUD_TRACKS = [
  { title: 'DJ CONTEST ESKAPE 2026', artist: 'IMPACT', year: '2026', releaseDate: '2026-05-16', thumbnail: '/impact/releases/dj-contest-eskape-2026.png', url: 'https://soundcloud.com/impactdj_raw/dj-contest-eskape-2026', source: 'SoundCloud', playCount: '210' },
  { title: 'YOU MADE IT', artist: 'IMPACT', year: '2026', releaseDate: '2026-02-24', thumbnail: '/impact/releases/you-made-it-soundcloud.png', url: 'https://soundcloud.com/impactdj_raw/you-made-it', source: 'SoundCloud', playCount: '459' },
  { title: 'MAYDAY', artist: 'IMPACT', year: '2025', releaseDate: '2025-12-12', thumbnail: '/impact/releases/mayday-soundcloud.png', url: 'https://soundcloud.com/impactdj_raw/mayday', source: 'SoundCloud', playCount: '606' },
  { title: 'ESKAPE WINTER DJ CONTEST BY IMPACT', artist: 'IMPACT', year: '2025', releaseDate: '2025-11-19', thumbnail: '/impact/releases/eskape-winter-dj-contest.png', url: 'https://soundcloud.com/impactdj_raw/dj-contest-eskape-winter-by-impact', source: 'SoundCloud', playCount: '67' },
  { title: 'BASS LAND FESTIVAL - DJ CONTEST BY IMPACT', artist: 'IMPACT', year: '2025', releaseDate: '2025-10-29', thumbnail: '/impact/releases/bass-land-festival-dj-contest.png', url: 'https://soundcloud.com/impactdj_raw/bass-land-festival-dj-contest-by-impact', source: 'SoundCloud', playCount: '83' },
  { title: 'LOCK THE DOOR (FREE EXTENDED LINK)', artist: 'IMPACT', year: '2025', releaseDate: '2025-09-17', thumbnail: '/impact/releases/lock-the-door-soundcloud.jpg', url: 'https://soundcloud.com/impactdj_raw/lock-the-door-vf-2', source: 'SoundCloud', playCount: '176' },
  { title: 'RAGNAROK 2025 DJ CONTEST BY IMPACT', artist: 'IMPACT', year: '2025', releaseDate: '2025-08-26', thumbnail: '/impact/releases/ragnarok-2025-dj-contest.png', url: 'https://soundcloud.com/impactdj_raw/ragnarok-2025-dj-contest-by-impact', source: 'SoundCloud', playCount: '111' },
  { title: 'IMPACT PRESENTS "TOTAL DESTRUCTION" VOL.1', artist: 'IMPACT', year: '2025', releaseDate: '2025-07-24', thumbnail: '/impact/releases/total-destruction-vol-1.jpg', url: 'https://soundcloud.com/impactdj_raw/impact-presents-total-destruction-vol1', source: 'SoundCloud', playCount: '63' },
  { title: 'POWER OF DESTRUCTION', artist: 'IMPACT', year: '2025', releaseDate: '2025-05-22', thumbnail: '/impact/releases/power-of-destruction-soundcloud.png', url: 'https://soundcloud.com/impactdj_raw/power-of-destruction', source: 'SoundCloud', playCount: '105' },
] as const;

export const IMPACT_TRACKS = [...IMPACT_SPOTIFY_TRACKS, ...IMPACT_SOUNDCLOUD_TRACKS] as const;

export const IMPACT_STATS = [
  { value: '160', label: 'auditeurs mensuels Spotify' },
  { value: '28K+', label: 'écoutes visibles sur les trois titres Spotify les plus lus' },
  { value: '9', label: 'titres publiés sur SoundCloud' },
  { value: '54', label: 'followers SoundCloud' },
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
html:has(.impact-site), body:has(.impact-site) { min-height: 100%; background: #02030a !important; }
.impact-site { min-height: 100dvh; color: #eaf2ff !important; background-color: #02030a !important; background-image: linear-gradient(180deg, rgba(47,107,255,.12), transparent 16rem), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,.02) 1px, transparent 1px) !important; background-size: auto, 18rem 18rem, 18rem 18rem !important; }
.impact-site[data-impact-theme="light"] { color: #07101f !important; background-color: #fff !important; background-image: linear-gradient(180deg, rgba(47,107,255,.075), transparent 15rem), linear-gradient(90deg, rgba(47,107,255,.045) 1px, transparent 1px), linear-gradient(180deg, rgba(47,107,255,.035) 1px, transparent 1px) !important; background-size: auto, 18rem 18rem, 18rem 18rem !important; }
.impact-site main { background: transparent; font-family: "Inter", "Helvetica Neue", Arial, sans-serif; font-weight: 300; }
.impact-site [class*="tracking-"] { letter-spacing: 0 !important; }
.impact-site .public-block-shell .text-gray-900, .impact-site .public-block-shell .text-gray-950 { color: #eaf2ff !important; }
.impact-site .public-block-shell .text-gray-600, .impact-site .public-block-shell .text-gray-500 { color: rgba(234,242,255,.66) !important; }
.impact-site .public-block-shell .bg-white { background: rgba(9,13,26,.55) !important; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
.impact-site .public-block-shell .ring-gray-100 { --tw-ring-color: rgba(76,201,255,.22) !important; }
.impact-site[data-impact-theme="light"] .public-block-shell .text-gray-900, .impact-site[data-impact-theme="light"] .public-block-shell .text-gray-950 { color: #07101f !important; }
.impact-site[data-impact-theme="light"] .public-block-shell .text-gray-600, .impact-site[data-impact-theme="light"] .public-block-shell .text-gray-500 { color: rgba(7,16,31,.64) !important; }
.impact-site[data-impact-theme="light"] .public-block-shell .bg-white { background: rgba(255,255,255,.58) !important; border: 1px solid rgba(47,107,255,.13); box-shadow: 0 20px 60px rgba(31,80,180,.08) !important; }
.impact-site .public-header-shell, .impact-site .public-footer-shell { background: rgba(2,3,10,.66) !important; color: #eaf2ff !important; -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px); }
.impact-site[data-impact-theme="light"] .public-header-shell, .impact-site[data-impact-theme="light"] .public-footer-shell { background: rgba(255,255,255,.82) !important; color: #07101f !important; border-color: rgba(47,107,255,.14) !important; box-shadow: 0 12px 38px rgba(31,80,180,.05); }
.impact-site .public-footer-shell { margin-bottom: 0 !important; border-top: 1px solid rgba(76,201,255,.18); }
.impact-site .public-header-shell { border-bottom: 1px solid rgba(76,201,255,.18); }
.impact-site main h2 { font-family: "Space Grotesk", "Helvetica Neue", Arial, sans-serif !important; font-size: 1.45rem !important; line-height: 1.08 !important; font-weight: 600 !important; letter-spacing: 0 !important; text-transform: uppercase !important; color: #eaf2ff !important; text-shadow: 0 0 18px rgba(47,107,255,.34) !important; }
.impact-site[data-impact-theme="light"] main h2 { color: #07101f !important; text-shadow: 0 0 18px rgba(47,107,255,.16) !important; }
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

.impact-hero { height: 34rem; max-height: 58svh; background: #02030a; }
.impact-hero-light-media { display: none; }
.impact-hero-dark-media { display: block; filter: none; }
.impact-hero-overlay { background: linear-gradient(to bottom, transparent 0%, rgba(2,3,10,.08) 62%, #02030a 100%); }
.impact-hero-content { display: none !important; }
.impact-hero-logo { filter: drop-shadow(0 0 24px rgba(47,107,255,.7)); }
.impact-hero-name { color: #fff; text-shadow: 0 0 26px rgba(47,107,255,.72), 0 0 52px rgba(76,201,255,.34); }
.impact-hero-tagline { color: #9dc7ff; }
.impact-site[data-impact-theme="light"] .impact-hero { background: #fff; }
.impact-site[data-impact-theme="light"] .impact-hero-dark-media { display: none; }
.impact-site[data-impact-theme="light"] .impact-hero-light-media { display: block; filter: none; opacity: 1; }
.impact-site[data-impact-theme="light"] .impact-hero-overlay { background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,.1) 72%, #fff 100%); }
.impact-site[data-impact-theme="light"] .impact-hero-content { display: flex !important; }
.impact-site[data-impact-theme="light"] .impact-hero-name { color: #07101f; text-shadow: 0 0 28px rgba(47,107,255,.32); }
.impact-site[data-impact-theme="light"] .impact-hero-tagline { color: #174dbd; }

.impact-track-shell { padding-top: 2.25rem !important; padding-bottom: 1.75rem !important; }
.impact-track-heading { font-size: 1.45rem !important; letter-spacing: 0 !important; text-shadow: none !important; }
.impact-track-kicker { letter-spacing: 0 !important; }
.impact-track-rail { display: flex; gap: 10px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 0 2px 10px; scrollbar-width: none; }
.impact-track-rail::-webkit-scrollbar { display: none; }
.impact-track-card { width: 18.5rem; overflow: hidden; border-radius: 8px; color: #eef4ff; background: rgba(6,8,16,.64); border: 1px solid rgba(255,255,255,.12); box-shadow: 0 16px 42px rgba(0,0,0,.26); transition: transform .22s ease, border-color .22s ease; }
.impact-track-card:hover { transform: translateY(-3px); border-color: rgba(76,201,255,.48); }
.impact-track-artwork { position: relative; display: grid; aspect-ratio: 16/9; place-items: center; overflow: hidden; background: #090b12; }
.impact-track-artwork img { position: absolute; inset: 0; height: 100%; width: 100%; object-fit: cover; object-position: center; }
.impact-track-artwork::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,.22)); }
.impact-track-play { position: absolute; left: 50%; top: 50%; z-index: 1; display: grid; height: 38px; width: 38px; transform: translate(-50%,-50%); place-items: center; border-radius: 999px; color: #fff; background: rgba(47,107,255,.92); box-shadow: 0 0 0 1px rgba(255,255,255,.22), 0 0 20px rgba(47,107,255,.55); }
.impact-track-meta { min-height: 62px; padding: 12px 13px; border-top: 1px solid rgba(255,255,255,.08); }
.impact-track-arrow { position: absolute; top: 50%; z-index: 10; display: grid; height: 30px; width: 30px; transform: translateY(-50%); place-items: center; border: 1px solid rgba(255,255,255,.13); border-radius: 999px; color: #fff; background: rgba(0,0,0,.58); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
.impact-site[data-impact-theme="light"] .impact-track-card { color: #07101f; background: rgba(255,255,255,.7); border-color: rgba(47,107,255,.16); box-shadow: 0 16px 42px rgba(31,80,180,.08); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); }
.impact-site[data-impact-theme="light"] .impact-track-artwork { background: rgba(230,239,255,.54); }
.impact-site[data-impact-theme="light"] .impact-track-meta { border-color: rgba(47,107,255,.1); }
.impact-site[data-impact-theme="light"] .impact-track-arrow { color: #07101f; border-color: rgba(47,107,255,.18); background: rgba(255,255,255,.68); }

.impact-stats { width: 90%; margin: 0 auto; padding: 2.25rem 0 1.25rem; }
.impact-stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 1rem; }
.impact-stat-card { border: 1px solid rgba(76,201,255,.18); border-radius: 8px; background: rgba(7,11,26,.48); padding: 1rem; -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); }
.impact-stat-value { font-family: "Space Grotesk", Arial, sans-serif; font-size: 1.55rem; font-weight: 600; line-height: 1; color: #fff; text-shadow: 0 0 16px rgba(47,107,255,.38); }
.impact-stat-label { margin-top: .55rem; font-size: .68rem; line-height: 1.35; color: rgba(234,242,255,.54); }
.impact-stats-source { margin-top: .75rem; font-size: .68rem; color: rgba(234,242,255,.36); }
.impact-site[data-impact-theme="light"] .impact-stat-card { background: rgba(255,255,255,.66); border-color: rgba(47,107,255,.14); box-shadow: 0 12px 36px rgba(31,80,180,.07); }
.impact-site[data-impact-theme="light"] .impact-stat-value { color: #07101f; text-shadow: 0 0 14px rgba(47,107,255,.16); }
.impact-site[data-impact-theme="light"] .impact-stat-label, .impact-site[data-impact-theme="light"] .impact-stats-source { color: rgba(7,16,31,.58); }

.impact-gallery-grid { width: 90%; margin: 0 auto; columns: 3; column-gap: 16px; }
.impact-gallery-frame { break-inside: avoid; margin: 0 0 16px; overflow: hidden; border-radius: 16px; background: #fff; border: 1px solid rgba(76,201,255,.22); box-shadow: 0 18px 55px rgba(0,0,0,.24); }
.impact-gallery-frame img { display: block; width: 100%; height: auto; object-fit: contain; }
.impact-site[data-impact-theme="light"] .impact-gallery-frame { border-color: rgba(47,107,255,.14); box-shadow: 0 20px 55px rgba(31,80,180,.1); }
.impact-bio-carousel { display: grid; gap: 10px; }
.impact-bio-carousel-window { position: relative; aspect-ratio: 4/5; max-height: 34rem; overflow: hidden; border: 1px solid rgba(76,201,255,.2); border-radius: 8px; background: rgba(255,255,255,.045); box-shadow: 0 18px 50px -18px rgba(47,107,255,.44); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); }
.impact-bio-carousel-image { position: absolute; inset: 0; height: 100%; width: 100%; object-fit: contain; object-position: center; opacity: 0; transform: scale(.985); transition: opacity .42s ease, transform .42s ease; }
.impact-bio-carousel-image.is-active { opacity: 1; transform: scale(1); }
.impact-bio-flash { pointer-events: none; position: absolute; inset: 0; opacity: 0; background: linear-gradient(90deg, transparent, rgba(76,201,255,.78), transparent); mix-blend-mode: screen; transform: translateX(-100%); }
.impact-bio-flash.is-visible { animation: impact-blue-flash .14s ease-out; }
.impact-bio-strip { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
.impact-bio-thumb { aspect-ratio: 1; overflow: hidden; border: 1px solid rgba(76,201,255,.16); border-radius: 6px; background: rgba(255,255,255,.05); opacity: .58; transition: opacity .18s ease, border-color .18s ease, transform .18s ease; }
.impact-bio-thumb:hover, .impact-bio-thumb.is-active { opacity: 1; border-color: rgba(76,201,255,.72); transform: translateY(-1px); }
.impact-bio-thumb img { height: 100%; width: 100%; object-fit: cover; }
.impact-site[data-impact-theme="light"] .impact-bio-carousel-window, .impact-site[data-impact-theme="light"] .impact-bio-thumb { background: rgba(255,255,255,.62); border-color: rgba(47,107,255,.16); box-shadow: 0 16px 44px rgba(31,80,180,.08); }
.impact-site[data-impact-theme="light"] .impact-bio-carousel-image { filter: saturate(.96) contrast(1.02); }
@keyframes impact-blue-flash { 0% { opacity: 0; transform: translateX(-100%); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateX(100%); } }
.impact-site[data-impact-theme="light"] section[data-no-translate] { background: rgba(255,255,255,.58) !important; border-color: rgba(47,107,255,.14) !important; }
.impact-site[data-impact-theme="light"] section[data-no-translate] h2, .impact-site[data-impact-theme="light"] section[data-no-translate] p { color: #07101f !important; text-shadow: none !important; }
@media (min-width: 768px) {
  .impact-site .vielusos-player-card, .impact-site .vielusos-video-card { width: calc((100% - 3rem) / 4) !important; max-width: none !important; }
}
@media (max-width: 640px) {
  .impact-site .vielusos-fluid, .impact-gallery-grid { width: 92% !important; }
  .impact-hero { height: 24rem; max-height: 58svh; }
  .impact-track-card { width: min(78vw, 18rem); }
  .impact-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
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
