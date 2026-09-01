'use client';

import { useLanguage } from '@/components/language-provider';
import type { HeaderConfig } from '@/lib/blocks';

const DEFAULT_FR = [
  'IMPACT est un projet de musique électronique brute et physique, pensé pour le club et la scène. Chaque set est construit comme une montée continue : tension, énergie et basses qui frappent, sans temps mort.',
  'Entre techno tranchante et impulsions plus mélodiques, le projet cultive le contraste et l’intensité. Le son est direct, immersif, taillé pour le dancefloor.',
  'DJ · PRODUCTION · LIVE',
];

const DEFAULT_EN = [
  'IMPACT is a raw, physical electronic music project made for the club and the stage. Every set is built as one continuous rise: tension, energy and bass that hits, with no dead time.',
  'Moving between sharp techno and more melodic impulses, the project thrives on contrast and intensity. The sound is direct, immersive, built for the dancefloor.',
  'DJ · PRODUCTION · LIVE',
];

export function ImpactBio({ blocks = [], config }: { blocks?: any[]; config?: HeaderConfig['vielusosBio'] }) {
  const { locale } = useLanguage();
  const copyFromBlocks = blocks
    .flatMap((block) => {
      const content = (block?.content || {}) as Record<string, unknown>;
      return [content.text, content.body, content.description, content.subtitle];
    })
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 40)
    .filter((value) => !/(association|associatif|bénévole|bénévoles|don|adhérent|public accompagné|partenaires)/i.test(value))
    .map((value) => value.trim())
    .slice(0, 3);

  const english = locale === 'en';
  const frenchParagraphs = config?.paragraphsFr?.filter(Boolean) || [];
  const englishParagraphs = (config?.paragraphsEn?.filter(Boolean) || config?.paragraphs?.filter(Boolean)) || [];
  const paragraphs = english
    ? (englishParagraphs.length ? englishParagraphs : DEFAULT_EN)
    : (frenchParagraphs.length ? frenchParagraphs : copyFromBlocks.length ? copyFromBlocks : DEFAULT_FR);
  const eyebrow = english
    ? (config?.eyebrowEn || config?.eyebrow || 'IMPACT · ARTIST')
    : (config?.eyebrowFr || config?.eyebrow || 'IMPACT · ARTISTE');
  const title = english
    ? (config?.titleEn || 'ABOUT')
    : (config?.titleFr || config?.title || 'À PROPOS');

  return (
    <section data-no-translate className="relative overflow-hidden border-y border-[#4cc9ff]/18 bg-[#070b1a]/45 px-5 py-12 backdrop-blur-xl md:px-12 md:py-20">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_60%_at_15%_0%,rgba(47,107,255,.2),transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.05fr_.95fr] md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#9dc7ff]">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-bold uppercase tracking-[0.14em] text-white md:text-5xl" style={{ fontFamily: '"Space Grotesk", Arial, sans-serif', textShadow: '0 0 24px rgba(47,107,255,.55)' }}>{title}</h2>
          <div className="mt-6 space-y-5 text-base font-light leading-8 text-[#eaf2ff]/72 md:text-lg" style={{ fontFamily: '"Inter", Arial, sans-serif' }}>
            {paragraphs.map((text, index) => <p key={index} className={index === paragraphs.length - 1 && text.length < 80 ? 'text-sm tracking-[0.2em] text-[#9dc7ff]' : ''}>{text}</p>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.images?.[0] || '/impact/profile.svg'} alt="IMPACT" className="col-span-2 aspect-[16/9] w-full rounded-2xl object-cover object-center shadow-[0_18px_50px_-18px_rgba(47,107,255,.6)] ring-1 ring-[#4cc9ff]/25" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.images?.[1] || '/impact/profile-2.svg'} alt="" className="aspect-square w-full rounded-2xl object-cover shadow-xl ring-1 ring-[#4cc9ff]/25" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.images?.[2] || '/impact/profile-3.svg'} alt="" className="aspect-square w-full rounded-2xl object-cover shadow-xl ring-1 ring-[#4cc9ff]/25" />
        </div>
      </div>
    </section>
  );
}
