'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { ImpactShows } from './ImpactShows';
import { X } from 'lucide-react';
import { safePublicUrl } from '@/lib/render';

type ReleaseItem = { platform?: string; url?: string; title?: string; artist?: string; releaseDate?: string; thumbnail?: string };
type Release = { key: string; title: string; artist: string; cover: string; date: number; links: { platform: string; url: string }[] };

const PLATFORMS: Record<string, { label: string; icon?: string; action: string }> = {
  spotify: { label: 'Spotify', icon: '/integrations/spotify.svg', action: 'Écouter' },
  youtube: { label: 'YouTube', icon: '/integrations/youtube.svg', action: 'Regarder' },
  soundcloud: { label: 'SoundCloud', icon: '/integrations/soundcloud.svg', action: 'Écouter' },
  deezer: { label: 'Deezer', icon: '/integrations/deezer.svg', action: 'Écouter' },
  applemusic: { label: 'Apple Music', icon: '/integrations/applemusic.svg', action: 'Écouter' },
  beatport: { label: 'Beatport', action: 'Acheter' },
  bandcamp: { label: 'Bandcamp', action: 'Acheter' },
  hardstyle: { label: 'Hardstyle.com', action: 'Télécharger' },
  shotgun: { label: 'Shotgun', action: 'Billets' },
  link: { label: 'Lien', action: 'Ouvrir' },
};

function platformOf(rawUrl = '', declared = '') {
  const u = rawUrl.toLowerCase();
  if (u.includes('spotify.com')) return 'spotify';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('soundcloud.com')) return 'soundcloud';
  if (u.includes('deezer.com') || u.includes('dzr.page.link')) return 'deezer';
  if (u.includes('music.apple.com')) return 'applemusic';
  if (u.includes('beatport.com')) return 'beatport';
  if (u.includes('bandcamp.com')) return 'bandcamp';
  if (u.includes('hardstyle.com')) return 'hardstyle';
  if (u.includes('shotgun.live')) return 'shotgun';
  const d = declared.toLowerCase().replace(/[^a-z]/g, '');
  return PLATFORMS[d] ? d : 'link';
}

const ORDER = ['spotify', 'applemusic', 'deezer', 'youtube', 'soundcloud', 'beatport', 'bandcamp', 'hardstyle', 'shotgun', 'link'];
const titleKey = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '');

// Every official IMPACT link per release, so a release shows all of its
// platforms even when a block only lists some of them. Links added in the
// editor (same title) are merged with these.
const IMPACT_CATALOG: { title: string; url: string }[] = [
  { title: 'MAYDAY', url: 'https://open.spotify.com/track/593KEnbri737YiL6rqQ6rh' },
  { title: 'MAYDAY', url: 'https://music.apple.com/fr/song/mayday/1860372401' },
  { title: 'MAYDAY', url: 'https://www.youtube.com/watch?v=XDoDJk4KxT0' },
  { title: 'MAYDAY', url: 'https://soundcloud.com/impactdj_raw/mayday' },
  { title: 'YOU MADE IT', url: 'https://open.spotify.com/track/00Wuied8VMJHv1FQEvQgTe' },
  { title: 'YOU MADE IT', url: 'https://music.apple.com/fr/song/you-made-it/1879401619' },
  { title: 'YOU MADE IT', url: 'https://soundcloud.com/impactdj_raw/you-made-it' },
  { title: 'LOCK THE DOOR', url: 'https://open.spotify.com/track/2yMBrQS2RaEuaqeoMg79Kb' },
  { title: 'LOCK THE DOOR', url: 'https://music.apple.com/fr/song/lock-the-door/1840803496' },
  { title: 'LOCK THE DOOR', url: 'https://www.youtube.com/watch?v=wgzh2zgDcNc' },
  { title: 'LOCK THE DOOR', url: 'https://soundcloud.com/impactdj_raw/lock-the-door-vf-2' },
  { title: 'POWER OF DESTRUCTION', url: 'https://open.spotify.com/track/02UzYVHuaclC9y4HMo4qtN' },
  { title: 'POWER OF DESTRUCTION', url: 'https://www.youtube.com/watch?v=LfrPnKEjGKY' },
  { title: 'POWER OF DESTRUCTION', url: 'https://soundcloud.com/impactdj_raw/power-of-destruction' },
];

