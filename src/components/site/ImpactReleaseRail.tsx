'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { safePublicUrl } from '@/lib/render';

type ReleaseItem = { platform?: string; url?: string; title?: string; artist?: string; releaseDate?: string; thumbnail?: string };

function platformOf(rawUrl = '') {
  const u = rawUrl.toLowerCase();
  if (u.includes('spotify.com')) return 'Spotify';
  if (u.includes('soundcloud.com')) return 'SoundCloud';
  if (u.includes('deezer.com') || u.includes('dzr.page.link')) return 'Deezer';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  if (u.includes('music.apple.com')) return 'Apple Music';
  if (u.includes('beatport.com')) return 'Beatport';
  if (u.includes('bandcamp.com')) return 'Bandcamp';
  if (u.includes('shotgun.live')) return 'Shotgun';
  return '';
}

// IMPACT: one rail of releases (not split by platform). Each card shows the
// cover and opens the external link set in the editor. Covers come from the
// item's "Pochette" field, or the YouTube thumbnail when none is set.
export function ImpactReleaseRail({ content }: { content: any }) {
  const railId = 'impact-release-rail';
  const items: ReleaseItem[] = (Array.isArray(content?.items) ? content.items : [])
    .filter((item: ReleaseItem) => item && safePublicUrl(item.url || ''))
    .slice()
    .sort((a: ReleaseItem, b: ReleaseItem) => {
      if (content?.sort === 'manual') return 0;
      const da = Date.parse(a.releaseDate || '');
      const db = Date.parse(b.releaseDate || '');
      if (Number.isNaN(da) && Number.isNaN(db)) return 0;
      if (Number.isNaN(da)) return 1;
      if (Number.isNaN(db)) return -1;
      return db - da;
    });
  const scroll = (left: number) => document.getElementById(railId)?.scrollBy({ left, behavior: 'smooth' });
  const arrow = 'absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur transition hover:bg-black/85';
  return (
    <div className="vielusos-fluid vielusos-media-shell mx-auto w-full max-w-6xl px-4 pt-6">
      <div className="max-w-2xl">
        {content?.title && <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{content.title}</h2>}
        {content?.intro && <p className="mt-2 text-sm leading-relaxed opacity-60">{content.intro}</p>}
      </div>
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm opacity-50">Ajoutez vos sorties dans l’éditeur : lien, titre et pochette.</p>
      ) : (
        <div className="relative mt-6">
          {items.length > 1 && (
            <>
              <button type="button" aria-label="Sorties précédentes" onClick={() => scroll(-330)} className={`${arrow} left-1`}><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" aria-label="Sorties suivantes" onClick={() => scroll(330)} className={`${arrow} right-1`}><ChevronRight className="h-5 w-5" /></button>
            </>
          )}
          <div id={railId} className="impact-official-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item, i) => {
              const href = safePublicUrl(item.url || '');
              const ytId = item.url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1];
              const cover = safePublicUrl(item.thumbnail || '', { allowRelative: true, allowDataImage: true }) || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '');
              const platform = platformOf(item.url);
              return (
                <a key={`${item.url}-${i}`} href={href} target="_blank" rel="noreferrer" className="impact-official-player-card vielusos-player-card group block shrink-0 snap-start overflow-hidden" aria-label={`${item.title || 'Sortie'} : ouvrir le lien`}>
                  <div className="impact-official-artwork" style={{ aspectRatio: '1 / 1' }}>
                    {cover && /* eslint-disable-next-line @next/next/no-img-element */ <img src={cover} alt={`Pochette de ${item.title || 'la sortie'}`} loading="lazy" decoding="async" className="transition duration-300 group-hover:scale-105" />}
                    <span className="impact-official-artwork-shade" aria-hidden="true" />
                  </div>
                  <div className="impact-official-meta">
                    <h3>{item.title || platform || 'Sortie'}</h3>
                    <p>{item.artist || 'IMPACT'}{platform ? ` · ${platform}` : ''}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
