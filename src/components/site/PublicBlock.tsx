import {
  Facebook, Instagram, Twitter, Youtube, Linkedin, Music2,
  Heart, Users, HandHeart, HandCoins, Star, Gift, Leaf, Home, BookOpen, Shield, Sparkles, Handshake,
} from 'lucide-react';
import type { BlockStyle, ButtonConfig, SocialConfig } from '@/lib/blocks';
import { alignClass, justifyClass, blockWrapperStyle, safePublicUrl, videoEmbed } from '@/lib/render';
import { Slideshow } from './Slideshow';
import { ContactForm } from './ContactForm';
import { DonationBlock } from './DonationBlock';

const CARD_ICONS: Record<string, any> = {
  Heart, Users, HandHeart, HandCoins, Star, Gift, Leaf, Home, BookOpen, Shield, Sparkles, Handshake,
};

// Blocks that break out of the narrow text column
const WIDE = new Set(['textimage', 'gallery', 'cards', 'contact', 'donation']);
const FULL = new Set(['banner', 'slideshow', 'cta']);

function Btn({ b, basePath = '' }: { b: ButtonConfig; basePath?: string }) {
  if (!b?.text) return null;
  const href = b.href?.startsWith('/') ? `${basePath}${b.href}` : safePublicUrl(b.href) || '#';
  const style = b.variant === 'solid'
    ? { background: b.color, color: b.color.toLowerCase() === '#ffffff' ? '#111827' : '#fff', border: `2px solid ${b.color}` }
    : { background: 'transparent', color: b.color, border: `2px solid ${b.color}` };
  return (
    <div className={`flex ${justifyClass(b.align)}`}>
      <a href={href} style={style} className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold transition hover:opacity-90">{b.text}</a>
    </div>
  );
}

export function PublicBlock({ type, content, style, basePath = '', organizationId }: { type: string; content: any; style: BlockStyle; basePath?: string; organizationId?: string }) {
  const inner = renderInner(type, content, style, basePath, organizationId);
  if (FULL.has(type)) {
    return <div style={blockWrapperStyle({ ...style, background: type === 'cta' ? style.background : undefined })} className="w-full">{inner}</div>;
  }
  const maxW = WIDE.has(type) ? 'max-w-5xl' : 'max-w-3xl';
  return (
    <div style={blockWrapperStyle(style)} className={`public-block-shell mx-auto w-full ${maxW} px-4 ${alignClass(style.align)}`}>
      {inner}
    </div>
  );
}

