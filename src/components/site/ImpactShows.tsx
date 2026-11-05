'use client';

import { useEffect, useRef, useState } from 'react';
import { safePublicUrl } from '@/lib/render';

type ShowItem = { url?: string; title?: string; artist?: string; releaseDate?: string; thumbnail?: string };

const MONTHS = ['JANV.', 'FÉVR.', 'MARS', 'AVR.', 'MAI', 'JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'];

function parseDay(value?: string) {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

// "Prochaines dates": posters in a horizontal swipe, each opening its ticket
// link (Shotgun…). Past dates disappear on their own. The "Book" button below
// leads to the booking page. Managed in the editor with the same block as the
// releases: Titre = event, Artiste = lieu / ville, Date = date, Pochette =
// affiche, Lien = billetterie.
export function ImpactShows({ content, bookingHref = '/booking', auto = false }: { content: any; bookingHref?: string; auto?: boolean }) {
  // The automatic section (under the releases) steps aside as soon as a real
  // "Prochaines dates" block exists on the page.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (auto && document.querySelector('[data-impact-shows="block"]')) setHidden(true);
  }, [auto]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const shows = (Array.isArray(content?.items) ? content.items : [])
    .filter((item: ShowItem) => item && (item.thumbnail || item.title))
    .map((item: ShowItem) => ({ ...item, day: parseDay(item.releaseDate) }))
    .filter((item: ShowItem & { day: Date | null }) => !item.day || item.day >= today)
    .sort((a: { day: Date | null }, b: { day: Date | null }) => (a.day && b.day ? a.day.getTime() - b.day.getTime() : a.day ? -1 : b.day ? 1 : 0));

  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      setActive(Math.round(el.scrollLeft / (card.offsetWidth + 16)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  const goTo = (index: number) => {
    const el = rail.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  if (hidden) return null;
  return (
    <section data-impact-shows={auto ? 'auto' : 'block'} className={`vielusos-fluid mx-auto w-full max-w-4xl px-4 text-white ${auto ? 'px-0 pt-14' : 'pt-6'}`}>
      <h2 className="text-3xl font-black uppercase tracking-tight md:text-4xl">{content?.title || 'Prochaines dates'}</h2>
      {content?.intro && <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-60">{content.intro}</p>}
      {shows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-white/15 bg-black/50 px-5 py-10 text-center text-sm text-white/60">Prochaines dates bientôt annoncées.</p>
      ) : (
        <>
          <div ref={rail} className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {shows.map((show: ShowItem & { day: Date | null }, i: number) => {
              const href = safePublicUrl(show.url || '');
              const poster = safePublicUrl(show.thumbnail || '', { allowRelative: true, allowDataImage: true });
              const card = (
                <>
                  <div className="aspect-square w-full overflow-hidden rounded-xl bg-black/40">
                    {poster && /* eslint-disable-next-line @next/next/no-img-element */ <img src={poster} alt={show.title || 'Affiche'} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />}
                  </div>
                  <div className="px-2 pb-3 pt-5 text-center">
                    {show.day && <p className="text-4xl font-black tracking-tight sm:text-5xl">{show.day.getDate()} {MONTHS[show.day.getMonth()]}</p>}
                    {show.title && <p className="mt-3 text-xl font-bold uppercase tracking-wide">{show.title}</p>}
                    {show.artist && <p className="mt-2 text-sm text-white/75">{show.artist}</p>}
                    {href && <p className="mt-4 inline-flex rounded-full border border-[#4cc9ff]/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9fdcff]">Billets</p>}
                  </div>
                </>
              );
              const className = 'group block w-[86%] shrink-0 snap-center rounded-3xl border border-white/20 bg-black/60 p-4 backdrop-blur sm:w-[70%] md:w-[46%]';
              return href
                ? <a key={`${show.title}-${i}`} href={href} target="_blank" rel="noreferrer" className={className}>{card}</a>
                : <div key={`${show.title}-${i}`} className={className}>{card}</div>;
            })}
          </div>
          {shows.length > 1 && (
            <div className="mt-4 flex justify-center gap-3">
              {shows.map((_: unknown, i: number) => (
                <button key={i} type="button" aria-label={`Date ${i + 1}`} onClick={() => goTo(i)} className={`h-2.5 rounded-full transition-all ${i === active ? 'w-2.5 scale-125 bg-white' : 'w-2 bg-white/60'}`} />
              ))}
            </div>
          )}
        </>
      )}
      <div className="mt-8 flex justify-center">
        <a href={bookingHref} className="rounded-md bg-gradient-to-r from-[#1f4fff] to-[#0b2a8f] px-9 py-4 text-base font-black uppercase tracking-wide text-white shadow-[0_0_30px_rgba(47,107,255,.45)] transition hover:brightness-110">Book your show</a>
      </div>
    </section>
  );
}
