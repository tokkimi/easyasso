import type { HeaderConfig } from '@/lib/blocks';
import { IMPACT_BRAND } from '@/lib/impact';

// Dual-theme IMPACT hero. Both loops come from the artist's original footage:
// the existing teaser for light mode and the helmet/skull stage visual for dark.
export function ImpactHero({ title, config }: { title: string; config?: HeaderConfig['vielusosHero'] }) {
  const lightVideoUrl = config?.videoUrl || '/impact/hero-teaser-web.mp4';
  const darkVideoUrl = config?.darkVideoUrl || '/impact/hero-dark-skeleton.mp4';
  return (
    <section className="impact-hero relative isolate aspect-video w-full overflow-hidden" aria-label={title}>
      <video className="impact-hero-light-media absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
        <source src={lightVideoUrl} type="video/mp4" />
      </video>
      <video className="impact-hero-dark-media absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster="/impact/videos/posters/impact-live-03.jpg" aria-hidden="true">
        <source src={darkVideoUrl} type="video/mp4" />
      </video>
      <div className="impact-hero-overlay absolute inset-0" aria-hidden="true" />
      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="flex max-w-xl flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {config?.showLogo !== false && <img src={IMPACT_BRAND.logoUrl} alt="" className="impact-hero-logo mb-4 h-20 w-20 rounded-2xl object-contain md:h-28 md:w-28" />}
          {config?.showName !== false && <p className="impact-hero-name text-3xl font-bold uppercase leading-none tracking-[0.28em] md:text-5xl" style={{ fontFamily: '"Space Grotesk", Arial, sans-serif' }}>{title.toUpperCase()}</p>}
          {config?.showTagline !== false && <h1 className="impact-hero-tagline mt-4 text-[11px] font-light uppercase tracking-[0.34em] md:text-sm" style={{ fontFamily: '"Space Grotesk", Arial, sans-serif' }}>RAW · ELECTRONIC · ENERGY</h1>}
        </div>
      </div>
    </section>
  );
}
