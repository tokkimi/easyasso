/**
 * IMPACT is a second art-directed artist profile, built as a parallel to
 * the other artist profiles. Its direction artistique is deliberately different: electric-blue
 * neon, glass/translucent surfaces and a raw techno mood. Keep every IMPACT
 * exception in this one file so it stays isolated from every other tenant.
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
// The admin login email can be overridden by the IMPACT_ADMIN_EMAIL env var at
// seed time. The password is NEVER stored in code — it comes from the
// IMPACT_ADMIN_PASSWORD env var (or a random one generated at seed time). See
// prisma/seed.ts.
export const IMPACT_LOGIN_EMAIL = process.env.IMPACT_ADMIN_EMAIL || 'contact@skorm-agency.com';
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
  { title: "KENAI - DON'T GO", artist: 'KENAI', year: '2025', releaseDate: '2025', thumbnail: '/impact/releases/kenai-dont-go.jpg', url: 'https://soundcloud.com/kenairaw/kenai-dont-go', source: 'SoundCloud' },
  { title: 'ACULLITE - THE EVASION TOOL', artist: 'ACULLITE', year: '2025', releaseDate: '2025', thumbnail: '/impact/releases/acullite-the-evasion-tool.jpg', url: 'https://soundcloud.com/acullite/classified-tool', source: 'SoundCloud' },
] as const;

export const IMPACT_YOUTUBE_TRACKS = [
  { title: 'MAYDAY', artist: 'IMPACT', year: '2026', releaseDate: '2026-02-27', thumbnail: '/impact/releases/mayday-soundcloud.png', url: 'https://www.youtube.com/watch?v=XDoDJk4KxT0', source: 'YouTube' },
  { title: 'LOCK THE DOOR', artist: 'IMPACT', year: '2025', releaseDate: '2025-09-17', thumbnail: '/impact/releases/lock-the-door-soundcloud.jpg', url: 'https://www.youtube.com/watch?v=wgzh2zgDcNc', source: 'YouTube' },
  { title: 'POWER OF DESTRUCTION', artist: 'IMPACT', year: '2025', releaseDate: '2025-05-22', thumbnail: '/impact/releases/power-of-destruction-soundcloud.png', url: 'https://www.youtube.com/watch?v=LfrPnKEjGKY', source: 'YouTube' },
] as const;

export const IMPACT_APPLE_MUSIC_TRACKS = [
  { title: 'YOU MADE IT', artist: 'IMPACT', year: '2026', releaseDate: '2026-02-24', thumbnail: '/impact/releases/you-made-it-soundcloud.png', url: 'https://music.apple.com/fr/song/you-made-it/1879401619', source: 'Apple Music' },
  { title: 'MAYDAY', artist: 'IMPACT', year: '2026', releaseDate: '2026-02-27', thumbnail: '/impact/releases/mayday-soundcloud.png', url: 'https://music.apple.com/fr/song/mayday/1860372401', source: 'Apple Music' },
  { title: 'LOCK THE DOOR', artist: 'IMPACT', year: '2025', releaseDate: '2025-09-17', thumbnail: '/impact/releases/lock-the-door-soundcloud.jpg', url: 'https://music.apple.com/fr/song/lock-the-door/1840803496', source: 'Apple Music' },
] as const;

export const IMPACT_TRACKS = [...IMPACT_SPOTIFY_TRACKS, ...IMPACT_SOUNDCLOUD_TRACKS, ...IMPACT_YOUTUBE_TRACKS, ...IMPACT_APPLE_MUSIC_TRACKS] as const;

export const IMPACT_STATS = [
  { value: '160', label: 'auditeurs mensuels Spotify' },
  { value: '28K+', label: 'écoutes visibles sur les trois titres Spotify les plus lus' },
  { value: '11', label: 'sons reliés sur SoundCloud' },
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

export const IMPACT_INSTAGRAM_POSTS = [
  'https://www.instagram.com/p/DbqdwsTjH8f/?img_index=1',
  'https://www.instagram.com/p/DWjc0PvDIQq/?img_index=1',
  'https://www.instagram.com/p/DYSHlAxDD2K/?img_index=1',
  'https://www.instagram.com/p/DcI8i5ljAtE/?img_index=1',
  'https://www.instagram.com/p/DbvrCUYgl0w/?img_index=1',
  'https://www.instagram.com/p/DakeQ7dszdG/',
  'https://www.instagram.com/p/DadQYIasg1u/',
  'https://www.instagram.com/p/DaS6sYSCJ_U/?img_index=1',
  'https://www.instagram.com/p/DY2RhbcDCmp/?img_index=1',
  'https://www.instagram.com/p/DV_dIU8ANjJ/',
  'https://www.instagram.com/p/DVg0e5RjFY8/?img_index=1',
  'https://www.instagram.com/p/DTQlUpKjBDv/?img_index=1',
  'https://www.instagram.com/p/DSJ5p3BjLGL/',
  'https://www.instagram.com/p/DOv_qaBjDGh/?img_index=1',
  'https://www.instagram.com/p/DOoVPJRjCwU/',
] as const;

export const IMPACT_TIKTOK_POSTS = [
  'https://www.tiktok.com/@impactdj_raw/video/7678053587284413729',
  'https://www.tiktok.com/@impactdj_raw/video/7675673489398893857',
  'https://www.tiktok.com/@impactdj_raw/video/7673910787097906464',
  'https://www.tiktok.com/@impactdj_raw/video/7670922904493624609',
  'https://www.tiktok.com/@impactdj_raw/video/7667932845020581152',
  'https://www.tiktok.com/@impactdj_raw/video/7660498179695168800',
  'https://www.tiktok.com/@impactdj_raw/video/7657220485058465057',
  'https://www.tiktok.com/@impactdj_raw/video/7646801562802605345',
  'https://www.tiktok.com/@impactdj_raw/video/7645250249606368545',
] as const;

// Favicon / tab icon for IMPACT: the neon-blue mask. Drop the file at
// public/impact/favicon.png (transparent PNG, ~512px). Until it exists the
// wordmark logo.svg is listed as a graceful fallback so the tab is never blank.
export const IMPACT_FAVICON_URL = '/impact/favicon.png';
export const IMPACT_ICONS = [{ url: IMPACT_FAVICON_URL }, { url: '/impact/logo.svg' }];

export const IMPACT_BRAND = {
  logoUrl: '/impact/logo.png',
  faviconUrl: '/impact/favicon.png',
  backgroundUrl: '/impact/background-dark.png',
  accent: '#2f6bff', // bleu électrique
  neon: '#4cc9ff', // halo néon cyan-bleu
  surface: '#05070f', // noir bleuté
};

export const IMPACT_SITE_CSS = `
html:has(.impact-site), body:has(.impact-site) { min-height: 100%; background: #02030a !important; }
html:has(.impact-site[data-impact-theme="light"]), body:has(.impact-site[data-impact-theme="light"]) { background: #fff !important; }
.impact-site { position: relative; isolation: isolate; min-height: 100dvh; margin-bottom: 0 !important; padding-bottom: 0 !important; overflow-x: clip; color: #eaf2ff !important; background-color: #02030a !important; background-image: linear-gradient(180deg, rgba(2,3,10,.26), rgba(2,3,10,.74)), url('/impact/background-dark.png') !important; background-position: center top, center top !important; background-repeat: no-repeat, repeat-y !important; background-size: cover, min(100vw, 66rem) auto !important; }
.impact-site::before { content: ""; pointer-events: none; position: fixed; inset: -5vh -3vw; z-index: 0; opacity: 0; background-image: repeating-linear-gradient(0deg, rgba(1,4,14,.78) 0 1px, rgba(47,107,255,.2) 1px 2px, transparent 2px 5px), repeating-linear-gradient(90deg, transparent 0 7vw, rgba(76,201,255,.09) 7vw calc(7vw + 1px), transparent calc(7vw + 1px) 15vw); background-size: 100% 7px, 100% 100%; mix-blend-mode: screen; filter: contrast(1.35) saturate(1.8); will-change: opacity, transform, background-position; animation: impact-dark-crt-interference 3s steps(1,end) infinite; }
.impact-site::after { content: ""; pointer-events: none; position: fixed; inset: 0; z-index: 0; opacity: 0; height: 100dvh; width: 100vw; background: url('/impact/background-dark-figure-cutout.png') center 42% / auto max(128dvh,74vw) no-repeat; filter: grayscale(.86) contrast(1.58) brightness(.5) saturate(1.12) drop-shadow(0 0 24px rgba(30,94,255,.52)); mix-blend-mode: screen; animation: impact-dark-figure-glitch 3s steps(1,end) infinite; }
.impact-site.impact-editor-preview::before, .impact-site.impact-editor-preview::after, .impact-site.impact-editor-preview .impact-light-fixed-background { display: none !important; animation: none !important; }
.impact-site.impact-editor-preview { position: relative !important; isolation: isolate; contain: paint; transform: translateZ(0); }
.impact-site.impact-editor-preview .public-header-shell { position: relative !important; inset: auto !important; z-index: 20 !important; width: 100% !important; }
.impact-site.impact-editor-preview .impact-header-dropdown { position: absolute !important; z-index: 21 !important; }
.impact-site[data-impact-theme="light"] { color: #07101f !important; background-color: #fff !important; background-image: linear-gradient(90deg, rgba(47,107,255,.035) 1px, transparent 1px), linear-gradient(180deg, rgba(47,107,255,.028) 1px, transparent 1px) !important; background-position: center top, center top !important; background-repeat: repeat, repeat !important; background-size: 18rem 18rem, 18rem 18rem !important; }
.impact-site[data-impact-theme="light"]::before { display: none; }
.impact-site[data-impact-theme="light"]::after { display: none; }
.impact-site main { background: transparent; padding-bottom: 0 !important; font-family: "Inter", "Helvetica Neue", Arial, sans-serif; font-weight: 300; }
.impact-site main > * { position: relative; z-index: 1; }
.impact-light-fixed-background { display: none; }
.impact-site[data-impact-theme="light"] .impact-light-fixed-background { pointer-events: none; position: fixed !important; inset: 0; z-index: 0 !important; display: block; height: 100dvh; width: 100%; margin: 0 !important; overflow: hidden; }
.impact-site[data-impact-theme="light"] .impact-light-fixed-background::after { content: ""; pointer-events: none; position: absolute; inset: -5vh -3vw; z-index: 3; opacity: 0; background-image: repeating-linear-gradient(0deg, rgba(6,18,49,.28) 0 1px, rgba(30,94,255,.22) 1px 2px, transparent 2px 6px), repeating-linear-gradient(90deg, transparent 0 8vw, rgba(47,107,255,.1) 8vw calc(8vw + 1px), transparent calc(8vw + 1px) 17vw); background-size: 100% 8px, 100% 100%; mix-blend-mode: multiply; filter: contrast(1.45) saturate(1.9); will-change: opacity, transform, background-position; animation: impact-light-crt-interference 5s steps(1,end) infinite; }
.impact-light-fixed-background-base, .impact-light-fixed-background-glitch { position: absolute; inset: 0; display: block; background: right top / min(112vw,78rem) auto no-repeat url('/impact/background-light-helmet.png'); }
.impact-light-fixed-background-glitch { opacity: 0; filter: saturate(1.85) contrast(1.1) hue-rotate(210deg) drop-shadow(-20px 0 0 rgba(30,94,255,.9)); mix-blend-mode: multiply; animation: impact-light-bg-glitch 5s linear infinite; }
.impact-site .public-header-shell, .impact-site main, .impact-site .public-footer-shell { position: relative; z-index: 1; }
.impact-site .impact-hero { position: relative; z-index: 3 !important; isolation: isolate; }
.impact-site .public-header-shell { z-index: 2147483000 !important; }
.impact-site .impact-header-dropdown { z-index: 2147483001 !important; }
.impact-site .impact-page-loader { z-index: 2147483002 !important; }
.impact-site [class*="tracking-"] { letter-spacing: 0 !important; }
.impact-site .public-block-shell .text-gray-900, .impact-site .public-block-shell .text-gray-950 { color: #eaf2ff !important; }
.impact-site .public-block-shell .text-gray-600, .impact-site .public-block-shell .text-gray-500 { color: rgba(234,242,255,.66) !important; }
.impact-site .public-block-shell .bg-white { background: rgba(9,13,26,.55) !important; -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
.impact-site .public-block-shell .ring-gray-100 { --tw-ring-color: rgba(76,201,255,.22) !important; }
.impact-site[data-impact-theme="light"] .public-block-shell .text-gray-900, .impact-site[data-impact-theme="light"] .public-block-shell .text-gray-950 { color: #07101f !important; }
.impact-site[data-impact-theme="light"] .public-block-shell .text-gray-600, .impact-site[data-impact-theme="light"] .public-block-shell .text-gray-500 { color: rgba(7,16,31,.64) !important; }
.impact-site[data-impact-theme="light"] .public-block-shell .bg-white { background: rgba(255,255,255,.58) !important; border: 1px solid rgba(47,107,255,.13); box-shadow: 0 20px 60px rgba(31,80,180,.08) !important; }
.impact-site .public-header-shell { position: fixed !important; top: 0; right: 0; left: 0; width: 100%; background: rgba(2,3,10,.08) !important; color: #eaf2ff !important; -webkit-backdrop-filter: blur(7px) saturate(1.08); backdrop-filter: blur(7px) saturate(1.08); }
.impact-site .public-footer-shell { background: rgba(2,3,10,.5) !important; color: #eaf2ff !important; -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px); }
.impact-site[data-impact-theme="light"] .public-header-shell { background: rgba(255,255,255,.08) !important; color: #07101f !important; border-color: rgba(47,107,255,.12) !important; box-shadow: 0 10px 34px rgba(31,80,180,.025); }
.impact-site[data-impact-theme="light"] .public-footer-shell { background: rgba(255,255,255,.5) !important; color: #07101f !important; border-color: rgba(47,107,255,.14) !important; box-shadow: 0 12px 38px rgba(31,80,180,.05); }
.impact-site .impact-client-page { color: #eef4ff !important; }
.impact-site .impact-client-card { color: #eef4ff !important; background: rgba(3,7,18,.72) !important; border: 1px solid rgba(76,201,255,.26); box-shadow: 0 22px 70px rgba(0,0,0,.38), 0 0 38px rgba(47,107,255,.15); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); }
.impact-site .impact-client-title, .impact-site .impact-client-card > p, .impact-site .impact-customer-form label, .impact-site .impact-customer-form > p { color: #eef4ff !important; }
.impact-site .impact-customer-form { color: #eef4ff !important; background: rgba(2,5,14,.58); border: 1px solid rgba(76,201,255,.18); }
.impact-site .impact-customer-input { border: 1px solid rgba(76,201,255,.28) !important; background: rgba(255,255,255,.1) !important; color: #fff !important; box-shadow: inset 0 0 18px rgba(47,107,255,.05); }
.impact-site .impact-customer-input::placeholder { color: rgba(238,244,255,.56) !important; }
.impact-site .impact-customer-submit { background: #2f6bff !important; color: #fff !important; box-shadow: 0 0 24px rgba(47,107,255,.48); }
.impact-site[data-impact-theme="light"] .impact-client-page { color: #07101f !important; }
.impact-site[data-impact-theme="light"] .impact-client-card { color: #07101f !important; background: rgba(255,255,255,.78) !important; border-color: rgba(47,107,255,.2); box-shadow: 0 22px 70px rgba(31,80,180,.12), 0 0 34px rgba(47,107,255,.1); }
.impact-site[data-impact-theme="light"] .impact-client-title, .impact-site[data-impact-theme="light"] .impact-client-card > p, .impact-site[data-impact-theme="light"] .impact-customer-form label, .impact-site[data-impact-theme="light"] .impact-customer-form > p { color: #07101f !important; }
.impact-site[data-impact-theme="light"] .impact-customer-form { color: #07101f !important; background: rgba(255,255,255,.62); border-color: rgba(47,107,255,.16); }
.impact-site[data-impact-theme="light"] .impact-customer-input { border-color: rgba(47,107,255,.22) !important; background: rgba(255,255,255,.94) !important; color: #07101f !important; }
.impact-site[data-impact-theme="light"] .impact-customer-input::placeholder { color: rgba(7,16,31,.46) !important; }
.impact-site .impact-booking-page { color: #eef4ff !important; }
.impact-site .impact-booking-back { color: rgba(238,244,255,.68) !important; }
.impact-site .impact-booking-title { color: #f7fbff !important; text-shadow: 0 0 22px rgba(47,107,255,.42); }
.impact-site .impact-booking-description { color: rgba(238,244,255,.72) !important; }
.impact-site .impact-booking-panel { color: #eef4ff !important; border-color: rgba(76,201,255,.26) !important; background: rgba(3,7,18,.74) !important; box-shadow: 0 24px 70px rgba(0,0,0,.38), 0 0 42px rgba(47,107,255,.18); }
.impact-site .impact-booking-panel-heading { border-color: rgba(76,201,255,.2) !important; }
.impact-site .impact-booking-step, .impact-site .impact-booking-label { color: rgba(238,244,255,.66) !important; }
.impact-site .impact-booking-field { border-color: rgba(76,201,255,.3) !important; background: rgba(255,255,255,.1) !important; color: #fff !important; box-shadow: inset 0 0 18px rgba(47,107,255,.04); }
.impact-site .impact-booking-field::placeholder { color: rgba(238,244,255,.58) !important; }
.impact-site .impact-booking-field option { background: #050811; color: #fff; }
.impact-site[data-impact-theme="light"] .impact-booking-page { color: #07101f !important; }
.impact-site[data-impact-theme="light"] .impact-booking-back { color: rgba(7,16,31,.68) !important; }
.impact-site[data-impact-theme="light"] .impact-booking-title { color: #07101f !important; text-shadow: 0 0 22px rgba(47,107,255,.2); }
.impact-site[data-impact-theme="light"] .impact-booking-description { color: rgba(7,16,31,.72) !important; }
.impact-site[data-impact-theme="light"] .impact-booking-panel { color: #07101f !important; border-color: rgba(47,107,255,.22) !important; background: rgba(255,255,255,.82) !important; box-shadow: 0 24px 70px rgba(31,80,180,.12), 0 0 38px rgba(47,107,255,.1); }
.impact-site[data-impact-theme="light"] .impact-booking-panel h2, .impact-site[data-impact-theme="light"] .impact-booking-panel p { color: #07101f !important; }
.impact-site[data-impact-theme="light"] .impact-booking-panel-heading { border-color: rgba(47,107,255,.18) !important; }
.impact-site[data-impact-theme="light"] .impact-booking-step, .impact-site[data-impact-theme="light"] .impact-booking-label { color: rgba(7,16,31,.66) !important; }
.impact-site[data-impact-theme="light"] .impact-booking-field { border-color: rgba(47,107,255,.25) !important; background: rgba(255,255,255,.94) !important; color: #07101f !important; box-shadow: inset 0 0 18px rgba(47,107,255,.035); }
.impact-site[data-impact-theme="light"] .impact-booking-field::placeholder { color: rgba(7,16,31,.5) !important; }
.impact-site[data-impact-theme="light"] .impact-booking-field option { background: #fff; color: #07101f; }
.impact-site .public-footer-shell { margin-top: 0 !important; margin-bottom: 0 !important; border-top: 0 !important; }
.impact-site .public-header-shell { border-bottom: 1px solid rgba(76,201,255,.18); }
.impact-site:not(.impact-page-home) main:first-of-type { padding-top: 6.5rem !important; }
.impact-site .public-footer-video { opacity: 1; filter: none; object-position: center top; }
.impact-site .public-footer-video-overlay { background: linear-gradient(90deg, rgba(2,3,10,.38), rgba(2,3,10,.12) 48%, rgba(2,3,10,.36)), linear-gradient(180deg, rgba(2,3,10,.12), rgba(47,107,255,.04), rgba(2,3,10,.34)); }
.impact-site[data-impact-theme="light"] .public-footer-video-overlay { background: linear-gradient(90deg, rgba(255,255,255,.46), rgba(255,255,255,.16) 48%, rgba(255,255,255,.44)), linear-gradient(180deg, rgba(255,255,255,.18), rgba(47,107,255,.04), rgba(255,255,255,.38)); }
.impact-site[data-impact-theme="light"] .public-footer-shell { color: #07101f !important; text-shadow: 0 1px 0 rgba(255,255,255,.45); }
.impact-site main h2 { font-family: "Space Grotesk", "Helvetica Neue", Arial, sans-serif !important; font-size: 1.45rem !important; line-height: 1.08 !important; font-weight: 600 !important; letter-spacing: 0 !important; text-transform: uppercase !important; color: #eaf2ff !important; text-shadow: 0 0 18px rgba(47,107,255,.34) !important; }
.impact-site[data-impact-theme="light"] main h2 { color: #07101f !important; text-shadow: 0 0 18px rgba(47,107,255,.16) !important; }
/* the shared block components emit these utility class names for every brand */
.impact-site .vielusos-fluid { width: 90% !important; max-width: none !important; padding-left: 0 !important; padding-right: 0 !important; }
.impact-site .vielusos-media-shell { padding-left: 0 !important; padding-right: 0 !important; }
.impact-site .vielusos-media-shell .text-gray-500 { color: rgba(234,242,255,.76) !important; }
.impact-site[data-impact-theme="light"] .vielusos-media-shell .text-gray-500 { color: rgba(7,16,31,.72) !important; }
.impact-site .public-social-block a { color: rgba(247,251,255,.96) !important; border-color: rgba(76,201,255,.24) !important; background: rgba(255,255,255,.035); text-shadow: 0 0 16px rgba(47,107,255,.55); box-shadow: 0 0 18px rgba(47,107,255,.14), inset 0 0 14px rgba(76,201,255,.035); }
.impact-site .public-social-block a:hover { color: #ffffff !important; background: rgba(47,107,255,.12); border-color: rgba(76,201,255,.65) !important; box-shadow: 0 0 24px rgba(47,107,255,.48), inset 0 0 18px rgba(76,201,255,.08); }
.impact-site[data-impact-theme="light"] .public-social-block a { color: rgba(7,16,31,.96) !important; background: rgba(255,255,255,.58); border-color: rgba(47,107,255,.18) !important; text-shadow: 0 0 16px rgba(47,107,255,.26); box-shadow: 0 0 18px rgba(47,107,255,.12), inset 0 0 18px rgba(255,255,255,.52); }
.impact-site .social-mark-monochrome, .impact-site .impact-social-mark { color: currentColor !important; filter: drop-shadow(0 0 8px rgba(76,201,255,.72)) !important; }
.impact-site[data-impact-theme="light"] .social-mark-monochrome, .impact-site[data-impact-theme="light"] .impact-social-mark { color: currentColor !important; filter: drop-shadow(0 0 8px rgba(47,107,255,.42)) !important; }
.impact-site .impact-social-row, .impact-site .impact-streaming-row, .impact-site .impact-header-social-row, .impact-site .impact-footer-social-row { display: flex; align-items: center; gap: .75rem; overflow-x: auto; overflow-y: hidden; white-space: nowrap; flex-wrap: nowrap; max-width: 100%; padding: .5rem .25rem .65rem; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.impact-site .impact-social-row::-webkit-scrollbar, .impact-site .impact-streaming-row::-webkit-scrollbar, .impact-site .impact-header-social-row::-webkit-scrollbar, .impact-site .impact-footer-social-row::-webkit-scrollbar { display: none; }
.impact-site .impact-social-row, .impact-site .impact-streaming-row { justify-content: center; }
.impact-site .impact-social-row { gap: .65rem; padding-top: .2rem; }
.impact-site .impact-header-social-row { margin-top: .75rem; padding-top: .75rem; }
.impact-site .impact-footer-social-row { justify-content: center; flex-wrap: wrap; overflow: visible; white-space: normal; opacity: 1 !important; }
.impact-site .impact-streaming-shell { max-width: none !important; }
.impact-site .impact-streaming-icon-link { display: grid; height: 3.35rem; width: 3.35rem; flex: 0 0 auto; place-items: center; border: 1px solid rgba(76,201,255,.24); border-radius: 1rem; color: #f7fbff; background: rgba(255,255,255,.045); box-shadow: 0 0 22px rgba(47,107,255,.22), inset 0 0 18px rgba(76,201,255,.04); transition: transform .2s ease, border-color .2s ease, background .2s ease, box-shadow .2s ease; }
.impact-site .impact-streaming-icon-link:hover { transform: translateY(-2px); border-color: rgba(76,201,255,.72); background: rgba(47,107,255,.12); box-shadow: 0 0 28px rgba(47,107,255,.52); }
.impact-site[data-impact-theme="light"] .impact-streaming-icon-link { color: #07101f; background: rgba(255,255,255,.62); border-color: rgba(47,107,255,.18); box-shadow: 0 0 18px rgba(47,107,255,.18), inset 0 0 20px rgba(255,255,255,.55); }
.impact-site .impact-streaming-icon-link svg *, .impact-site .impact-streaming-icon-link span[aria-hidden="true"] { color: currentColor !important; fill: currentColor !important; stroke: currentColor !important; }
.impact-site .impact-track-kicker { color: rgba(234,242,255,.82) !important; text-shadow: 0 0 14px rgba(47,107,255,.38); }
.impact-site[data-impact-theme="light"] .impact-track-kicker { color: rgba(7,16,31,.86) !important; text-shadow: 0 0 14px rgba(47,107,255,.2); }
.impact-site .impact-track-kicker img { filter: brightness(0) invert(1) drop-shadow(0 0 8px rgba(76,201,255,.62)); }
.impact-site[data-impact-theme="light"] .impact-track-kicker img { filter: brightness(0) drop-shadow(0 0 8px rgba(47,107,255,.34)); }
.impact-site .vielusos-media-shell [style*="box-shadow"] { box-shadow: 0 18px 40px -18px rgba(47,107,255,.55) !important; }
.impact-site .public-block-shell a[style*="background"], .impact-site .public-block-shell button[style*="background"] { box-shadow: 0 0 26px rgba(47,107,255,.45); }
.impact-site .impact-official-platform-label { color: rgba(234,242,255,.96); text-shadow: 0 0 14px rgba(47,107,255,.32); }
.impact-site .impact-official-platform-label img { filter: drop-shadow(0 0 8px rgba(47,107,255,.4)); }
.impact-site .impact-official-platform-section { width: 100%; }
.impact-site .impact-official-rail { width: 100%; margin-left: 0 !important; margin-right: 0 !important; padding-left: 0 !important; padding-right: 0 !important; scroll-padding-left: 0; }
.impact-site .impact-official-player-card { flex: 0 0 min(82vw,21rem) !important; width: min(82vw, 21rem) !important; max-width: 21rem !important; height: auto !important; border-radius: .85rem; border: 1px solid rgba(76,201,255,.18); color: #eef4ff; background: rgba(3,6,14,.72); box-shadow: 0 18px 50px rgba(0,0,0,.26), 0 0 34px rgba(47,107,255,.12); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.impact-official-artwork { position: relative; aspect-ratio: 16/10; overflow: hidden; background: #02030a; }
.impact-official-artwork > img { position: absolute; inset: 0; height: 100%; width: 100%; object-fit: cover; object-position: center; }
.impact-official-artwork-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.02), rgba(0,0,0,.3)); }
.impact-official-play-button { position: absolute; left: 50%; top: 50%; z-index: 2; display: grid; height: 3rem; width: 3rem; transform: translate(-50%,-50%); place-items: center; border-radius: 999px; color: #fff; box-shadow: 0 0 0 1px rgba(255,255,255,.3), 0 0 24px rgba(47,107,255,.5); transition: transform .2s ease, filter .2s ease; }
.impact-official-play-button:hover { transform: translate(-50%,-50%) scale(1.07); filter: brightness(1.08); }
.impact-official-meta { min-height: 5.25rem; padding: .85rem 1rem .95rem; border-top: 1px solid rgba(255,255,255,.08); }
.impact-official-meta h3 { display: -webkit-box; min-height: 2.2rem; overflow: hidden; color: #f7fbff; font-size: .88rem; font-weight: 650; line-height: 1.25; white-space: normal; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.impact-official-meta p { margin-top: .35rem; color: rgba(234,242,255,.7); font-size: .7rem; font-weight: 500; text-transform: uppercase; }
.impact-official-inline-player { height: 9.5rem; overflow: hidden; border-top: 1px solid rgba(76,201,255,.16); background: #050811; }
.impact-site .impact-official-player-card iframe { display: block; background: transparent; }
.impact-site[data-impact-theme="light"] .impact-official-player-card { border-color: rgba(47,107,255,.18); background: rgba(255,255,255,.22); box-shadow: 0 18px 46px rgba(31,80,180,.08), 0 0 28px rgba(47,107,255,.13); }
.impact-site[data-impact-theme="light"] .impact-official-platform-label { color: #07101f; text-shadow: 0 0 14px rgba(47,107,255,.18); }
.impact-site[data-impact-theme="light"] .impact-official-player-card { color: #07101f; background: rgba(255,255,255,.68); }
.impact-site[data-impact-theme="light"] .impact-official-meta { border-color: rgba(47,107,255,.1); }
.impact-site[data-impact-theme="light"] .impact-official-meta h3 { color: #07101f; }
.impact-site[data-impact-theme="light"] .impact-official-meta p { color: rgba(7,16,31,.7); }
.impact-site .public-header-shell a, .impact-site .public-header-shell button { font-size: .82rem !important; }
.impact-site .public-header-shell [href*="booking"] { padding: .55rem .9rem !important; border-radius: .72rem !important; }
.impact-site .impact-header-dropdown { background: rgba(2,3,10,.5) !important; }
.impact-site[data-impact-theme="light"] .impact-header-dropdown { background: rgba(244,248,255,.5) !important; border: 1px solid rgba(47,107,255,.28) !important; color: #07101f !important; box-shadow: 0 22px 60px rgba(31,80,180,.22), 0 0 0 1px rgba(255,255,255,.72) inset !important; -webkit-backdrop-filter: blur(24px) saturate(1.25); backdrop-filter: blur(24px) saturate(1.25); }
.impact-site[data-impact-theme="light"] .impact-header-dropdown img { filter: none !important; }
.impact-site[data-impact-theme="light"] .impact-header-dropdown a:not([style]) { color: #07101f !important; border-color: rgba(47,107,255,.12) !important; }
.impact-site .impact-menu-button { color: #eaf2ff !important; border-color: rgba(76,201,255,.26) !important; background: rgba(2,3,10,.18) !important; box-shadow: 0 0 18px rgba(47,107,255,.18); }
.impact-site[data-impact-theme="light"] .impact-menu-button, .impact-site[data-impact-theme="light"] .public-header-menu-button { border-color: rgba(47,107,255,.24) !important; color: #07101f !important; background: rgba(255,255,255,.45) !important; box-shadow: 0 0 18px rgba(47,107,255,.18); }
.impact-site[data-impact-theme="light"] .impact-theme-toggle { border-color: rgba(47,107,255,.18) !important; background: rgba(47,107,255,.06); }
.impact-site .impact-language-menu-row { border-color: rgba(76,201,255,.18); background: rgba(255,255,255,.025); color: rgba(234,242,255,.82); }
.impact-site[data-impact-theme="light"] .impact-language-menu-row { border-color: rgba(47,107,255,.16); background: rgba(47,107,255,.045); color: #07101f; }
.impact-site .impact-header-dropdown nav a { min-height: 2.55rem; padding: .62rem .85rem !important; font-size: .92rem !important; font-weight: 500 !important; }
.impact-site .impact-header-dropdown .public-language-switcher, .impact-site .impact-header-dropdown [class*="LanguageSwitcher"] { font-size: .78rem !important; }
.impact-playlist-button { position: relative; display: grid; height: 3.35rem; width: 3.35rem; flex: 0 0 auto; place-items: center; border-radius: 999px; isolation: isolate; }
.impact-playlist-button::before { display: none; }
.impact-playlist-button::after { content: ""; position: absolute; inset: .16rem; z-index: 2; background: linear-gradient(110deg, transparent 18%, rgba(30,94,255,0) 30%, rgba(126,168,255,.9) 48%, rgba(30,94,255,.34) 54%, transparent 68%); background-size: 240% 100%; -webkit-mask: center / contain no-repeat url('/impact/helmet-cutout.png'); mask: center / contain no-repeat url('/impact/helmet-cutout.png'); mix-blend-mode: screen; opacity: .9; animation: impact-helmet-light-sweep 3s ease-in-out infinite; }
.impact-playlist-head { position: relative; z-index: 1; height: 2.86rem; width: 2.86rem; object-fit: contain; filter: brightness(1) saturate(1.04); animation: impact-helmet-luminosity 3s ease-in-out infinite; will-change: filter; }
.impact-playlist-button:hover .impact-playlist-head, .impact-playlist-button:hover::after { animation-duration: 1.8s; }
.impact-playlist-button:active .impact-playlist-head { filter: brightness(1.16) saturate(1.2); }
.impact-page-loader { position: fixed; inset: 0; z-index: 9999; display: grid; min-height: 100dvh; place-items: center; background: radial-gradient(circle at 50% 50%, rgba(30,94,255,.28), transparent 26rem), rgba(2,3,10,.72); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); animation: impact-loader-fade .74s ease both; }
.impact-site[data-impact-theme="light"] .impact-page-loader { background: radial-gradient(circle at 50% 50%, rgba(30,94,255,.18), transparent 26rem), rgba(255,255,255,.74); }
.impact-loader-card { display: grid; width: min(92vw, 34rem); place-items: center; gap: 1.35rem; }
.impact-loader-head { position: relative; width: clamp(10.5rem, 25vw, 17rem); aspect-ratio: 1; filter: drop-shadow(0 0 26px rgba(30,94,255,.78)); animation: impact-loader-glitch-in .58s steps(2,end) both, impact-loader-float 1.6s ease-in-out .58s infinite alternate; }
.impact-loader-head::before, .impact-loader-head::after { content: ""; position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0; background: center / contain no-repeat url('/impact/helmet-cutout.png'); mix-blend-mode: screen; }
.impact-loader-head::before { filter: hue-rotate(210deg) saturate(1.8) drop-shadow(-8px 0 0 rgba(30,94,255,.75)); animation: impact-loader-glitch-blue .58s steps(2,end) both; }
.impact-loader-head::after { filter: hue-rotate(260deg) saturate(1.6) drop-shadow(8px 0 0 rgba(255,255,255,.4)); animation: impact-loader-glitch-white .58s steps(2,end) both; }
.impact-loader-head img { position: absolute; inset: 0; height: 100%; width: 100%; object-fit: contain; }
.impact-loader-head-base { opacity: .22; filter: grayscale(1) brightness(.78); }
.impact-loader-head-fill { clip-path: inset(100% 0 0 0); animation: impact-head-fill .72s cubic-bezier(.2,.9,.16,1) forwards; filter: saturate(1.08) hue-rotate(8deg); }
.impact-loader-bar { height: 3px; width: min(22rem, 68vw); overflow: hidden; border-radius: 999px; background: rgba(234,242,255,.2); box-shadow: 0 0 18px rgba(30,94,255,.26); }
.impact-loader-bar span { display: block; height: 100%; width: 100%; transform-origin: left; transform: scaleX(0); border-radius: inherit; background: linear-gradient(90deg, #1e5eff, #2f6bff, #f7fbff); animation: impact-bar-fill .72s cubic-bezier(.2,.9,.16,1) forwards; }
@keyframes impact-helmet-luminosity {
  0%, 100% { filter: brightness(1) saturate(1.04); }
  42% { filter: brightness(1.14) saturate(1.15); }
  52% { filter: brightness(1.24) saturate(1.22); }
}
@keyframes impact-helmet-aura {
  0%, 100% { opacity: .28; filter: brightness(1.05) saturate(1.2) blur(.2px) drop-shadow(0 0 8px rgba(30,94,255,.58)); }
  50% { opacity: .72; filter: brightness(1.32) saturate(1.5) blur(.35px) drop-shadow(0 0 17px rgba(30,94,255,.95)) drop-shadow(0 0 28px rgba(30,94,255,.52)); }
}
@keyframes impact-helmet-light-sweep {
  0%, 24% { background-position: 150% 0; opacity: 0; }
  40% { opacity: .9; }
  62% { background-position: -90% 0; opacity: .82; }
  76%, 100% { background-position: -120% 0; opacity: 0; }
}
@keyframes impact-head-fill { 0% { clip-path: inset(100% 0 0 0); } 72% { clip-path: inset(8% 0 0 0); } 100% { clip-path: inset(0 0 0 0); } }
@keyframes impact-bar-fill { to { transform: scaleX(1); } }
@keyframes impact-loader-fade { 0% { opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } 100% { opacity: .92; } }
@keyframes impact-loader-glitch-in {
  0% { opacity: 0; transform: translate3d(-14px, 6px, 0) scale(.96); clip-path: inset(42% 0 48% 0); }
  18% { opacity: 1; transform: translate3d(12px, -4px, 0) scale(1.04); clip-path: inset(8% 0 68% 0); }
  34% { transform: translate3d(-7px, 2px, 0) scale(.99); clip-path: inset(62% 0 12% 0); }
  52% { transform: translate3d(5px, 0, 0) scale(1.02); clip-path: inset(24% 0 36% 0); }
  72%, 100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); clip-path: inset(0); }
}
@keyframes impact-loader-glitch-blue {
  0%, 100% { opacity: 0; transform: translateX(0); clip-path: inset(0); }
  12% { opacity: .9; transform: translateX(-10px); clip-path: inset(12% 0 72% 0); }
  33% { opacity: .7; transform: translateX(8px); clip-path: inset(48% 0 34% 0); }
  54% { opacity: .55; transform: translateX(-5px); clip-path: inset(76% 0 7% 0); }
}
@keyframes impact-loader-glitch-white {
  0%, 100% { opacity: 0; transform: translateX(0); clip-path: inset(0); }
  16% { opacity: .55; transform: translateX(9px); clip-path: inset(30% 0 54% 0); }
  38% { opacity: .48; transform: translateX(-7px); clip-path: inset(64% 0 19% 0); }
  58% { opacity: .36; transform: translateX(4px); clip-path: inset(5% 0 82% 0); }
}
@keyframes impact-loader-float { to { transform: translateY(-5px); } }
@keyframes impact-light-bg-glitch {
  0%, 79%, 100% { opacity: 0; transform: translate3d(0,0,0); clip-path: inset(0); }
  80% { opacity: .72; transform: translate3d(-14px,0,0); clip-path: inset(7% 0 66% 0); }
  82% { opacity: .46; transform: translate3d(12px,0,0); clip-path: inset(30% 0 40% 0); }
  84% { opacity: .86; transform: translate3d(-9px,0,0); clip-path: inset(55% 0 17% 0); }
  86% { opacity: .5; transform: translate3d(7px,0,0); clip-path: inset(73% 0 6% 0); }
  88% { opacity: 0; transform: translate3d(0,0,0); clip-path: inset(0); }
}
@keyframes impact-light-crt-interference {
  0%, 79%, 100% { opacity: 0; transform: translate3d(0,0,0) scaleY(1); background-position: 0 0, 0 0; }
  80% { opacity: .76; transform: translate3d(11px,-2px,0) scaleY(.994); background-position: 0 18px, 3vw 0; }
  82% { opacity: .4; transform: translate3d(-8px,3px,0) scaleY(1.013); background-position: 0 -23px, -4vw 0; }
  84% { opacity: .84; transform: translate3d(14px,0,0) scaleY(.989); background-position: 0 33px, 5vw 0; }
  86% { opacity: .44; transform: translate3d(-9px,-1px,0) scaleY(1.008); background-position: 0 -14px, -3vw 0; }
  88% { opacity: 0; transform: translate3d(0,0,0) scaleY(1); background-position: 0 0, 0 0; }
}
@keyframes impact-dark-figure-glitch {
  0%, 69%, 100% { opacity: 0; transform: translate3d(0,0,0) scale(1); clip-path: inset(0); }
  70% { opacity: .34; transform: translate3d(-10px,0,0) scale(1.007); clip-path: inset(0 0 58% 0); }
  73% { opacity: .5; transform: translate3d(12px,-2px,0) scale(1.011); clip-path: inset(22% 0 34% 0); }
  76% { opacity: .32; transform: translate3d(-7px,3px,0) scale(1.006); clip-path: inset(56% 0 10% 0); }
  79% { opacity: .44; transform: translate3d(4px,0,0) scale(1.004); clip-path: inset(0); }
  82% { opacity: 0; transform: translate3d(0,0,0) scale(1); clip-path: inset(0); }
}
@keyframes impact-dark-crt-interference {
  0%, 69%, 100% { opacity: 0; transform: translate3d(0,0,0) scaleY(1); background-position: 0 0, 0 0; }
  70% { opacity: .72; transform: translate3d(-12px,2px,0) scaleY(.992); background-position: 0 19px, -4vw 0; }
  73% { opacity: .4; transform: translate3d(9px,-3px,0) scaleY(1.014); background-position: 0 -27px, 3vw 0; }
  76% { opacity: .84; transform: translate3d(-15px,1px,0) scaleY(.987); background-position: 0 35px, -5vw 0; }
  79% { opacity: .46; transform: translate3d(11px,0,0) scaleY(1.008); background-position: 0 -17px, 4vw 0; }
  82% { opacity: 0; transform: translate3d(0,0,0) scaleY(1); background-position: 0 0, 0 0; }
}

.impact-hero { position: relative; z-index: 2; width: 100%; height: auto !important; max-height: none; margin: 0; aspect-ratio: 16/9; border: 0; border-bottom: 1px solid rgba(76,201,255,.18); border-radius: 0; background: #02030a; box-shadow: 0 24px 80px rgba(0,0,0,.32), 0 0 44px rgba(47,107,255,.16); }
.impact-hero-light-media { display: none; }
.impact-hero-dark-media { display: block; filter: none; transform: scale(1.008); transform-origin: center top; }
.impact-site:not([data-impact-theme="light"]) .impact-hero { border-bottom: 0; }
.impact-hero-overlay { display: none; }
.impact-hero-content { display: none !important; }
.impact-hero-logo { filter: drop-shadow(0 0 16px rgba(47,107,255,.42)); }
.impact-hero-name { color: #fff; text-shadow: 0 0 26px rgba(47,107,255,.72), 0 0 52px rgba(76,201,255,.34); }
.impact-hero-tagline { color: #9dc7ff; }
.impact-site[data-impact-theme="light"] .impact-hero { width: 100%; aspect-ratio: 1080/566; background: #fff; border-color: rgba(47,107,255,.16); box-shadow: 0 22px 70px rgba(31,80,180,.12), 0 0 34px rgba(47,107,255,.1); }
.impact-site[data-impact-theme="light"] .impact-hero-dark-media { display: none; }
.impact-site[data-impact-theme="light"] .impact-hero-light-media { display: block; filter: none; opacity: 1; }
.impact-site[data-impact-theme="light"] .impact-hero-overlay { display: none; }
.impact-site[data-impact-theme="light"] .impact-hero-content { display: none !important; }
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
.impact-stat-label { margin-top: .55rem; font-size: .68rem; line-height: 1.35; color: rgba(234,242,255,.72); }
.impact-stats-source { margin-top: .75rem; font-size: .68rem; color: rgba(234,242,255,.58); }
.impact-site[data-impact-theme="light"] .impact-stat-card { background: rgba(255,255,255,.66); border-color: rgba(47,107,255,.14); box-shadow: 0 12px 36px rgba(31,80,180,.07); }
.impact-site[data-impact-theme="light"] .impact-stat-value { color: #07101f; text-shadow: 0 0 14px rgba(47,107,255,.16); }
.impact-site[data-impact-theme="light"] .impact-stat-label { color: rgba(7,16,31,.72); }
.impact-site[data-impact-theme="light"] .impact-stats-source { color: rgba(7,16,31,.64); }

.impact-gallery-grid { width: 90%; margin: 0 auto; columns: 3; column-gap: 16px; }
.impact-gallery-frame { break-inside: avoid; margin: 0 0 16px; overflow: hidden; border-radius: 16px; background: #fff; border: 1px solid rgba(76,201,255,.22); box-shadow: 0 18px 55px rgba(0,0,0,.24); }
.impact-gallery-frame img { display: block; width: 100%; height: auto; object-fit: contain; }
.impact-site[data-impact-theme="light"] .impact-gallery-frame { border-color: rgba(47,107,255,.14); box-shadow: 0 20px 55px rgba(31,80,180,.1); }
.impact-bio-carousel { display: grid; width: min(100%, 34rem); justify-self: center; gap: 10px; }
.impact-bio-carousel-window { position: relative; width: 100%; aspect-ratio: 4/5; overflow: hidden; border: 1px solid rgba(76,201,255,.2); border-radius: 8px; background: rgba(255,255,255,.035); box-shadow: 0 18px 50px -18px rgba(47,107,255,.44); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.impact-bio-carousel-image { position: absolute; inset: 0; height: 100%; width: 100%; object-fit: cover; object-position: center; opacity: 0; transform: scale(.985); transition: opacity .42s ease, transform .42s ease; }
.impact-bio-carousel-image.is-active { opacity: 1; transform: scale(1); }
.impact-bio-flash { pointer-events: none; position: absolute; inset: 0; opacity: 0; background: linear-gradient(90deg, transparent, rgba(76,201,255,.78), transparent); mix-blend-mode: screen; transform: translateX(-100%); }
.impact-bio-flash.is-visible { animation: impact-blue-flash .14s ease-out; }
.impact-bio-strip { display: grid; width: 100%; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; overflow: hidden; }
.impact-bio-thumb { aspect-ratio: 1; display: grid; place-items: center; overflow: hidden; border: 1px solid rgba(76,201,255,.16); border-radius: 6px; background: rgba(255,255,255,.05); opacity: .58; transition: opacity .18s ease, border-color .18s ease, transform .18s ease; }
.impact-bio-thumb:hover, .impact-bio-thumb.is-active { opacity: 1; border-color: rgba(76,201,255,.72); transform: translateY(-1px); }
.impact-bio-thumb img { height: 100%; width: 100%; object-fit: cover; object-position: center center; }
.impact-site[data-impact-theme="light"] .impact-bio-carousel-window, .impact-site[data-impact-theme="light"] .impact-bio-thumb { background: rgba(255,255,255,.08); border-color: rgba(47,107,255,.18); box-shadow: 0 16px 44px rgba(31,80,180,.06); -webkit-backdrop-filter: blur(1.5px); backdrop-filter: blur(1.5px); }
.impact-site[data-impact-theme="light"] .impact-bio-carousel-image { filter: saturate(.96) contrast(1.02); }
@keyframes impact-blue-flash { 0% { opacity: 0; transform: translateX(-100%); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateX(100%); } }
.impact-site section[data-no-translate] { background: rgba(7,11,26,.14) !important; -webkit-backdrop-filter: blur(3px) !important; backdrop-filter: blur(3px) !important; }
.impact-site[data-impact-theme="light"] section[data-no-translate] { background: rgba(255,255,255,.07) !important; border-color: rgba(47,107,255,.14) !important; -webkit-backdrop-filter: blur(1px) !important; backdrop-filter: blur(1px) !important; }
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
  .impact-site .impact-official-player-card { flex-basis: calc((100% - 3rem) / 4) !important; }
}
@media (max-width: 640px) {
  html:has(.impact-site[data-impact-theme="light"]), body:has(.impact-site[data-impact-theme="light"]) { background: #fff !important; }
  .impact-site .vielusos-fluid, .impact-gallery-grid { width: 92% !important; }
  .impact-site::after { inset: 0; height: 100dvh; width: 100vw; background-position: center center; background-size: auto 112dvh; }
  .impact-site[data-impact-theme="light"] { background-image: linear-gradient(90deg, rgba(47,107,255,.035) 1px, transparent 1px), linear-gradient(180deg, rgba(47,107,255,.028) 1px, transparent 1px) !important; background-position: center top, center top !important; background-size: 14rem 14rem, 14rem 14rem !important; }
  .impact-site[data-impact-theme="light"]::before { display: none; }
  .impact-site[data-impact-theme="light"] main { position: relative; isolation: isolate; overflow: clip; }
  .impact-light-fixed-background-base, .impact-light-fixed-background-glitch { background-position: right top; background-size: min(156vw,44rem) auto; }
  .impact-hero, .impact-site[data-impact-theme="light"] .impact-hero { width: 100%; margin-top: 0; border-left: 0; border-right: 0; border-radius: 0; }
  .impact-site .impact-social-row, .impact-site .impact-streaming-row { justify-content: flex-start; padding-left: .5rem; padding-right: .5rem; }
  .impact-playlist-button { height: 2.95rem; width: 2.95rem; }
  .impact-playlist-head, .impact-playlist-button::after { height: 2.5rem; width: 2.5rem; }
  .impact-loader-card { width: min(92vw, 24rem); }
  .impact-loader-head { width: clamp(10rem, 48vw, 13.5rem); }
  .impact-loader-bar { width: min(18rem, 72vw); }
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
