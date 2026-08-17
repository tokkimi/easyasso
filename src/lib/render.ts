import type { Align, BlockStyle } from './blocks';

export function alignClass(a?: Align): string {
  return a === 'left' ? 'text-left' : a === 'right' ? 'text-right' : 'text-center';
}
export function justifyClass(a?: Align): string {
  return a === 'left' ? 'justify-start' : a === 'right' ? 'justify-end' : 'justify-center';
}

export function blockWrapperStyle(style: BlockStyle): React.CSSProperties {
  return {
    paddingTop: style.paddingY ?? 12,
    paddingBottom: style.paddingY ?? 12,
    background: style.background || undefined,
  };
}

// Extract an embeddable URL for common video providers
export function videoEmbed(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}
