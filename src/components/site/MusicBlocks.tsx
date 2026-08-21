import { Play, Instagram, Music2, Youtube, CalendarDays } from 'lucide-react';
import { safePublicUrl, videoEmbed } from '@/lib/render';

export type Track = { title?: string; artist?: string; url?: string; thumbnail?: string; year?: string; source?: string };
type PlayerItem = { platform?: string; url?: string; title?: string; artist?: string; releaseDate?: string };

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
  if (k === 'soundcloud') {
    return <svg viewBox="0 0 44 28" className="h-5 w-8" aria-hidden="true"><path fill="currentColor" d="M31 27H11a11 11 0 0 1 0-22 12 12 0 0 1 21 5 8.5 8.5 0 0 1-1 17ZM3 15h2v10H3Zm5-6h2v18H8Zm5-4h2v22h-2Zm5-1h2v23h-2Zm5 2h2v21h-2Z" /></svg>;
  }
  if (k === 'spotify') {
    return <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="currentColor" /><path d="M8.2 12.2c5.4-1.8 11.3-1 15.2 1.3M9.5 16c4.4-1.3 9-.8 12.2 1M10.7 19.5c3.2-.9 6.5-.5 9 .7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" className="text-black/75" /></svg>;
  }
  if (k === 'deezer') {
    return <svg viewBox="0 0 36 30" className="h-5 w-6" aria-hidden="true"><path fill="#ff0092" d="M0 20h7v7H0z" /><path fill="#ff8c00" d="M8 13h7v14H8z" /><path fill="#00c7f2" d="M16 6h7v21h-7z" /><path fill="#a238ff" d="M24 0h7v27h-7z" /></svg>;
  }
  return <Music2 className="h-5 w-5" />;
}

