'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Wand2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { ImageInput, Field } from '../editor/controls';

function compressForGeneration(value: string, maxDimension: number, quality: number): Promise<string> {
  if (!value.startsWith('data:image/')) return Promise.resolve(value);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const context = canvas.getContext('2d');
      if (!context) return resolve(value);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => resolve(value);
    image.src = value;
  });
}

export function GenerateClient({ orgName, profile, categories, welcome }: { orgName: string; profile: any; categories: { id: string; name: string }[]; welcome: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({
    name: orgName || '', year: profile.year || '', mission: profile.mission || '', functioning: profile.functioning || '', actions: profile.actions || '',
    beneficiaries: profile.beneficiaries || '', goodToKnow: profile.goodToKnow || '', news: '', city: profile.city || '', email: profile.email || '', category: profile.category || '',
  });
  const [logo, setLogo] = useState('');
  const [photos, setPhotos] = useState<string[]>(['']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function generate() {
    if (!f.mission.trim()) return;
    setBusy(true); setError('');
    const compressedLogo = logo ? await compressForGeneration(logo, 600, 0.72) : undefined;
    const compressedPhotos = await Promise.all(photos.filter(Boolean).map((photo) => compressForGeneration(photo, 900, 0.68)));
    const basePayload = { ...f, name: f.name.trim(), logoUrl: compressedLogo };
    // Keep the request safely below the hosting limit. URL-based photos do
    // not add meaningful payload weight and are always retained.
    const safePhotos: string[] = [];
    for (const photo of compressedPhotos) {
      const candidate = JSON.stringify({ ...basePayload, photos: [...safePhotos, photo] });
      if (candidate.length < 3_200_000) safePhotos.push(photo);
    }
    const request = (payload: any) => fetch('/api/site/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    let res = await request({ ...basePayload, photos: safePhotos });
    // Absolute safety net for platform request-size limits: the site and its
    // copy must still be generated. Images can then be added in the editor.
    if (res.status === 413) res = await request({ ...f, name: f.name.trim(), photos: [] });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || `La génération a échoué (${res.status}). Votre ancien site a été conservé. Réessayez.`);
      setBusy(false);
      return;
    }
    router.push('/dashboard/editor');
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={<span className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-brand-600" /> Générateur magique</span>}
        subtitle="Répondez au petit questionnaire : votre site complet, avec des textes développés, se crée tout seul."
      />

      {welcome && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
          <Wand2 className="h-5 w-5 shrink-0" />
          <p>Bienvenue ! Votre essai gratuit de 3 jours a commencé. Plus vous remplissez de champs, plus votre site sera riche et personnalisé.</p>
        </div>
      )}

      <div className="card space-y-5">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {Object.values(profile || {}).some(Boolean) && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Les informations enregistrées dans Réglages ont été préremplies. Vous pouvez les adapter pour cette génération.</div>}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Field label="Nom de l’association"><input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Les Amis du Quartier" /></Field>
          </div>
          <Field label="Année de création"><input className="input" value={f.year} onChange={(e) => set('year', e.target.value)} placeholder="2015" /></Field>
        </div>

        <Field label="À propos / votre mission ★">
          <textarea className="input min-h-[110px]" value={f.mission} onChange={(e) => set('mission', e.target.value)}
            placeholder="Qui êtes-vous, quelle est votre cause, vos valeurs ? Ex : Nous aidons les personnes âgées isolées à rompre la solitude…" />
          <p className="mt-1 text-xs text-gray-400">Champ le plus important — sert de base à tous les textes.</p>
        </Field>

        <Field label="Comment fonctionne votre association ?">
          <textarea className="input min-h-[90px]" value={f.functioning} onChange={(e) => set('functioning', e.target.value)}
            placeholder="Bénévoles, adhérents, organisation, fréquence des actions, financement…" />
        </Field>

        <Field label="Actualités à publier (optionnel)">
          <textarea className="input min-h-[90px]" value={f.news} onChange={(e) => set('news', e.target.value)}
            placeholder="Un événement, une collecte, un nouveau projet… Laissez vide si vous ne voulez pas de page Actualités." />
          <p className="mt-1 text-xs text-gray-400">La page Actualités sera créée uniquement si vous ajoutez du contenu ici.</p>
        </Field>

        <Field label="Vos actions / activités concrètes">
          <textarea className="input min-h-[70px]" value={f.actions} onChange={(e) => set('actions', e.target.value)}
            placeholder="Ex : visites à domicile, sorties, ateliers, distributions, événements…" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Public aidé / bénéficiaires"><input className="input" value={f.beneficiaries} onChange={(e) => set('beneficiaries', e.target.value)} placeholder="personnes âgées, enfants, animaux…" /></Field>
          <Field label="Type d’association">
            <select className="input" value={f.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Détection automatique ✨</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Choses à savoir (infos utiles)">
          <textarea className="input min-h-[70px]" value={f.goodToKnow} onChange={(e) => set('goodToKnow', e.target.value)}
            placeholder="Ex : reçus fiscaux, horaires, adhésion, comment devenir bénévole, partenaires…" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ville"><input className="input" value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="Lyon" /></Field>
          <Field label="Email de contact"><input className="input" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="contact@asso.fr" /></Field>
        </div>

        <div>
          <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Logo (optionnel)</p>
          <ImageInput value={logo} onChange={setLogo} />
        </div>

        <div>
          <p className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Vos photos (optionnel)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.map((p, i) => <ImageInput key={i} value={p} onChange={(url) => setPhotos((arr) => arr.map((x, j) => (j === i ? url : x)))} />)}
          </div>
          {photos.length < 8 && (
            <button type="button" onClick={() => setPhotos((p) => [...p, ''])} className="btn btn-ghost mt-3 text-sm"><Plus className="h-4 w-4" /> Ajouter une photo</button>
          )}
        </div>

        <button onClick={generate} disabled={busy || !f.mission.trim()} className="btn btn-primary w-full py-3 text-base">
          {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> Création de votre site…</> : <><Sparkles className="h-5 w-5" /> Générer mon site</>}
        </button>
        <p className="text-center text-xs text-gray-400">★ champ requis. Vous pourrez tout modifier ensuite dans l’éditeur.</p>
      </div>
    </div>
  );
}
