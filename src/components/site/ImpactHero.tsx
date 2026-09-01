import type { HeaderConfig } from '@/lib/blocks';
import { IMPACT_BRAND } from '@/lib/impact';

// Hero for the IMPACT profile — electric-blue neon over a glassy, techno
// backdrop. Uses an optional looping video (config.videoUrl); otherwise falls
// back to the brand background so nothing is ever broken/empty.
export function ImpactHero({ title, config }: { title: string; config?: HeaderConfig['vielusosHero'] }) {
  return (
    <section className="relative isolate aspect-video w-full overflow-hidden bg-[#05070f]" aria-label={title}>
      {config?.videoUrl ? (
        <video className="absolute inset-0 h-full w-full object-cover opacity-70" autoPlay muted loop playsInline preload="metadata" poster={IMPACT_BRAND.backgroundUrl} aria-hidden="true">
          <source src={config.videoUrl} type="video/mp4" />
        </video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={IMPACT_BRAND.backgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" aria-hidden="true" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2f6bff]/15 via-[#05070f]/35 to-[#05070f]" aria-hidden="true" />
      <div className="absolute inset-0 [background:radial-gradient(60%_50%_at_50%_18%,rgba(76,201,255,.28),transparent_70%)]" aria-hidden="true" />
      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="flex max-w-xl flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {config?.showLogo !== false && <img src={IMPACT_BRAND.logoUrl} alt="" className="mb-5 h-28 w-28 rounded-2xl object-contain opacity-95 drop-shadow-[0_0_28px_rgba(47,107,255,.65)] md:h-40 md:w-40" />}
          {config?.showName !== false && <p className="text-4xl font-bold uppercase leading-none tracking-[0.28em] text-white md:text-6xl" style={{ fontFamily: '"Space Grotesk", Arial, sans-serif', textShadow: '0 0 26px rgba(47,107,255,.7), 0 0 52px rgba(76,201,255,.35)' }}>{title.toUpperCase()}</p>}
          {config?.showTagline !== false && <h1 className="mt-5 text-sm font-light uppercase tracking-[0.34em] text-[#9dc7ff] md:text-lg" style={{ fontFamily: '"Space Grotesk", Arial, sans-serif' }}>RAW · ELECTRONIC · ENERGY</h1>}
        </div>
      </div>
    </section>
  );
}