function renderInner(type: string, content: any, style: BlockStyle, basePath: string, organizationId?: string) {
  switch (type) {
    case 'heading':
      return <h2 style={{ color: style.color, fontSize: style.fontSize ? `${style.fontSize}px` : undefined }} className="font-extrabold leading-tight">{content.text}</h2>;
    case 'text':
      return <p style={{ color: style.color, fontSize: style.fontSize ? `${style.fontSize}px` : undefined }} className="whitespace-pre-wrap leading-relaxed">{content.text}</p>;
    case 'image':
      return content.url ? (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={safePublicUrl(content.url, { allowDataImage: true })} alt={content.alt || ''} className="mx-auto max-h-[520px] w-auto rounded-xl" />
          {content.caption && <figcaption className="mt-2 text-sm text-gray-500">{content.caption}</figcaption>}
        </figure>
      ) : null;
    case 'video': {
      const src = safePublicUrl(videoEmbed(content.url));
      return src ? (
        <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-xl">
          <iframe src={src} className="absolute inset-0 h-full w-full" allowFullScreen title="video" />
        </div>
      ) : null;
    }
    case 'button':
      return content.button ? <Btn b={content.button} basePath={basePath} /> : null;
    case 'social': {
      const s: SocialConfig = content.social || {};
      const items = [
        { k: 'facebook', url: s.facebook, Icon: Facebook },
        { k: 'instagram', url: s.instagram, Icon: Instagram },
        { k: 'twitter', url: s.twitter, Icon: Twitter },
        { k: 'youtube', url: s.youtube, Icon: Youtube },
        { k: 'linkedin', url: s.linkedin, Icon: Linkedin },
        { k: 'tiktok', url: s.tiktok, Icon: Music2 },
      ].filter((i) => i.url);
      return (
        <div className={`flex gap-4 ${justifyClass(s.align)}`}>
          {items.map(({ k, url, Icon }) => (
            <a key={k} href={safePublicUrl(url) || '#'} target="_blank" rel="noreferrer" className="text-gray-600 transition hover:text-brand-600"><Icon className="h-6 w-6" /></a>
          ))}
        </div>
      );
    }
    case 'columns':
      return (
        <div className={`public-responsive-columns ${(content.columns?.length || 2) >= 3 ? 'public-grid-3' : 'public-grid-2'}`}>
          {(content.columns || []).map((c: string, i: number) => (
            <p key={i} className="public-scroll-item whitespace-pre-wrap text-left leading-relaxed text-gray-600">{c}</p>
          ))}
        </div>
      );
    case 'spacer':
      return <div style={{ height: content.height || 40 }} />;
    case 'html':
      return (
        <iframe
          title="Intégration externe"
          srcDoc={content.html || ''}
          sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts"
          className="min-h-[420px] w-full rounded-xl border-0 bg-transparent"
        />
      );

    // ---- Rich layouts ----
    case 'banner': {
      const h = content.height || 460;
      const overlay = (content.overlay ?? 45) / 100;
      return (
        <div className="relative flex w-full items-center justify-center overflow-hidden" style={{ height: h }}>
          {content.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={safePublicUrl(content.image, { allowDataImage: true })} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlay})` }} />
          <div className="relative mx-auto max-w-3xl px-6 text-center text-white">
            {content.title && <h2 className="text-3xl font-extrabold drop-shadow md:text-5xl">{content.title}</h2>}
            {content.subtitle && <p className="mx-auto mt-3 max-w-xl text-lg drop-shadow">{content.subtitle}</p>}
            {content.button?.text && <div className="mt-6"><Btn b={content.button} basePath={basePath} /></div>}
          </div>
        </div>
      );
    }
    case 'textimage': {
      const right = (content.imageSide || 'right') === 'right';
      const img = content.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={safePublicUrl(content.image, { allowDataImage: true })} alt="" className="h-full max-h-[420px] w-full rounded-2xl object-cover" />
      ) : null;
      const txt = (
        <div className="flex flex-col justify-center text-left">
          {content.title && <h3 className="text-2xl font-extrabold text-gray-900 md:text-3xl" style={{ color: style.color }}>{content.title}</h3>}
          {content.text && <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-600">{content.text}</p>}
          {content.button?.text && <div className="mt-5"><Btn b={content.button} basePath={basePath} /></div>}
        </div>
      );
      return (
        <div className="public-textimage">
          {right ? <>{txt}{img}</> : <>{img}{txt}</>}
        </div>
      );
    }
    case 'gallery': {
      const cols = content.columns || 3;
      const gridCls = cols === 4 ? 'public-grid-4' : cols === 2 ? 'public-grid-2' : 'public-grid-3';
      return (
        <div className={`public-responsive-gallery ${gridCls}`}>
          {(content.images || []).map((src: string, i: number) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={safePublicUrl(src, { allowDataImage: true })} alt="" className="public-scroll-item aspect-square rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    case 'slideshow':
      return <Slideshow slides={content.slides || []} interval={content.interval || 4} />;
    case 'cards': {
      const cols = content.columns || 3;
      const gridCls = cols === 4 ? 'public-grid-4' : cols === 2 ? 'public-grid-2' : 'public-grid-3';
      return (
        <div className={`public-responsive-cards ${gridCls}`}>
          {(content.items || []).map((it: any, i: number) => {
            const Icon = CARD_ICONS[it.icon] || Heart;
            return (
              <div key={i} className="public-scroll-item rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-gray-100">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-6 w-6" /></div>
                {it.title && <h4 className="mt-4 font-bold text-gray-900">{it.title}</h4>}
                {it.text && <p className="mt-1 text-sm leading-relaxed text-gray-600">{it.text}</p>}
              </div>
            );
          })}
        </div>
      );
    }
    case 'cta':
      return (
        <div className="mx-auto max-w-3xl px-6 text-center">
          {content.title && <h3 className="text-2xl font-extrabold text-gray-900 md:text-3xl">{content.title}</h3>}
          {content.text && <p className="mx-auto mt-2 max-w-xl text-gray-600">{content.text}</p>}
          {content.button?.text && <div className="mt-5"><Btn b={content.button} basePath={basePath} /></div>}
        </div>
      );
    case 'contact':
      return <ContactForm organizationId={organizationId} content={content} />;
    case 'donation':
      return <DonationBlock content={content} organizationId={organizationId} />;
    default:
      return null;
  }
}
