'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/language-provider';
import type { HeaderConfig } from '@/lib/blocks';

const DEFAULT_IMAGES = [
  '/impact/gallery/impact-gallery-01.jpg',
  '/impact/gallery/impact-gallery-02.jpg',
  '/impact/gallery/impact-gallery-03.jpg',
  '/impact/gallery/impact-gallery-04.jpg',
  '/impact/gallery/impact-gallery-05.jpg',
  '/impact/profile.jpg',
  '/impact/profile-2.jpg',
];

const DEFAULT_FR = [
  'IMPACT construit un univers électronique frontal, sombre et physique, porté par une identité visuelle immédiatement reconnaissable : casque noir, lumière bleue électrique, tension permanente. Le projet avance comme une machine de scène, entre précision, violence contrôlée et montée d’adrénaline.',
  'Ses sets et productions mélangent rawstyle, hard dance, bass music et textures techno pour créer un impact direct sur le dancefloor. L’objectif n’est pas seulement de faire écouter un morceau : c’est d’installer une pression, déclencher une réaction, puis garder le public dans l’énergie.',
  'Derrière le masque, IMPACT défend une esthétique nette : son massif, visuels cinématiques, atmosphère futuriste et rapport très physique au live. Chaque sortie, vidéo et apparition prolonge cette même signature : RAW · ELECTRONIC · ENERGY.',
];

const DEFAULT_EN = [
  'IMPACT builds a frontal, dark and physical electronic universe, driven by an instantly recognisable visual identity: black helmet, electric-blue light and permanent tension. The project moves like a stage machine, balancing precision, controlled violence and pure adrenaline.',
  'His sets and productions blend rawstyle, hard dance, bass music and techno textures to create a direct shock on the dancefloor. The goal is not only to play a track: it is to build pressure, trigger a reaction and keep the crowd locked inside the energy.',
  'Behind the mask, IMPACT carries a sharp aesthetic: massive sound, cinematic visuals, futuristic atmosphere and a very physical relationship with live performance. Every release, video and appearance extends the same signature: RAW · ELECTRONIC · ENERGY.',
];

function imageFocus(src: string) {
  if (src.includes('impact-gallery-04')) return '88% 50%';
  if (src.includes('impact-gallery-02')) return '42% 50%';
  if (src.includes('impact-gallery-03')) return '50% 42%';
  if (src.includes('impact-gallery-05')) return '55% 50%';
  return '50% 50%';
}

export function ImpactBio({ blocks = [], config }: { blocks?: any[]; config?: HeaderConfig['vielusosBio'] }) {
  const { locale } = useLanguage();
  const configuredImages = (config?.images || []).filter(Boolean);
  const images = configuredImages.length ? configuredImages : DEFAULT_IMAGES;
  const [activeImage, setActiveImage] = useState(0);
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<number | null>(null);
  const triggerFlash = useCallback(() => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    setFlash(true);
    flashTimer.current = window.setTimeout(() => setFlash(false), 140);
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const interval = window.setInterval(() => {
      triggerFlash();
      setActiveImage((index) => (index + 1) % images.length);
    }, 3400);
    return () => window.clearInterval(interval);
  }, [images.length, triggerFlash]);

  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
  }, []);

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
    <section data-no-translate className="relative overflow-hidden border-y border-[#4cc9ff]/18 bg-[#070b1a]/45 px-5 py-10 backdrop-blur-xl md:px-12 md:py-16">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(50%_60%_at_15%_0%,rgba(47,107,255,.2),transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.05fr_.95fr] md:items-center">
        <div>
          <p className="text-xs font-medium uppercase text-[#9dc7ff]">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-semibold uppercase text-white md:text-3xl" style={{ fontFamily: '"Space Grotesk", Arial, sans-serif', textShadow: '0 0 18px rgba(47,107,255,.38)' }}>{title}</h2>
          <div className="mt-5 space-y-4 text-sm font-light leading-7 text-[#eaf2ff]/72 md:text-base" style={{ fontFamily: '"Inter", Arial, sans-serif' }}>
            {paragraphs.map((text, index) => <p key={index} className={index === paragraphs.length - 1 && text.length < 80 ? 'text-sm text-[#9dc7ff]' : ''}>{text}</p>)}
          </div>
        </div>
        <div className="impact-bio-carousel">
          <div className="impact-bio-carousel-window">
            {images.map((src, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${index}`}
                src={src}
                alt={index === activeImage ? 'IMPACT' : ''}
                className={`impact-bio-carousel-image ${index === activeImage ? 'is-active' : ''}`}
                style={{ objectPosition: imageFocus(src) }}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ))}
            <span className={`impact-bio-flash ${flash ? 'is-visible' : ''}`} aria-hidden="true" />
          </div>
          <div className="impact-bio-strip" aria-label="Photos IMPACT">
            {images.map((src, index) => (
              <button key={`${src}-dot-${index}`} type="button" onClick={() => {
                triggerFlash();
                setActiveImage(index);
              }} className={`impact-bio-thumb ${index === activeImage ? 'is-active' : ''}`} aria-label={`Afficher la photo ${index + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" style={{ objectPosition: imageFocus(src) }} loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