function streamingLinkClass(style: string) {
  if (style === 'transparent-dark') return 'bg-white/0 text-gray-950 ring-1 ring-gray-950/20 hover:bg-gray-950/5';
  if (style === 'text-white') return 'bg-transparent px-2 text-white shadow-none hover:opacity-75';
  if (style === 'text-black') return 'bg-transparent px-2 text-gray-950 shadow-none hover:opacity-75';
  return 'bg-gray-950 text-white hover:opacity-90';
}
export function StreamingLinks({ content }: { content: any }) {
  const links = content?.links || {};
  const items = STREAMING.filter((s) => links[s.key]);
  const linkStyle = content?.linkStyle || 'dark-button';
  const glowColor = content?.glowColor || '';
  const textOnly = linkStyle === 'text-white' || linkStyle === 'text-black';
  return (
    <div className="mx-auto w-full max-w-4xl px-4 text-center">
      {content?.title && <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{content.title}</h2>}
      {items.length === 0 ? (
        <p className="py-8 text-sm text-gray-400">Ajoutez vos liens Spotify, Deezer, Apple Music, SoundCloud, YouTube.</p>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {items.map((s) => (
            <a key={s.key} href={safePublicUrl(links[s.key]) || '#'} target="_blank" rel="noreferrer"
              className={`inline-flex items-center gap-2.5 rounded-full py-3 text-sm font-bold transition ${textOnly ? '' : 'px-5'} ${streamingLinkClass(linkStyle)}`}
              style={textOnly ? undefined : { boxShadow: `0 12px 26px -12px ${(glowColor || s.color)}aa` }}>
              <span style={{ color: s.color }}><StreamingIcon k={s.key} /></span> {s.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Lecteurs officiels Spotify / SoundCloud / Deezer / YouTube -----------
function detectPlatform(rawUrl = '', forced = '') {
  const forcedPlatform = String(forced || '').toLowerCase();
  if (['spotify', 'soundcloud', 'deezer', 'youtube'].includes(forcedPlatform)) return forcedPlatform;
  const u = String(rawUrl).toLowerCase();
  if (u.includes('open.spotify.com')) return 'spotify';
  if (u.includes('soundcloud.com')) return 'soundcloud';
  if (u.includes('deezer.com')) return 'deezer';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  return '';
}

function spotifyEmbed(rawUrl: string) {
  const clean = safePublicUrl(rawUrl);
  if (!clean) return '';
  try {
    const u = new URL(clean);
    if (!u.hostname.includes('open.spotify.com')) return '';
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return '';
    const [kind, id] = parts;
    if (!['track', 'album', 'playlist', 'artist', 'episode', 'show'].includes(kind)) return '';
    return `https://open.spotify.com/embed/${kind}/${id}`;
  } catch { return ''; }
}

function soundCloudEmbed(rawUrl: string) {
  const clean = safePublicUrl(rawUrl);
  if (!clean) return '';
  try {
    const u = new URL(clean);
    if (!u.hostname.includes('soundcloud.com')) return '';
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(clean)}&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&visual=true`;
  } catch { return ''; }
}

function deezerEmbed(rawUrl: string) {
  const clean = safePublicUrl(rawUrl);
  if (!clean) return '';
  try {
    const u = new URL(clean);
    if (!u.hostname.includes('deezer.com')) return '';
    const parts = u.pathname.split('/').filter(Boolean);
    const typeIndex = parts.findIndex((part) => ['track', 'album', 'playlist', 'artist'].includes(part));
    if (typeIndex < 0 || !parts[typeIndex + 1]) return '';
    return `https://widget.deezer.com/widget/dark/${parts[typeIndex]}/${parts[typeIndex + 1]}`;
  } catch { return ''; }
}

function officialEmbed(item: PlayerItem) {
  const platform = detectPlatform(item.url, item.platform);
  if (platform === 'spotify') return spotifyEmbed(item.url || '');
  if (platform === 'soundcloud') return soundCloudEmbed(item.url || '');
  if (platform === 'deezer') return deezerEmbed(item.url || '');
  if (platform === 'youtube') return safePublicUrl(videoEmbed(item.url || ''));
  return '';
}

function platformLabel(platform: string) {
  if (platform === 'spotify') return 'Spotify';
  if (platform === 'soundcloud') return 'SoundCloud';
  if (platform === 'deezer') return 'Deezer';
  if (platform === 'youtube') return 'YouTube';
  return 'Lecteur';
}

function PlatformLogo({ platform }: { platform: string }) {
  if (platform === 'youtube') {
    return <span className="inline-flex items-center gap-2 font-black text-[#ff0000]"><span className="grid h-7 w-10 place-items-center rounded-lg bg-[#ff0000] text-white"><Play className="h-4 w-4 fill-current" /></span>YouTube</span>;
  }
  if (platform === 'spotify') {
    return (
      <span className="inline-flex items-center gap-2 font-black text-[#1db954]">
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="currentColor" /><path d="M8.2 12.2c5.4-1.8 11.3-1 15.2 1.3M9.5 16c4.4-1.3 9-.8 12.2 1M10.7 19.5c3.2-.9 6.5-.5 9 .7" fill="none" stroke="#0a0a0a" strokeLinecap="round" strokeWidth="2.2" /></svg>
        Spotify
      </span>
    );
  }
  if (platform === 'soundcloud') {
    return (
      <span className="inline-flex items-center gap-2 font-black text-[#ff5500]">
        <svg viewBox="0 0 44 28" className="h-7 w-11" aria-hidden="true"><path fill="currentColor" d="M31 27H11a11 11 0 0 1 0-22 12 12 0 0 1 21 5 8.5 8.5 0 0 1-1 17ZM3 15h2v10H3Zm5-6h2v18H8Zm5-4h2v22h-2Zm5-1h2v23h-2Zm5 2h2v21h-2Z" /></svg>
        SoundCloud
      </span>
    );
  }
  if (platform === 'deezer') {
    return (
      <span className="inline-flex items-center gap-2 font-black text-[#a238ff]">
        <svg viewBox="0 0 36 30" className="h-7 w-9" aria-hidden="true">
          <path fill="#ff0092" d="M0 20h7v7H0z" /><path fill="#ff8c00" d="M8 13h7v14H8z" /><path fill="#00c7f2" d="M16 6h7v21h-7z" /><path fill="#a238ff" d="M24 0h7v27h-7z" />
        </svg>
        Deezer
      </span>
    );
  }
  return <span className="inline-flex items-center gap-2 font-black"><Music2 className="h-6 w-6" />Lecteur</span>;
}

export function OfficialPlayers({ content }: { content: any }) {
  const items: PlayerItem[] = Array.isArray(content?.items) ? content.items : [];
  const clean = items
    .filter((item) => item?.url && officialEmbed(item))
    .sort((a, b) => {
      if (content?.sort === 'manual') return 0;
      const da = Date.parse(a.releaseDate || '');
      const db = Date.parse(b.releaseDate || '');
      if (Number.isNaN(da) && Number.isNaN(db)) return 0;
      if (Number.isNaN(da)) return 1;
      if (Number.isNaN(db)) return -1;
      return db - da;
    });

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="max-w-2xl">
        {content?.title && <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{content.title}</h2>}
        {content?.intro && <p className="mt-2 text-sm leading-relaxed text-gray-500">{content.intro}</p>}
      </div>
      {clean.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Ajoutez des liens Spotify, SoundCloud, Deezer ou YouTube : les lecteurs officiels s’afficheront ici.</p>
      ) : (
        <div className="mt-6 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {clean.map((item, i) => {
            const platform = detectPlatform(item.url, item.platform);
            const src = officialEmbed(item);
            const isVideo = platform === 'youtube';
            return (
              <article key={`${item.url}-${i}`} className="w-[74vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 md:w-[300px]">
                <div className="flex min-h-[82px] flex-col justify-between gap-2 border-b border-gray-100 p-3">
                  <PlatformLogo platform={platform} />
                  <div>
                    {item.title && <h3 className="line-clamp-2 text-base font-extrabold text-gray-900">{item.title}</h3>}
                    {item.artist && <p className="mt-1 truncate text-sm text-gray-500">{item.artist}</p>}
                    {item.releaseDate && <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-gray-400"><CalendarDays className="h-3.5 w-3.5" /> {new Date(item.releaseDate).toLocaleDateString('fr-FR')}</p>}
                  </div>
                </div>
                <div className={isVideo ? 'relative aspect-video bg-black' : 'bg-gray-50 p-2'}>
                  <iframe
                    src={src}
                    title={`${platformLabel(platform)} ${item.title || i + 1}`}
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    className={isVideo ? 'absolute inset-0 h-full w-full border-0' : 'h-[250px] w-full rounded-xl border-0'}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Aperçu Instagram (posts en temps réel via l'embed officiel) -----------
function instaEmbedUrl(url: string): string {
  const m = String(url).match(/instagram\.com\/(?:[^/]+\/)?(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : '';
}
export function InstagramPreview({ content }: { content: any }) {
  const username = String(content?.username || '').replace(/^@/, '');
  const profileUrl = safePublicUrl(content?.url || (username ? `https://instagram.com/${username}` : ''));
  const count = Math.max(1, Math.min(12, Number(content?.count) || 6));
  const embeds = (Array.isArray(content?.postUrls) ? content.postUrls : []).map(instaEmbedUrl).filter(Boolean).slice(0, count);
  const embedCode = typeof content?.embedCode === 'string' ? content.embedCode.trim() : '';
  // Legacy: manually uploaded post images.
  const images: { image?: string; url?: string }[] = Array.isArray(content?.posts) ? content.posts.filter((p: any) => p?.image).slice(0, count) : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4">
      <div className="flex flex-wrap items-center justify-center gap-3 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><Instagram className="h-6 w-6 text-white" /></span>
        <div className="text-left">
          {content?.title && <p className="text-xl font-extrabold">{content.title}</p>}
          {username && <p className="text-sm text-gray-500">@{username}</p>}
        </div>
        {profileUrl && <a href={profileUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90">Suivre</a>}
      </div>

      {embedCode ? (
        <div className="mt-6">
          <iframe title="Instagram" srcDoc={embedCode} sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" className="min-h-[560px] w-full rounded-2xl border-0 bg-transparent" />
        </div>
      ) : embeds.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {embeds.map((src: string, i: number) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <iframe src={src} title={`instagram-${i}`} loading="lazy" scrolling="no" className="h-[500px] w-full border-0" />
            </div>
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="mt-6 grid grid-cols-3 gap-2">
          {images.map((p, i) => {
            const href = safePublicUrl(p.url || profileUrl || '');
            const cell = (
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image && <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />}
              </div>
            );
            return href ? <a key={i} href={href} target="_blank" rel="noreferrer">{cell}</a> : <div key={i}>{cell}</div>;
          })}
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-gray-400">Ajoutez les liens de vos posts Instagram — ils s’afficheront ici en direct.</p>
      )}
    </div>
  );
}
