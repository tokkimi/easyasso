'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Wand2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { ImageInput, Field } from '../editor/controls';

export function GenerateClient({ orgName, categories, welcome }: { orgName: string; categories: { id: string; name: string }[]; welcome: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(orgName || '');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [logo, setLogo] = useState('');
  const [photos, setPhotos] = useState<string[]>(['']);
  const [busy, setBusy] = useState(false);

  function setPhoto(i: number, url: string) { setPhotos((p) => p.map((x, j) => (j === i ? url : x))); }

  async function generate() {
    if (!description.trim()) return;
    setBusy(true);
    await fetch('/api/site/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        category: category || undefined,
        logoUrl: logo || undefined,
        photos: photos.filter(Boolean),
      }),
    });
    router.push('/dashboard/editor');
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={<span className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-brand-600" /> Générateur magique</span>}
        subtitle="Décrivez votre association, ajoutez votre logo et vos photos : votre site se crée tout seul."
      />

      {welcome && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
          <Wand2 className="h-5 w-5 shrink-0" />
          <p>Bienvenue ! Votre essai gratuit de 3 jours a commencé. Laissez la magie opérer : remplissez les champs ci-dessous et obtenez un site complet en un clic.</p>
        </div>
      )}

      <div className="card space-y-5">
        <Field label="Nom de votre association">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Les Amis du Quartier" />
        </Field>

        <Field label="Décrivez votre association (le plus important)">
          <textarea
            className="input min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : Nous aidons les personnes âgées isolées de notre ville grâce à des visites de bénévoles, des sorties et de l'aide au quotidien…"
          />
          <p className="mt-1 text-xs text-gray-400">Plus vous êtes précis, plus le site sera adapté (cause, actions, public aidé…).</p>
        </Field>

        <Field label="Type d’association (optionnel — sinon détecté automatiquement)">
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Détection automatique ✨</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>

        <div>
          <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Logo (optionnel)</p>
          <ImageInput value={logo} onChange={setLogo} />
        </div>

        <div>
          <p className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Vos photos (optionnel)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.map((p, i) => (
              <ImageInput key={i} value={p} onChange={(url) => setPhoto(i, url)} />
            ))}
          </div>
          {photos.length < 8 && (
            <button type="button" onClick={() => setPhotos((p) => [...p, ''])} className="btn btn-ghost mt-3 text-sm"><Plus className="h-4 w-4" /> Ajouter une photo</button>
          )}
        </div>

        <button onClick={generate} disabled={busy || !description.trim()} className="btn btn-primary w-full py-3 text-base">
          {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> Création de votre site…</> : <><Sparkles className="h-5 w-5" /> Générer mon site</>}
        </button>
        <p className="text-center text-xs text-gray-400">Vous pourrez tout modifier ensuite dans l’éditeur. Vos photos remplacent automatiquement les images d’exemple.</p>
      </div>
    </div>
  );
}
