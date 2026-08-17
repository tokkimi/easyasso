'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/ui';

type T = { id: string; name: string; category: string; tagline: string; preview: string; primary: string };

export function ThemesClient({ templates, welcome }: { templates: T[]; welcome: boolean }) {
  const router = useRouter();
  const [applying, setApplying] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function apply(id: string) {
    setApplying(id);
    setConfirmId(null);
    await fetch('/api/site/apply-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: id }),
    });
    setApplying(null);
    router.push('/dashboard/editor');
  }

  return (
    <div>
      <PageHeader
        title={welcome ? 'Choisissez le style de votre site' : 'Modèles de site'}
        subtitle="Sélectionnez une structure prête à l’emploi. Vous n’aurez plus qu’à remplacer les textes et les photos."
      />

      {welcome && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
          <Wand2 className="h-5 w-5 shrink-0" />
          <p>Bienvenue ! Choisissez un modèle ci-dessous pour démarrer. Vous pourrez tout personnaliser ensuite, et changer de modèle à tout moment.</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
            <div className="relative aspect-[16/10] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.preview} alt={t.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: t.primary }}>{t.category}</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900">{t.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{t.tagline}</p>
              <button
                onClick={() => setConfirmId(t.id)}
                disabled={applying !== null}
                className="btn btn-primary mt-4 w-full text-sm"
                style={{ background: t.primary }}
              >
                {applying === t.id ? <><Loader2 className="h-4 w-4 animate-spin" /> Application…</> : <><Check className="h-4 w-4" /> Choisir ce modèle</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setConfirmId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900">Appliquer ce modèle ?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Le contenu actuel de vos pages sera remplacé par ce modèle (votre logo est conservé). Vous pourrez ensuite tout modifier.
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setConfirmId(null)} className="btn btn-ghost flex-1">Annuler</button>
              <button onClick={() => apply(confirmId)} className="btn btn-primary flex-1">Appliquer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
