'use client';
import { useState } from 'react';
import { Plus, Save, Trash2, Truck, Check } from 'lucide-react';

type Rate = { id: string; name: string; countryCodes: string[]; priceCents: number; freeAboveCents: number | null; minDeliveryDays: number | null; maxDeliveryDays: number | null; active: boolean };
type Draft = { name: string; countries: string[]; priceEuros: string; freeAboveEuros: string; minDeliveryDays: string; maxDeliveryDays: string; active: boolean };

// Countries the card payment page accepts for delivery.
const COUNTRIES: [string, string][] = [['FR', 'France'], ['BE', 'Belgique'], ['CH', 'Suisse'], ['LU', 'Luxembourg'], ['MC', 'Monaco']];

const toDraft = (r: Rate): Draft => ({
  name: r.name, countries: r.countryCodes, priceEuros: String((r.priceCents || 0) / 100),
  freeAboveEuros: r.freeAboveCents == null ? '' : String(r.freeAboveCents / 100),
  minDeliveryDays: r.minDeliveryDays == null ? '' : String(r.minDeliveryDays),
  maxDeliveryDays: r.maxDeliveryDays == null ? '' : String(r.maxDeliveryDays), active: r.active,
});
const EMPTY: Draft = { name: 'Livraison standard', countries: ['FR'], priceEuros: '6.90', freeAboveEuros: '', minDeliveryDays: '2', maxDeliveryDays: '5', active: true };
const payload = (d: Draft) => ({ name: d.name, countryCodes: d.countries.join(','), priceEuros: d.priceEuros, freeAboveEuros: d.freeAboveEuros, minDeliveryDays: d.minDeliveryDays, maxDeliveryDays: d.maxDeliveryDays, active: d.active });
const money = (cents: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);

