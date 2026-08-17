'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useLanguage } from './language-provider';

const KEY = 'easyasso-cookie-consent';

export function CookieBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem(KEY));
  }, []);

  function choose(value: 'accepted' | 'refused') {
    localStorage.setItem(KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl sm:inset-x-6 sm:bottom-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-gray-900">{t('Cookies et confidentialité')}</p>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {t('EasyAsso utilise des cookies nécessaires au fonctionnement du site et, si vous l’acceptez, des cookies de mesure pour améliorer l’expérience.')}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <button type="button" onClick={() => choose('refused')} className="btn btn-ghost">
            {t('Refuser')}
          </button>
          <button type="button" onClick={() => choose('accepted')} className="btn btn-primary">
            {t('Accepter')}
          </button>
          <button type="button" onClick={() => choose('refused')} className="grid h-11 w-11 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label={t('Fermer')}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