// IMPACT artist profiles, shown as a row of icons under the releases.
const IMPACT_PROFILES: { platform: string; url: string }[] = [
  { platform: 'spotify', url: 'https://open.spotify.com/artist/3AiyQHD9YDWhPX6rKJLkXZ' },
  { platform: 'deezer', url: 'https://link.deezer.com/s/32FJ0eJdg95ujwvQN8jFV' },
  { platform: 'applemusic', url: 'https://music.apple.com/fr/artist/impact/1815586907' },
  { platform: 'soundcloud', url: 'https://on.soundcloud.com/gFkxJhH119PUD8bvJG' },
  { platform: 'youtube', url: 'https://www.youtube.com/channel/UCdqrxBgSQ7ReX0FmaQBIAfw' },
];

// The editor stores one entry per platform link. Entries sharing a title are
// one release: one card on the site, and the platform choice when clicked.
function groupReleases(content: any): Release[] {
  const items: ReleaseItem[] = Array.isArray(content?.items) ? content.items : [];
  const map = new Map<string, Release>();
  items.forEach((item, index) => {
    const url = safePublicUrl(item?.url || '');
    if (!url) return;
    const title = String(item.title || '').trim();
    const key = title ? titleKey(title) : `untitled-${index}`;
    const ytId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1];
    const cover = safePublicUrl(item.thumbnail || '', { allowRelative: true, allowDataImage: true }) || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '');
    const date = Date.parse(item.releaseDate || '');
    const platform = platformOf(url, item.platform);
    const release = map.get(key) || { key, title: title || PLATFORMS[platform].label, artist: '', cover: '', date: NaN, links: [] };
    if (!release.artist && item.artist) release.artist = item.artist;
    // Prefer a square streaming cover over a YouTube video thumbnail.
    if (cover && (!release.cover || (release.cover.includes('i.ytimg.com') && !cover.includes('i.ytimg.com')))) release.cover = cover;
    if (!Number.isNaN(date) && (Number.isNaN(release.date) || date > release.date)) release.date = date;
    if (!release.links.some((l) => l.url === url)) release.links.push({ platform, url });
    map.set(key, release);
  });
  for (const entry of IMPACT_CATALOG) {
    const release = map.get(titleKey(entry.title));
    if (release && !release.links.some((l) => l.url === entry.url || l.platform === platformOf(entry.url))) {
      release.links.push({ platform: platformOf(entry.url), url: entry.url });
    }
  }
  const releases = Array.from(map.values());
  releases.forEach((r) => r.links.sort((a, b) => ORDER.indexOf(a.platform) - ORDER.indexOf(b.platform)));
  if (content?.sort !== 'manual') {
    releases.sort((a, b) => {
      if (Number.isNaN(a.date) && Number.isNaN(b.date)) return 0;
      if (Number.isNaN(a.date)) return 1;
      if (Number.isNaN(b.date)) return -1;
      return b.date - a.date;
    });
  }
  return releases;
}

function PlatformName({ platform }: { platform: string }) {
  const p = PLATFORMS[platform] || PLATFORMS.link;
  return (
    <span className="flex min-w-0 items-center gap-3">
      {p.icon ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.icon} alt="" className="h-7 w-7 shrink-0 object-contain" /> : <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-black">{p.label[0]}</span>}
      <span className="truncate text-base font-bold">{p.label}</span>
    </span>
  );
}

