import { Play, Instagram, Music2, Youtube, Music } from 'lucide-react';
import { safePublicUrl, videoEmbed } from '@/lib/render';

export type Track = { title?: string; artist?: string; url?: string; thumbnail?: string; year?: string; source?: string };

// ---- Sons / Playlist -------------------------------------------------------
export function MusicTracks({ content }: { content: any }) {
  const tracks: Track[] = Array.isArray(content?.tracks) ? content.tracks : [];
  const layout = content?.layout === 'list' ? 'list' : 'grid';
  const clean = tracks.filter((t) => t && (t.title || t.thumbnail || t.url));

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      {content?.title && <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{content.title}</h2>}
      {clean.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Ajoutez vos sons — leurs pochettes s’afficheront automatiquement.</p>
      ) : layout === 'list' ? (
        <div className="mt-5 space-y-2">
          {clean.map((t, i) => {
            const href = safePublicUrl(t.url || '');
            const Row = (
              <div className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
                  {t.thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.thumbnail} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-gray-900">{t.title || 'Titre'}</p>
                  <p className="truncate text-sm text-gray-500">{t.artist || t.source || ''}</p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-400"><Play className="h-5 w-5" /></span>
              </div>
            );
            return href ? <a key={i} href={href} target="_blank" rel="noreferrer" className="block">{Row}</a> : <div key={i}>{Row}</div>;
          })}
        </div>
      ) : (
        <div className="mt-5 -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {clean.map((t, i) => {
            const href = safePublicUrl(t.url || '');
            return (
              <div key={i} className="w-60 shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
                <div className="aspect-square w-full overflow-hidden bg-gray-100">
                  {t.thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />}
                </div>
                <div className="p-4">
                  {t.year && <p className="text-xs font-bold tracking-widest text-[var(--brand)]">{t.year}</p>}
                  <p className="mt-1 truncate text-lg font-extrabold text-gray-900">{t.title || 'Titre'}</p>
                  <p className="truncate text-sm text-gray-500">{t.artist || ''}</p>
                  {t.source && <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">{t.source}</p>}
                  {href && (
                    <a href={href} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-2.5 text-sm font-bold text-white transition hover:opacity-90"><Play className="h-4 w-4" /> Écouter</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Vidéos YouTube --------------------------------------------------------
export function VideoGrid({ content }: { content: any }) {
  const videos: { url?: string; title?: string }[] = Array.isArray(content?.videos) ? content.videos : [];
  const clean = videos.filter((v) => v && v.url);
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      {content?.title && <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{content.title}</h2>}
      {clean.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Ajoutez des liens YouTube — les vidéos s’intègrent automatiquement.</p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clean.map((v, i) => {
            const src = safePublicUrl(videoEmbed(v.url || ''));
            return (
              <div key={i}>
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-sm">
                  {src && <iframe src={src} className="absolute inset-0 h-full w-full" allowFullScreen title={v.title || `video-${i}`} />}
                </div>
                {v.title && <p className="mt-2 truncate text-sm font-semibold text-gray-800">{v.title}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Liens streaming (stylés) ---------------------------------------------
const STREAMING = [
  { key: 'spotify', label: 'Spotify', color: '#1DB954' },
  { key: 'deezer', label: 'Deezer', color: '#A238FF' },
  { key: 'appleMusic', label: 'Apple Music', color: '#FA57C1' },
  { key: 'soundcloud', label: 'SoundCloud', color: '#FF5500' },
  { key: 'youtube', label: 'YouTube', color: '#FF0000' },
];
function StreamingIcon({ k }: { k: string }) {
  if (k === 'youtube') return <Youtube className="h-5 w-5" />;
  if (k === 'soundcloud') return <Music className="h-5 w-5" />;
  return <Music2 className="h-5 w-5" />;
}
export function StreamingLinks({ content }: { content: any }) {
  const links = content?.links || {};
  const items = STREAMING.filter((s) => links[s.key]);
  return (
    <div className="mx-auto w-full max-w-4xl px-4 text-center">
      {content?.title && <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{content.title}</h2>}
      {items.length === 0 ? (
        <p className="py-8 text-sm text-gray-400">Ajoutez vos liens Spotify, Deezer, Apple Music, SoundCloud, YouTube.</p>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {items.map((s) => (
            <a key={s.key} href={safePublicUrl(links[s.key]) || '#'} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
              style={{ boxShadow: `0 8px 20px -8px ${s.color}66` }}>
              <span style={{ color: s.color }}><StreamingIcon k={s.key} /></span> {s.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Aperçu Instagram ------------------------------------------------------
export function InstagramPreview({ content }: { content: any }) {
  const username = String(content?.username || '').replace(/^@/, '');
  const profileUrl = safePublicUrl(content?.url || (username ? `https://instagram.com/${username}` : ''));
  const posts: { image?: string; url?: string }[] = Array.isArray(content?.posts) ? content.posts.filter((p: any) => p?.image) : [];
  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="overflow-hidden rounded-3xl bg-gray-950 p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><Instagram className="h-6 w-6 text-white" /></span>
          <div className="min-w-0 flex-1"><p className="truncate font-extrabold">{username ? `@${username}` : content?.title || 'Instagram'}</p><p className="text-xs text-white/60">Instagram</p></div>
          {profileUrl && <a href={profileUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-900">Suivre</a>}
        </div>
        {posts.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {posts.slice(0, 9).map((p, i) => {
              const href = safePublicUrl(p.url || profileUrl || '');
              const cell = (
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.image && <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />}
                </div>
              );
              return href ? <a key={i} href={href} target="_blank" rel="noreferrer">{cell}</a> : <div key={i}>{cell}</div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
