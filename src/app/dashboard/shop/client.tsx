'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Pencil, Save, X, Package, Eye, EyeOff, Star, ArrowLeft, ArrowRight, ImagePlus, ExternalLink, LayoutTemplate, CreditCard, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui';

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl?: string | null;
  images?: string[];
  category?: string;
  brand?: string;
  stock?: number | null;
  active: boolean;
  provider?: string | null;
};

type OrderItem = { id: string; name: string; priceCents: number; quantity: number };
type Order = { id: string; status: string; customerName: string; customerEmail: string; customerPhone: string; shippingAddress: string; totalCents: number; createdAt: string; items: OrderItem[] };

type Draft = { name: string; description: string; priceEuros: string; images: string[]; category: string; brand: string; stock: string };

const EMPTY: Draft = { name: '', description: '', priceEuros: '', images: [], category: '', brand: '', stock: '' };

function euros(cents: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format((cents || 0) / 100);
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function mainImage(p: Product) {
  return (p.images && p.images[0]) || p.imageUrl || '';
}

type ContradoStatus = { connected: boolean; storeName?: string | null; syncedAt?: string | null; error?: string | null };

export function ShopClient({ enabled: initialEnabled, initial, boutiqueUrl = '', hasBoutiquePage: initialHasPage = false, connectStarted = false, connectReady: initialReady = false, orders = [], branded = false, contrado: initialContrado = { connected: false } }: { enabled: boolean; initial: Product[]; boutiqueUrl?: string; hasBoutiquePage?: boolean; connectStarted?: boolean; connectReady?: boolean; orders?: Order[]; branded?: boolean; contrado?: ContradoStatus }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [products, setProducts] = useState<Product[]>(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasPage, setHasPage] = useState(initialHasPage);
  const [creatingPage, setCreatingPage] = useState(false);
  const [connect, setConnect] = useState({ started: connectStarted, ready: initialReady });
  const [connecting, setConnecting] = useState(false);
  const [contrado, setContrado] = useState<ContradoStatus>(initialContrado);
  const [contradoKey, setContradoKey] = useState('');
  const [syncingContrado, setSyncingContrado] = useState(false);
  const [contradoMessage, setContradoMessage] = useState('');
  const dragIndex = useRef<number | null>(null);

  // Coming back from Stripe onboarding: refresh the account status.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('connect')) {
      fetch('/api/shop/connect').then((r) => r.json()).then((d) => setConnect({ started: !!d.started, ready: !!d.ready })).catch(() => {});
    }
  }, []);

  async function connectStripe() {
    setConnecting(true);
    const res = await fetch('/api/shop/connect', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    setConnecting(false);
    if (!res.ok || !data.url) { alert(data.error || 'Connexion Stripe impossible.'); return; }
    window.location.href = data.url;
  }

  async function syncContrado() {
    if (!contrado.connected && !contradoKey.trim()) {
      setContradoMessage('Collez la nouvelle clé API Contrado avant de connecter la boutique.');
      return;
    }
    setSyncingContrado(true);
    setContradoMessage('');
    const res = await fetch('/api/vielusos/contrado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contradoKey.trim() ? { apiKey: contradoKey.trim() } : {}),
    });
    const data = await res.json().catch(() => ({}));
    setSyncingContrado(false);
    if (!res.ok) {
      setContradoMessage(data.error || 'Connexion Contrado impossible.');
      return;
    }
    setContradoKey('');
    setContrado({ connected: true, storeName: data.storeName, syncedAt: data.syncedAt, error: null });
    if (Array.isArray(data.products)) setProducts(data.products);
    setEnabled(true);
    setHasPage(true);
    setContradoMessage(`${data.imported || 0} article${data.imported > 1 ? 's' : ''} synchronisé${data.imported > 1 ? 's' : ''}.`);
  }

  async function addBoutiquePage() {
    setCreatingPage(true);
    const res = await fetch('/api/shop/page', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    setCreatingPage(false);
    if (!res.ok) { alert(data.error || 'Création impossible.'); return; }
    setEnabled(true);
    setHasPage(true);
    alert('La page Boutique a été ajoutée à votre site 🎉');
  }

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[], [products]);

  async function toggleShop() {
    const next = !enabled;
    const previousEnabled = enabled;
    const previousHasPage = hasPage;
    setEnabled(next);
    setHasPage(next ? true : false);
    const res = await fetch('/api/shop', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: next }) }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res || !res.ok) {
      setEnabled(previousEnabled);
      setHasPage(previousHasPage);
      alert(data?.error || 'Impossible de modifier la boutique. Réessayez.');
      return;
    }
    setHasPage(!!data.hasBoutiquePage);
  }

  function startAdd() { setEditingId(null); setDraft({ ...EMPTY }); }
  function startEdit(p: Product) {
    setEditingId(p.id);
    setDraft({
      name: p.name, description: p.description || '', priceEuros: String((p.priceCents || 0) / 100),
      images: (p.images && p.images.length ? p.images : p.imageUrl ? [p.imageUrl] : []),
      category: p.category || '', brand: p.brand || '', stock: p.stock == null ? '' : String(p.stock),
    });
  }
  function cancel() { setDraft(null); setEditingId(null); }

  function readImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1400;
          const ratio = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * ratio));
          canvas.height = Math.max(1, Math.round(img.height * ratio));
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(String(r.result)); return; }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          let out = canvas.toDataURL('image/webp', 0.82);
          if (out.length > 700_000) out = canvas.toDataURL('image/webp', 0.68);
          resolve(out.length < String(r.result).length ? out : String(r.result));
        };
        img.onerror = () => resolve(String(r.result));
        img.src = String(r.result);
      };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  async function addFiles(files: FileList | null) {
    if (!draft || !files) return;
    const list = Array.from(files).slice(0, 8);
    const urls = await Promise.all(list.map(readImage));
    setDraft((d) => (d ? { ...d, images: [...d.images, ...urls].slice(0, 8) } : d));
  }
  function moveImage(from: number, to: number) {
    setDraft((d) => {
      if (!d || to < 0 || to >= d.images.length) return d;
      const imgs = [...d.images];
      const [m] = imgs.splice(from, 1);
      imgs.splice(to, 0, m);
      return { ...d, images: imgs };
    });
  }
  function removeImage(i: number) {
    setDraft((d) => (d ? { ...d, images: d.images.filter((_, idx) => idx !== i) } : d));
  }
  function makeMain(i: number) { moveImage(i, 0); }

  async function save() {
    if (!draft || !draft.name.trim()) { alert('Le nom du produit est requis.'); return; }
    setBusy(true);
    const payload = { name: draft.name.trim(), description: draft.description, priceEuros: draft.priceEuros, images: draft.images, category: draft.category.trim(), brand: draft.brand.trim(), stock: draft.stock };
    if (JSON.stringify(payload).length > 4_000_000) {
      setBusy(false);
      alert('Les photos sont trop lourdes. Ajoutez moins d’images ou utilisez des photos plus légères.');
      return;
    }
    const url = editingId ? `/api/shop/products/${editingId}` : '/api/shop/products';
    const res = await fetch(url, { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const text = await res.text().catch(() => '');
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch {}
    setBusy(false);
    if (!res.ok) {
      alert(data.error || (res.status === 413 ? 'Les photos sont trop lourdes. Essayez avec une image plus légère.' : 'Enregistrement impossible. Réessayez dans quelques secondes.'));
      return;
    }
    if (editingId) setProducts((all) => all.map((p) => (p.id === editingId ? data.product : p)));
    else setProducts((all) => [...all, data.product]);
    cancel();
  }
  async function toggleActive(p: Product) {
    const next = !p.active;
    setProducts((all) => all.map((x) => (x.id === p.id ? { ...x, active: next } : x)));
    const response = await fetch(`/api/shop/products/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: next }) }).catch(() => null);
    if (!response?.ok) {
      setProducts((all) => all.map((x) => (x.id === p.id ? { ...x, active: p.active } : x)));
      alert('Impossible de modifier la visibilité de ce produit. Réessayez.');
    }
  }
  async function remove(p: Product) {
    if (!confirm(`Supprimer « ${p.name} » ?`)) return;
    setProducts((all) => all.filter((x) => x.id !== p.id));
    await fetch(`/api/shop/products/${p.id}`, { method: 'DELETE' }).catch(() => {});
  }

  return (
    <div>
      <PageHeader title="Boutique" subtitle="Activez votre boutique et gérez vos produits. Les commandes apparaîtront dans votre comptabilité." />

      {branded && (
        <section className="card mb-6 border border-[#d33f5c]/25" aria-labelledby="contrado-title">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d33f5c]/10 text-[#d33f5c]"><KeyRound className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 id="contrado-title" className="font-bold text-gray-900">Catalogue Contrado</h2>
                  <p className="text-sm text-gray-500">Connexion privée réservée à VIELUSOS. Les visiteurs restent sur votre site.</p>
                </div>
                {contrado.connected && <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700"><CheckCircle2 className="h-3.5 w-3.5" /> Connecté</span>}
              </div>

              {contrado.connected ? (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">{contrado.storeName || 'Boutique VIELUSOS'}</p>
                    <p className="text-xs text-gray-500">{contrado.syncedAt ? `Dernière synchronisation : ${formatDate(contrado.syncedAt)}` : 'Connexion enregistrée.'}</p>
                  </div>
                  <button type="button" onClick={syncContrado} disabled={syncingContrado} className="btn btn-primary"><RefreshCw className={`h-4 w-4 ${syncingContrado ? 'animate-spin' : ''}`} /> {syncingContrado ? 'Synchronisation…' : 'Synchroniser les articles'}</button>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="label" htmlFor="contrado-key">Nouvelle clé API Contrado</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input id="contrado-key" type="password" autoComplete="new-password" className="input flex-1 font-mono" value={contradoKey} onChange={(event) => setContradoKey(event.target.value)} placeholder="Collez la clé privée générée dans Contrado" />
                    <button type="button" onClick={syncContrado} disabled={syncingContrado} className="btn btn-primary shrink-0"><ShieldCheck className="h-4 w-4" /> {syncingContrado ? 'Connexion…' : 'Connecter et importer'}</button>
                  </div>
                  <p className="mt-2 text-xs text-amber-700">N’utilisez pas la clé visible sur une capture d’écran : révoquez-la dans Contrado et créez-en une nouvelle avec les droits de lecture des produits.</p>
                </div>
              )}
              {(contradoMessage || contrado.error) && <p className={`mt-3 rounded-xl px-3 py-2 text-sm ${(contradoMessage || '').includes('synchronisé') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>{contradoMessage || contrado.error}</p>}
            </div>
          </div>
        </section>
      )}

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
          {/* Ready-made shop page */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-brand-100"><LayoutTemplate className="h-5 w-5" /></div>
              <div>
                <p className="font-bold text-gray-900">{hasPage ? 'Votre page Boutique est en ligne' : 'Ajouter une page Boutique à votre site'}</p>
                <p className="text-sm text-gray-600">{hasPage ? 'Vos produits s’affichent avec catégories, recherche et tri, aux couleurs de votre site.' : 'Une page toute prête (catégories, recherche, grille) reliée à vos produits.'}</p>
              </div>
            </div>
            {hasPage ? (
              boutiqueUrl && <a href={boutiqueUrl} target="_blank" rel="noreferrer" className="btn btn-ghost"><ExternalLink className="h-4 w-4" /> Voir la page</a>
            ) : (
              <button onClick={addBoutiquePage} disabled={creatingPage} className="btn btn-primary"><Plus className="h-4 w-4" /> {creatingPage ? 'Création…' : 'Créer la page Boutique'}</button>
            )}
          </div>

          {/* Payments — Stripe Connect */}
          <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${connect.ready ? 'border-green-200 bg-green-50/60' : 'border-amber-200 bg-amber-50/60'}`}>
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ${connect.ready ? 'text-green-600 ring-green-100' : 'text-amber-600 ring-amber-100'}`}>{connect.ready ? <CheckCircle2 className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}</div>
              <div>
                <p className="font-bold text-gray-900">{connect.ready ? 'Paiements activés — vous encaissez vos ventes' : 'Encaisser les paiements par carte'}</p>
                <p className="text-sm text-gray-600">{connect.ready ? 'L’argent des ventes arrive directement sur votre compte Stripe.' : connect.started ? 'Votre inscription Stripe n’est pas terminée. Finalisez-la pour encaisser.' : 'Reliez votre compte Stripe pour recevoir l’argent de vos ventes directement.'}</p>
              </div>
            </div>
            {connect.ready ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"><CheckCircle2 className="h-4 w-4" /> Prêt</span>
            ) : (
              <button onClick={connectStripe} disabled={connecting} className="btn btn-primary"><CreditCard className="h-4 w-4" /> {connecting ? 'Ouverture…' : connect.started ? 'Continuer l’inscription' : 'Connecter mon compte Stripe'}</button>
            )}
          </div>
          {!connect.ready && products.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700"><AlertCircle className="h-3.5 w-3.5" /> Tant que Stripe n’est pas connecté, les clients peuvent voir vos produits mais pas payer par carte.</p>
          )}

          {/* Recent orders */}
          {orders.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <h2 className="mb-3 text-lg font-extrabold text-gray-900">Commandes payées <span className="text-gray-400">({orders.length})</span></h2>
              <div className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{o.customerName || 'Client'} <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">{o.status === 'SHIPPED' ? 'Expédiée' : 'Payée'}</span></p>
                      <p className="truncate text-sm text-gray-500">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
                      {(o.customerEmail || o.shippingAddress) && <p className="truncate text-xs text-gray-400">{[o.customerEmail, o.customerPhone, o.shippingAddress].filter(Boolean).join(' · ')}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-gray-900">{euros(o.totalCents)}</p>
                      <p className="text-xs text-gray-400">{formatDate(o.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">Ces ventes sont aussi enregistrées dans votre Comptabilité.</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Vos produits {products.length > 0 && <span className="text-gray-400">({products.length})</span>}</h2>
              {branded && products.some((product) => product.provider === 'contrado') && <p className="text-sm text-gray-500"><span className="font-bold text-green-700">{products.filter((product) => product.active).length} affiché{products.filter((product) => product.active).length > 1 ? 's' : ''}</span> sur le site · choisissez la visibilité sur chaque article.</p>}
            </div>
            {!draft && <button onClick={startAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Ajouter un produit</button>}
          </div>

          {/* Add / edit form */}
          {draft && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              {/* Photos */}
              <label className="label">Photos <span className="font-normal text-gray-400">— la 1ʳᵉ est l’image principale, glissez pour réorganiser</span></label>
              <div className="flex flex-wrap gap-3">
                {draft.images.map((src, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => { dragIndex.current = i; }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (dragIndex.current !== null) moveImage(dragIndex.current, i); dragIndex.current = null; }}
                    className={`group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-2 ${i === 0 ? 'ring-brand-500' : 'ring-gray-200'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand-600 px-1 py-0.5 text-[9px] font-bold text-white">PRINCIPALE</span>}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 px-1 py-0.5 opacity-0 transition group-hover:opacity-100">
                      <button type="button" onClick={() => moveImage(i, i - 1)} title="Déplacer à gauche" className="text-white disabled:opacity-30" disabled={i === 0}><ArrowLeft className="h-3.5 w-3.5" /></button>
                      {i !== 0 && <button type="button" onClick={() => makeMain(i)} title="Définir comme principale" className="text-white"><Star className="h-3.5 w-3.5" /></button>}
                      <button type="button" onClick={() => moveImage(i, i + 1)} title="Déplacer à droite" className="text-white disabled:opacity-30" disabled={i === draft.images.length - 1}><ArrowRight className="h-3.5 w-3.5" /></button>
                    </div>
                    <button type="button" onClick={() => removeImage(i)} title="Supprimer" className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/50 text-white"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {draft.images.length < 8 && (
                  <label className="grid h-24 w-24 shrink-0 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-brand-400 hover:text-brand-500">
                    <div className="text-center"><ImagePlus className="mx-auto h-6 w-6" /><span className="text-[10px]">Ajouter</span></div>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ''; }} />
                  </label>
                )}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div><label className="label">Nom du produit</label><input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex : Sac Marmont" /></div>
                <div><label className="label">Prix (€)</label><input className="input" type="number" min="0" step="0.01" value={draft.priceEuros} onChange={(e) => setDraft({ ...draft, priceEuros: e.target.value })} placeholder="19.90" /></div>
                <div>
                  <label className="label">Catégorie</label>
                  <input className="input" list="shop-categories" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Ex : Sacs, Chaussures, Robes…" />
                  <datalist id="shop-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
                <div><label className="label">Marque <span className="font-normal text-gray-400">(optionnel)</span></label><input className="input" value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} placeholder="Ex : Gucci" /></div>
                <div className="md:col-span-2"><label className="label">Description</label><textarea className="input min-h-[80px]" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Décrivez le produit…" /></div>
                <div><label className="label">Stock <span className="font-normal text-gray-400">(vide = illimité)</span></label><input className="input" type="number" min="0" step="1" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} placeholder="illimité" /></div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={save} disabled={busy} className="btn btn-primary"><Save className="h-4 w-4" /> {busy ? 'Enregistrement…' : editingId ? 'Enregistrer' : 'Ajouter le produit'}</button>
                <button onClick={cancel} className="btn btn-ghost"><X className="h-4 w-4" /> Annuler</button>
              </div>
            </div>
          )}

          {/* Product list */}
          {products.length === 0 && !draft && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-500">Aucun produit pour l’instant. Cliquez « Ajouter un produit ».</div>
          )}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {products.map((p) => (
              <div key={p.id} className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 ${!p.active ? 'opacity-60' : ''}`}>
                {mainImage(p) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainImage(p)} alt={p.name} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="grid aspect-square w-full place-items-center bg-gray-100 text-gray-300"><Package className="h-10 w-10" /></div>
                )}
                <div className="p-4">
                  {p.brand && <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{p.brand}{p.category ? ` · ${p.category}` : ''}</p>}
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-gray-900">{p.name}</p>
                    <p className="shrink-0 font-extrabold text-brand-700">{euros(p.priceCents)}</p>
                  </div>
                  {p.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{p.description}</p>}
                  <p className="mt-1 text-xs text-gray-400">{p.stock == null ? 'Stock illimité' : `${p.stock} en stock`}{(p.images?.length || 0) > 1 ? ` · ${p.images!.length} photos` : ''}</p>
                  {p.provider === 'contrado' && <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#d33f5c]">Synchronisé avec Contrado</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => startEdit(p)} className="btn btn-ghost flex-1 text-sm"><Pencil className="h-4 w-4" /> Modifier</button>
                    <button onClick={() => toggleActive(p)} aria-pressed={p.active} className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition ${p.active ? 'bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-200'}`}>{p.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}{p.active ? 'Affiché en ligne' : 'Masqué du site'}</button>
                    {p.provider !== 'contrado' && <button onClick={() => remove(p)} title="Supprimer" className="grid h-9 w-9 place-items-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}
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