function RateForm({ draft, onChange, disabled }: { draft: Draft; onChange: (d: Draft) => void; disabled?: boolean }) {
  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  return (
    <div className="grid gap-3 md:grid-cols-6">
      <label className="md:col-span-2"><span className="label">Nom affiché au client</span><input className="input" disabled={disabled} value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Colissimo suivi" /></label>
      <label><span className="label">Prix (€)</span><input className="input" disabled={disabled} type="number" min="0" step="0.01" value={draft.priceEuros} onChange={(e) => set({ priceEuros: e.target.value })} /></label>
      <label><span className="label">Offerte dès (€)</span><input className="input" disabled={disabled} type="number" min="0" step="0.01" value={draft.freeAboveEuros} onChange={(e) => set({ freeAboveEuros: e.target.value })} placeholder="Jamais" /></label>
      <label><span className="label">Délai min (jours)</span><input className="input" disabled={disabled} type="number" min="0" value={draft.minDeliveryDays} onChange={(e) => set({ minDeliveryDays: e.target.value })} /></label>
      <label><span className="label">Délai max (jours)</span><input className="input" disabled={disabled} type="number" min="0" value={draft.maxDeliveryDays} onChange={(e) => set({ maxDeliveryDays: e.target.value })} /></label>
      <div className="md:col-span-6">
        <span className="label">Pays livrés avec ce tarif</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {COUNTRIES.map(([code, label]) => {
            const on = draft.countries.includes(code);
            return (
              <button key={code} type="button" disabled={disabled} onClick={() => set({ countries: on ? draft.countries.filter((c) => c !== code) : [...draft.countries, code] })}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                {on && <Check className="h-3.5 w-3.5" />}{label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ShippingClient({ initial, canEdit }: { initial: Rate[]; canEdit: boolean }) {
  const [rates, setRates] = useState<Rate[]>(initial);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => Object.fromEntries(initial.map((r) => [r.id, toDraft(r)])));
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');

  const flash = (text: string) => { setNotice(text); setTimeout(() => setNotice(''), 3000); };
  const check = (d: Draft) => (!d.name.trim() ? 'Donnez un nom au tarif.' : d.countries.length === 0 ? 'Choisissez au moins un pays.' : '');

  async function add() {
    const err = check(newDraft); if (err) { alert(err); return; }
    setBusy('new');
    const res = await fetch('/api/shop/shipping-rates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(newDraft)) });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok || !data.rate) { alert(data.error || 'Enregistrement impossible. Réessayez.'); return; }
    setRates((all) => [...all, data.rate]);
    setDrafts((all) => ({ ...all, [data.rate.id]: toDraft(data.rate) }));
    setNewDraft(EMPTY);
    flash('Tarif ajouté : il s’applique maintenant au panier.');
  }
  async function save(id: string) {
    const d = drafts[id]; const err = check(d); if (err) { alert(err); return; }
    setBusy(id);
    const res = await fetch(`/api/shop/shipping-rates/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(d)) });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok || !data.rate) { alert(data.error || 'Enregistrement impossible. Réessayez.'); return; }
    setRates((all) => all.map((r) => (r.id === id ? data.rate : r)));
    setDrafts((all) => ({ ...all, [id]: toDraft(data.rate) }));
    flash('Tarif enregistré.');
  }
  async function remove(id: string) {
    if (!confirm('Supprimer ce tarif de livraison ?')) return;
    setBusy(id);
    const res = await fetch(`/api/shop/shipping-rates/${id}`, { method: 'DELETE' });
    setBusy('');
    if (!res.ok) { alert('Suppression impossible. Réessayez.'); return; }
    setRates((all) => all.filter((r) => r.id !== id));
  }

  const covered = new Set(rates.filter((r) => r.active).flatMap((r) => r.countryCodes));
  const missing = COUNTRIES.filter(([c]) => !covered.has(c)).map(([, l]) => l);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900"><Truck className="h-6 w-6" /> Livraison & frais de port</h1>
        <p className="mt-1 text-gray-500">Les frais sont ajoutés automatiquement au panier selon le pays du client, puis au paiement par carte.</p>
      </div>
      {notice && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{notice}</p>}
      {missing.length > 0 && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Livraison gratuite par défaut pour : {missing.join(', ')}. Ajoutez un tarif si vous voulez faire payer le port.</p>}

      {rates.map((rate) => (
        <div key={rate.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold text-gray-900">{rate.name} · {money(rate.priceCents)}{rate.freeAboveCents != null ? ` · offerte dès ${money(rate.freeAboveCents)}` : ''}</p>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" disabled={!canEdit} checked={drafts[rate.id]?.active ?? rate.active} onChange={(e) => setDrafts((all) => ({ ...all, [rate.id]: { ...all[rate.id], active: e.target.checked } }))} /> Actif
            </label>
          </div>
          <RateForm draft={drafts[rate.id]} disabled={!canEdit} onChange={(d) => setDrafts((all) => ({ ...all, [rate.id]: d }))} />
          {canEdit && (
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => remove(rate.id)} disabled={busy === rate.id} className="btn btn-ghost text-red-600"><Trash2 className="h-4 w-4" /> Supprimer</button>
              <button type="button" onClick={() => save(rate.id)} disabled={busy === rate.id} className="btn btn-primary"><Save className="h-4 w-4" /> {busy === rate.id ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          )}
        </div>
      ))}

      {canEdit && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-5">
          <p className="mb-4 font-bold text-gray-900">Nouveau tarif</p>
          <RateForm draft={newDraft} onChange={setNewDraft} />
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={add} disabled={busy === 'new'} className="btn btn-primary"><Plus className="h-4 w-4" /> {busy === 'new' ? 'Ajout…' : 'Ajouter le tarif'}</button>
          </div>
        </div>
      )}
      {!canEdit && <p className="text-sm text-gray-500">Vous pouvez consulter les tarifs ; seul un gestionnaire de la boutique peut les modifier.</p>}
    </div>
  );
}
