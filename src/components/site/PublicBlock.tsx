import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import type { BlockStyle, ButtonConfig, SocialConfig } from '@/lib/blocks';
import { alignClass, justifyClass, blockWrapperStyle, videoEmbed } from '@/lib/render';

export function PublicBlock({ type, content, style }: { type: string; content: any; style: BlockStyle }) {
  const align = style.align;
  return (
    <div style={blockWrapperStyle(style)} className={`mx-auto w-full max-w-3xl px-4 ${alignClass(align)}`}>
      {renderInner(type, content, style)}
    </div>
  );
}

function renderInner(type: string, content: any, style: BlockStyle) {
  switch (type) {
    case 'heading':
      return (
        <h2 style={{ color: style.color, fontSize: style.fontSize ? `${style.fontSize}px` : undefined }} className="font-extrabold leading-tight">
          {content.text}
        </h2>
      );
    case 'text':
      return (
        <p style={{ color: style.color, fontSize: style.fontSize ? `${style.fontSize}px` : undefined }} className="whitespace-pre-wrap leading-relaxed">
          {content.text}
        </p>
      );
    case 'image':
      return content.url ? (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.url} alt={content.alt || ''} className="mx-auto max-h-[520px] w-auto rounded-xl" />
          {content.caption && <figcaption className="mt-2 text-sm text-gray-500">{content.caption}</figcaption>}
        </figure>
      ) : null;
    case 'video': {
      const src = videoEmbed(content.url);
      return src ? (
        <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-xl">
          <iframe src={src} className="absolute inset-0 h-full w-full" allowFullScreen title="video" />
        </div>
      ) : null;
    }
    case 'button': {
      const b: ButtonConfig = content.button;
      if (!b) return null;
      const styleObj = b.variant === 'solid'
        ? { background: b.color, color: '#fff', border: `2px solid ${b.color}` }
        : { background: 'transparent', color: b.color, border: `2px solid ${b.color}` };
      return (
        <div className={`flex ${justifyClass(b.align)}`}>
          <a href={b.href} style={styleObj} className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold transition hover:opacity-90">
            {b.text}
          </a>
        </div>
      );
    }
    case 'social': {
      const s: SocialConfig = content.social || {};
      const items = [
        { k: 'facebook', url: s.facebook, Icon: Facebook },
        { k: 'instagram', url: s.instagram, Icon: Instagram },
        { k: 'twitter', url: s.twitter, Icon: Twitter },
        { k: 'youtube', url: s.youtube, Icon: Youtube },
        { k: 'linkedin', url: s.linkedin, Icon: Linkedin },
      ].filter((i) => i.url);
      return (
        <div className={`flex gap-4 ${justifyClass(s.align)}`}>
          {items.map(({ k, url, Icon }) => (
            <a key={k} href={url!} target="_blank" rel="noreferrer" className="text-gray-600 transition hover:text-brand-600">
              <Icon className="h-6 w-6" />
            </a>
          ))}
        </div>
      );
    }
    case 'columns':
      return (
        <div className={`grid gap-6 ${(content.columns?.length || 2) >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {(content.columns || []).map((c: string, i: number) => (
            <p key={i} className="whitespace-pre-wrap text-left leading-relaxed text-gray-600">{c}</p>
          ))}
        </div>
      );
    case 'spacer':
      return <div style={{ height: content.height || 40 }} />;
    case 'html':
      return <div dangerouslySetInnerHTML={{ __html: content.html || '' }} />;
    default:
      return null;
  }
}
