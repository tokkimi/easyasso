'use client';
import { useState } from 'react';
import { Plus, Trash2, Pencil, Save, X, Package, Eye, EyeOff } from 'lucide-react';
import { PageHeader } from '@/components/ui';

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl?: string | null;
  stock?: number | null;
  active: boolean;
};

type Draft = { name: string; description: string; priceEuros: string; imageUrl: string; stock: string };

const EMPTY: Draft = { name: '', description: '', priceEuros: '', imageUrl: '', stock: '' };

function euros(cents: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format((cents || 0) / 100);
}

export function ShopClient({ enabled: initialEnabled, initial }: { enabled: boolean; initial: Product[] }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [products, setProducts] = useState<Product[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggleShop() {
    const next = !enabled;
    setEnabled(next);
    await fetch('/api/shop', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: next }) }).catch(() => setEnabled(!next));
  }

  function startAdd() { setEditingId(null); setDraft({ ...EMPTY }); }
  function startEdit(p: Product) {
    setEditingId(p.id);
    setDraft({ name: p.name, description: p.description || '', priceEuros: String((p.priceCents || 0) / 100), imageUrl: p.imageUrl || '', stock: p.stock == null ? '' : String(p.stock) });
  }
  function cancel() { setDraft(null); setEditingId(null); }

  async function readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function save() {
    if (!draft || !draft.name.trim()) { alert('Le nom du produit est requis.'); return; }
    setBusy(true);
    const payload = { name: draft.name.trim(), description: draft.description, priceEuros: draft.priceEuros, imageUrl: draft.imageUrl, stock: draft.stock };
    const url = editingId ? `/api/shop/products/${editingId}` : '/api/shop/products';
    const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { alert(data.error || 'Enregistrement impossible.'); return; }
    if (editingId) setProducts((all) => all.map((p) => (p.id === editingId ? data.product : p)));
    else setProducts((all) => [...all, data.product]);
    cancel();
  }

  async function toggleActive(p: Product) {
    setProducts((all) => all.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
    await fetch(`/api/shop/products/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !p.active }) }).catch(() => {});
  }

  async function remove(p: Product) {
    if (!confirm(`Supprimer « ${p.name} » ?`)) return;
    setProducts((all) => all.filter((x) => x.id !== p.id));
    await fetch(`/api/shop/products/${p.id}`, { method: 'DELETE' }).catch(() => {});
  }

  return (
    <div>
      <PageHeader title="Boutique" subtitle="Activez votre boutique en ligne et gérez vos produits. Les commandes apparaîtront dans votre comptabilité." />

      {/* Activation toggle */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center gap-3">
          <div className={`grid h-11 w-11 place-items-center rounded-xl ${enabled ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-400'}`}><Package className="h-6 w-6" /></div>
          <div>
            <p className="font-bold text-gray-900">Boutique en ligne</p>
            <p className="text-sm text-gray-500">{enabled ? 'Activée — vos produits peuvent être affichés sur votre site.' : 'Désactivée — activez-la pour vendre en ligne.'}</p>
          </div>
        </div>
        <button onClick={toggleShop} role="switch" aria-checked={enabled} className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? 'bg-brand-600' : 'bg-gray-300'}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {!enabled && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-500">
          Activez la boutique ci-dessus pour commencer à ajouter des produits.
        </div>
      )}

      {enabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-gray-900">Vos produits {products.length > 0 && <span className="text-gray-400">({products.length})</span>}</h2>
            {!draft && <button onClick={startAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Ajouter un produit</button>}
          </div>

          {/* Add / edit form */}
          {draft && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="grid gap-4 md:grid-cols-2">
                <div><label className="label">Nom du produit</label><input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex : T-shirt logo" /></div>
                <div><label className="label">Prix (€)</label><input className="input" type="number" min="0" step="0.01" value={draft.priceEuros} onChange={(e) => setDraft({ ...draft, priceEuros: e.target.value })} placeholder="19.90" /></div>
                <div className="md:col-span-2"><label className="label">Description</label><textarea className="input min-h-[80px]" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Décrivez le produit…" /></div>
                <div>
                  <label className="label">Stock (laisser vide = illimité)</label>
                  <input className="input" type="number" min="0" step="1" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} placeholder="illimité" />
                </div>
                <div>
                  <label className="label">Photo</label>
                  <input type="file" accept="image/*" className="input" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setDraft({ ...draft, imageUrl: await readImage(f) }); }} />
                  {draft.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.imageUrl} alt="" className="mt-2 h-20 w-20 rounded-lg object-cover" />
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={save} disabled={busy} className="btn btn-primary"><Save className="h-4 w-4" /> {busy ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Ajouter'}</button>
                <button onClick={cancel} className="btn btn-ghost"><X className="h-4 w-4" /> Annuler</button>
              </div>
            </div>
          )}

          {/* Product list */}
          {products.length === 0 && !draft && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-500">Aucun produit pour l’instant. Cliquez « Ajouter un produit ».</div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 ${!p.active ? 'opacity-60' : ''}`}>
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="grid h-40 w-full place-items-center bg-gray-100 text-gray-300"><Package className="h-10 w-10" /></div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <p className="shrink-0 font-extrabold text-brand-700">{euros(p.priceCents)}</p>
                  </div>
                  {p.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{p.description}</p>}
                  <p className="mt-1 text-xs text-gray-400">{p.stock == null ? 'Stock illimité' : `${p.stock} en stock`}</p>
                  <div className="mt-3 flex gap-1">
                    <button onClick={() => startEdit(p)} className="btn btn-ghost flex-1 text-sm"><Pencil className="h-4 w-4" /> Modifier</button>
                    <button onClick={() => toggleActive(p)} title={p.active ? 'Masquer' : 'Afficher'} className="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100">{p.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button onClick={() => remove(p)} title="Supprimer" className="grid h-9 w-9 place-items-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
