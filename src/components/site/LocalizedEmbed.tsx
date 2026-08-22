'use client';

import { useLanguage } from '@/components/language-provider';

export function LocalizedEmbed({ html, htmlEn, height }: { html?: string; htmlEn?: string; height?: number }) {
  const { locale } = useLanguage();
  const source = locale === 'en' && htmlEn?.trim() ? htmlEn : html;
  const safeHeight = Math.min(1800, Math.max(260, Number(height) || 680));
  return (
    <iframe
      title="Intégration externe"
      srcDoc={source || ''}
      scrolling="no"
      sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
      className="block w-full border-0 bg-transparent"
      style={{ height: safeHeight }}
    />
  );
}