// IMPACT releases, like a smart-link page: a list of releases (latest first,
// highlighted "OUT NOW"); clicking one opens the choice of platforms.
export function ImpactReleaseRail({ content }: { content: any }) {
  const releases = groupReleases(content);
  // On the home page, the next shows and the booking button follow the releases.
  const pathname = usePathname() || '';
  const isHome = pathname === '/' || /^\/s\/[^/]+\/?$/.test(pathname);
  const [open, setOpen] = useState<Release | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.setAttribute('data-overlay-open', 'release');
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = overflow; document.body.removeAttribute('data-overlay-open'); window.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="vielusos-fluid vielusos-media-shell mx-auto w-full max-w-4xl px-4 pt-6">
      {content?.title && <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">{content.title}</h2>}
      {content?.intro && <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-60">{content.intro}</p>}
      {releases.length === 0 ? (
        <p className="py-10 text-center text-sm opacity-50">Ajoutez vos sorties dans l’éditeur : un lien par plateforme, avec le même titre.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {releases.map((release, index) => {
            const featured = index === 0;
            return (
              <button
                key={release.key}
                type="button"
                onClick={() => setOpen(release)}
                className={`group flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 sm:gap-5 ${featured ? 'border-[#4cc9ff]/50 bg-gradient-to-r from-[#1f4fff] to-[#0b2a8f] text-white shadow-[0_0_40px_rgba(47,107,255,.35)]' : 'border-white/15 bg-black/55 text-white backdrop-blur hover:border-[#4cc9ff]/60 hover:shadow-[0_0_28px_rgba(47,107,255,.25)]'}`}
              >
                <span className={`relative shrink-0 overflow-hidden rounded-xl bg-black/40 ${featured ? 'h-24 w-24 sm:h-32 sm:w-32' : 'h-16 w-16 sm:h-20 sm:w-20'}`}>
                  {release.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={release.cover} alt={`Pochette de ${release.title}`} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />}
                </span>
                <span className="min-w-0 flex-1">
                  {featured && <span className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]"><span className="h-2.5 w-2.5 rounded-full bg-white" /> Out now</span>}
                  <span className={`block font-black uppercase leading-tight ${featured ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg'}`}>{release.title}</span>
                  <span className="mt-1 block truncate text-sm opacity-70">{release.artist || 'IMPACT'}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {releases.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-7">
          {IMPACT_PROFILES.map((profile) => (
            <a key={profile.platform} href={profile.url} target="_blank" rel="noreferrer" aria-label={`IMPACT sur ${PLATFORMS[profile.platform].label}`} className="opacity-90 transition hover:scale-110 hover:opacity-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PLATFORMS[profile.platform].icon} alt="" className="h-9 w-9 object-contain [filter:brightness(0)_invert(1)]" />
            </a>
          ))}
        </div>
      )}

      {isHome && <ImpactShows content={{ title: 'Prochaines dates', items: [] }} auto />}

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.title}>
          <div className="relative max-h-[94vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b0f1a] p-5 text-white shadow-2xl sm:rounded-3xl sm:p-6" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(null)} aria-label="Fermer" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white"><X className="h-5 w-5" /></button>
            {open.cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={open.cover} alt={`Pochette de ${open.title}`} className="mx-auto aspect-square w-full max-w-[22rem] rounded-xl object-cover shadow-xl" />}
            <h3 className="mt-5 text-center text-2xl font-bold leading-tight">{open.title}</h3>
            <p className="mt-1 text-center text-white/70">{open.artist || 'IMPACT'}</p>
            <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] px-4">
              {open.links.map((link) => (
                <div key={link.url} className="flex items-center justify-between gap-3 py-4">
                  <PlatformName platform={link.platform} />
                  <a href={link.url} target="_blank" rel="noreferrer" className="w-32 shrink-0 rounded-lg border border-white/30 py-2.5 text-center text-sm font-semibold transition hover:bg-white hover:text-black">{(PLATFORMS[link.platform] || PLATFORMS.link).action}</a>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
