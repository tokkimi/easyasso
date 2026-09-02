import type { HeaderConfig } from '@/lib/blocks';
import { IMPACT_BRAND } from '@/lib/impact';

// Dual-theme IMPACT hero. Both loops come from the artist's original footage:
// the existing teaser for light mode and the helmet/skull stage visual for dark.
export function ImpactHero({ title, config }: { title: string; config?: HeaderConfig['vielusosHero'] }) {
  const lightVideoUrl = config?.videoUrl || '/impact/hero-teaser-web.mp4';
  // The dark artwork is intentionally fixed to the final black-background
  // helmet loop. Older database values still point at the temporary festival
  // teaser, so letting that value win would make production regress after an
  // editor save or an older seed.
  const darkVideoUrl = '/impact/hero-dark-casque.mp4';
  return (
    <section className="impact-hero relative isolate aspect-video w-full overflow-hidden" aria-label={title}>
      <video className="impact-hero-light-media absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
        <source src={lightVideoUrl} type="video/mp4" />
      </video>
      <video className="impact-hero-dark-media absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster="/impact/videos/posters/impact-live-03.jpg" aria-hidden="true">
        <source src={darkVideoUrl} type="video/mp4" />
      </video>
      <div className="impact-hero-overlay absolute inset-0" aria-hidden="true" />
      <div className="impact-hero-content relative flex h-full items-center justify-center px-6 text-center">
        <div className="flex max-w-xl flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {config?.showLogo !== false && <img src={IMPACT_BRAND.logoUrl} alt="" className="impact-hero-logo mb-4 h-16 w-16 rounded-lg object-contain md:h-20 md:w-20" />}
          {config?.showName !== false && <p className="impact-hero-name text-2xl font-semibold uppercase leading-none md:text-4xl" style={{ fontFamily: '"Space Grotesk", Arial, sans-serif' }}>{title.toUpperCase()}</p>}
          {config?.showTagline !== false && <h1 className="impact-hero-tagline mt-3 text-[11px] font-light uppercase md:text-sm" style={{ fontFamily: '"Space Grotesk", Arial, sans-serif' }}>RAW · ELECTRONIC · ENERGY</h1>}
        </div>
      </div>
    </section>
  );
}
