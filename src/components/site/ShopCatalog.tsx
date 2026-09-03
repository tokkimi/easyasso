'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, LockKeyhole, Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';

export type ShopVariant = {
  id: string;
  label: string;
  priceCents: number;
  options: Array<{ optionId?: number; optionName?: string; optionValueId?: number; optionValueName?: string }>;
};
export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  images: string[];
  category?: string;
  brand?: string;
  stock?: number | null;
  provider?: string | null;
  checkoutUrl?: string;
  variants?: ShopVariant[];
};
type CartLine = {
  key: string;
  id: string;
  name: string;
  priceCents: number;
  image?: string;
  qty: number;
  variantId?: string;
  variantLabel?: string;
};
type GuestDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
};

const EMPTY_GUEST: GuestDetails = { name: '', email: '', phone: '', address: '', postalCode: '', city: '', country: 'FR' };
const COUNTRIES = [['FR', 'France'], ['BE', 'Belgique'], ['CH', 'Suisse'], ['LU', 'Luxembourg'], ['MC', 'Monaco'], ['DE', 'Allemagne'], ['ES', 'Espagne'], ['IT', 'Italie'], ['NL', 'Pays-Bas'], ['GB', 'Royaume-Uni'], ['US', 'États-Unis'], ['CA', 'Canada']];

function euros(cents: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: cents % 100 ? 2 : 0 }).format((cents || 0) / 100);
}

function variantSizeRank(variant: ShopVariant) {
  const size = variant.options.find((option) => /taille|size/i.test(option.optionName || ''))?.optionValueName || variant.label;
  const normalized = size.toUpperCase().replace(/\s+/g, '');
  const namedOrder = ['XXXS', '3XS', 'XXS', '2XS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL'];
  const namedIndex = namedOrder.findIndex((value) => new RegExp(`(^|[^A-Z0-9])${value}([^A-Z0-9]|$)`).test(normalized));
  if (namedIndex >= 0) return namedIndex;
  const numeric = normalized.match(/(?:^|[^0-9])(\d{1,3})(?:[^0-9]|$)/);
  return numeric ? 100 + Number(numeric[1]) : 1000;
}

export function ShopCatalog({ products, title, intro, search = true, showCategories = true, columns = 4, organizationId = '', canCheckout = false, branded = false }: { products: ShopProduct[]; title?: string; intro?: string; search?: boolean; showCategories?: boolean; columns?: number; organizationId?: string; canCheckout?: boolean; branded?: boolean }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [openProduct, setOpenProduct] = useState<ShopProduct | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [guest, setGuest] = useState<GuestDetails>(EMPTY_GUEST);
  const prefix = branded ? 'vielusos' : 'easyasso';
  const cartKey = `${prefix}-cart-${organizationId}`;
  const favoritesKey = `${prefix}-favorites-${organizationId}`;
  const guestKey = `${prefix}-guest-${organizationId}`;

  useEffect(() => { try { const raw = localStorage.getItem(cartKey); if (raw) setCart((JSON.parse(raw) as CartLine[]).map((line) => ({ ...line, key: line.key || `${line.id}:${line.variantId || 'default'}` }))); } catch {} }, [cartKey]);
  useEffect(() => { try { localStorage.setItem(cartKey, JSON.stringify(cart)); } catch {} }, [cart, cartKey]);
  useEffect(() => { try { const raw = localStorage.getItem(favoritesKey); if (raw) setFavorites(JSON.parse(raw)); } catch {} }, [favoritesKey]);
  useEffect(() => { try { localStorage.setItem(favoritesKey, JSON.stringify(favorites)); } catch {} }, [favorites, favoritesKey]);
  useEffect(() => { try { const raw = localStorage.getItem(guestKey); if (raw) setGuest({ ...EMPTY_GUEST, ...JSON.parse(raw) }); } catch {} }, [guestKey]);
  useEffect(() => { try { localStorage.setItem(guestKey, JSON.stringify(guest)); } catch {} }, [guest, guestKey]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`easyasso-customer-${organizationId}`);
      if (!raw) return;
      const profile = JSON.parse(raw);
      setGuest((current) => ({ ...current, name: current.name || profile.name || '', email: current.email || profile.email || '' }));
    } catch {}
  }, [organizationId]);
  useEffect(() => {
    document.body.classList.toggle('shop-cart-open', cartOpen);
    return () => document.body.classList.remove('shop-cart-open');
  }, [cartOpen]);
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('order') === 'success') {
      setCart([]);
      try { localStorage.removeItem(cartKey); } catch {}
    }
  }, [cartKey]);

  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category).filter(Boolean))) as string[], [products]);
  const visibleProducts = useMemo(() => {
    let result = products.slice();
    if (showFavorites) result = result.filter((product) => favorites.includes(product.id));
    if (category) result = result.filter((product) => product.category === category);
    const normalized = query.trim().toLowerCase();
    if (normalized) result = result.filter((product) => [product.name, product.brand, product.category, product.description].some((value) => (value || '').toLowerCase().includes(normalized)));
    if (sort === 'price-asc') result.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === 'price-desc') result.sort((a, b) => b.priceCents - a.priceCents);
    return result;
  }, [products, showFavorites, favorites, category, query, sort]);

  const gridCols = columns >= 4 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : columns === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2';
  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const cartTotal = cart.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const strong = branded ? 'text-white' : 'text-gray-900';
  const muted = branded ? 'text-white/55' : 'text-gray-500';
  const field = branded ? 'border-white/15 bg-white/[.045] text-white placeholder:text-white/30 focus:border-white/60' : 'border-gray-200 bg-white text-gray-900 focus:border-[var(--brand)]';
  const primary = branded ? 'bg-white text-black hover:bg-white/85' : 'bg-[var(--brand)] text-white hover:opacity-90';

  function addToCart(product: ShopProduct, quantity = 1, variant?: ShopVariant) {
    const key = `${product.id}:${variant?.id || 'default'}`;
    setCart((current) => {
      const found = current.find((line) => line.key === key);
      if (found) return current.map((line) => line.key === key ? { ...line, qty: Math.min(99, line.qty + quantity) } : line);
      return [...current, { key, id: product.id, name: product.name, priceCents: variant?.priceCents || product.priceCents, image: product.images[0], qty: quantity, variantId: variant?.id, variantLabel: variant?.label }];
    });
    setOpenProduct(null);
    setCartOpen(true);
  }
  function setQuantity(key: string, quantity: number) {
    setCart((current) => quantity <= 0 ? current.filter((line) => line.key !== key) : current.map((line) => line.key === key ? { ...line, qty: Math.min(99, quantity) } : line));
  }
  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  async function checkout(event: FormEvent) {
    event.preventDefault();
    if (!cart.length) return;
    if (branded) {
      window.location.href = 'https://www.contrado.fr/stores/vielusos';
      return;
    }
    if (!canCheckout) return;
    setPaying(true);
    const returnPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const response = await fetch('/api/shop/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId, returnPath, guest, items: cart.map((line) => ({ productId: line.id, quantity: line.qty, variantId: line.variantId })) }),
    });
    const data = await response.json().catch(() => ({}));
    setPaying(false);
    if (!response.ok || !data.url) return alert(data.error || 'Paiement impossible pour le moment.');
    window.location.href = data.url;
  }

  return <div className={`mx-auto w-full max-w-none px-[5vw] font-light sm:px-[10vw] ${branded ? 'vielusos-shop text-white' : ''}`}>
    {title && <h2 className={`text-center text-2xl font-light tracking-[.22em] md:text-3xl ${strong}`}>{title}</h2>}
    {intro && <p className={`mx-auto mt-2 max-w-2xl text-center font-light ${muted}`}>{intro}</p>}
    <div className={`mt-6 flex items-center justify-between border-y py-3 ${branded ? 'border-white/10' : 'border-gray-200'}`}>
      <span className={`text-[10px] uppercase tracking-[.28em] ${muted}`}>Collection officielle</span>
      <button type="button" onClick={() => setCartOpen(true)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-normal uppercase tracking-[.12em] ${branded ? 'border-white/25 text-white hover:bg-white hover:text-black' : 'border-gray-300 text-gray-800'}`}><ShoppingBag className="h-4 w-4" /> Panier ({cartCount})</button>
    </div>
    {showCategories && categories.length > 0 && <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><Filter active={!category} branded={branded} onClick={() => setCategory('')}>Tout</Filter>{categories.map((item) => <Filter key={item} active={category === item} branded={branded} onClick={() => setCategory(item)}>{item}</Filter>)}</div>}
    {(search || products.length > 3) && <div className="mt-4 flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1"><Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un produit…" className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm font-light outline-none ${field}`} /></div>
      <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className={`rounded-xl border px-3 py-2.5 text-sm font-light outline-none ${field}`}><option value="recent">Plus récents</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option></select>
      <Filter active={showFavorites} branded={branded} onClick={() => setShowFavorites((value) => !value)}><Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} /> Favoris</Filter>
    </div>}
    {visibleProducts.length === 0 ? <p className={`py-16 text-center ${muted}`}>Aucun produit ne correspond à votre recherche.</p> : <div className={`mt-6 grid gap-6 md:gap-8 ${gridCols}`}>
      {visibleProducts.map((product) => {
        const soldOut = product.stock != null && product.stock <= 0;
        return <article key={product.id} className="group min-w-0">
          <button type="button" onClick={() => setOpenProduct(product)} className={`relative block aspect-square w-full overflow-hidden rounded-2xl border ${branded ? 'border-white/10 bg-black/40' : 'border-transparent bg-gray-100'}`}>{product.images[0] && <img src={product.images[0]} alt={product.name} loading="lazy" className={`h-full w-full transition duration-300 group-hover:scale-[1.025] ${branded ? 'object-contain' : 'object-cover'}`} />}</button>
          <div className="mt-3">{(product.brand || product.category) && <p className={`truncate text-[10px] uppercase tracking-[.2em] ${muted}`}>{product.brand}{product.brand && product.category ? ' · ' : ''}{product.category}</p>}<button type="button" onClick={() => setOpenProduct(product)} className={`mt-1 line-clamp-2 text-left text-sm font-light uppercase tracking-[.06em] ${strong}`}>{product.name}</button><p className={`mt-1 text-sm font-normal ${strong}`}>{product.variants?.length ? `À partir de ${euros(product.priceCents)}` : euros(product.priceCents)}</p></div>
          <div className="mt-3 flex gap-2"><button type="button" onClick={() => product.variants?.length ? setOpenProduct(product) : addToCart(product)} disabled={soldOut} className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-[11px] font-normal uppercase tracking-[.1em] disabled:opacity-40 ${primary}`}><ShoppingBag className="h-4 w-4" />{product.variants?.length ? 'Choisir les options' : 'Ajouter au panier'}</button><button type="button" onClick={() => toggleFavorite(product.id)} className={`grid h-10 w-10 place-items-center rounded-full border ${branded ? 'border-white/20 text-white' : 'border-gray-300 text-gray-600'}`} aria-label="Favori"><Heart className={`h-4 w-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} /></button></div>
        </article>;
      })}
    </div>}
    {openProduct && <ProductModal product={openProduct} branded={branded} isFavorite={favorites.includes(openProduct.id)} onFavorite={() => toggleFavorite(openProduct.id)} onAdd={addToCart} onClose={() => setOpenProduct(null)} />}
    {cartCount > 0 && !cartOpen && <button onClick={() => setCartOpen(true)} className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-xs font-normal uppercase tracking-[.1em] shadow-2xl ${branded ? 'border border-white/20 bg-[#0b0b10] text-white' : 'bg-[var(--brand)] text-white'}`}><ShoppingBag className="h-5 w-5" /> Panier · {cartCount} · {euros(cartTotal)}</button>}
    {cartOpen && <CartDrawer cart={cart} total={cartTotal} guest={guest} setGuest={setGuest} setQuantity={setQuantity} onClose={() => setCartOpen(false)} onCheckout={checkout} paying={paying} canCheckout={canCheckout} branded={branded} fieldClass={field} primaryClass={primary} />}
  </div>;
}

function Filter({ active, branded, onClick, children }: { active: boolean; branded: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={`flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-light uppercase tracking-[.08em] transition ${active ? (branded ? 'border-white bg-white text-black' : 'border-transparent bg-[var(--brand)] text-white') : (branded ? 'border-white/15 bg-white/[.04] text-white/70 hover:bg-white/10' : 'border-transparent bg-gray-100 text-gray-700')}`}>{children}</button>;
}

function CartDrawer({ cart, total, guest, setGuest, setQuantity, onClose, onCheckout, paying, canCheckout, branded, fieldClass, primaryClass }: { cart: CartLine[]; total: number; guest: GuestDetails; setGuest: (guest: GuestDetails) => void; setQuantity: (key: string, qty: number) => void; onClose: () => void; onCheckout: (event: FormEvent) => void; paying: boolean; canCheckout: boolean; branded: boolean; fieldClass: string; primaryClass: string }) {
  const strong = branded ? 'text-white' : 'text-gray-900';
  const muted = branded ? 'text-white/55' : 'text-gray-500';
  return <div className="fixed inset-0 z-[100] flex justify-end bg-black/75 backdrop-blur-sm sm:items-center" onClick={onClose}>
    <div className={`flex h-[100dvh] w-full max-w-md flex-col border-l sm:h-[min(92dvh,760px)] sm:rounded-l-3xl ${branded ? 'border-white/15 bg-[#0b0b10] text-white' : 'border-gray-200 bg-white text-gray-900'}`} onClick={(event) => event.stopPropagation()}>
      <div className={`flex items-center justify-between border-b px-4 py-3 ${branded ? 'border-white/10' : 'border-gray-100'}`}><div><p className={`text-base font-normal uppercase tracking-[.12em] ${strong}`}>Votre panier</p><p className={`text-[11px] font-light ${muted}`}>Avec ou sans compte client</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-current/15"><X className="h-4 w-4" /></button></div>
      <form onSubmit={onCheckout} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
          {cart.length === 0 ? <p className={`py-12 text-center ${muted}`}>Votre panier est vide.</p> : cart.map((line) => <div key={line.key} className={`flex items-center gap-3 border-b py-2.5 ${branded ? 'border-white/10' : 'border-gray-100'}`}><div className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg ${branded ? 'bg-black' : 'bg-gray-100'}`}>{line.image && <img src={line.image} alt="" className="h-full w-full object-contain" />}</div><div className="min-w-0 flex-1"><p className={`truncate text-xs font-normal ${strong}`}>{line.name}</p>{line.variantLabel && <p className={`truncate text-[10px] ${muted}`}>{line.variantLabel}</p>}<div className="mt-1 flex items-center gap-2"><span className={`text-xs ${muted}`}>{euros(line.priceCents)}</span><button type="button" onClick={() => setQuantity(line.key, line.qty - 1)} className="ml-auto grid h-6 w-6 place-items-center rounded-md border border-current/20"><Minus className="h-3 w-3" /></button><span className="w-4 text-center text-xs">{line.qty}</span><button type="button" onClick={() => setQuantity(line.key, line.qty + 1)} className="grid h-6 w-6 place-items-center rounded-md border border-current/20"><Plus className="h-3 w-3" /></button><button type="button" onClick={() => setQuantity(line.key, 0)} className={muted}><Trash2 className="h-3.5 w-3.5" /></button></div></div></div>)}
          {!branded && cart.length > 0 && <div className="py-4"><p className={`text-xs font-normal uppercase tracking-[.12em] ${strong}`}>Livraison</p><p className={`mt-1 text-[11px] ${muted}`}>Les champs sont préremplis si vous êtes connecté.</p><div className="mt-3 grid gap-2 sm:grid-cols-2"><GuestField label="Nom complet" value={guest.name} onChange={(value) => setGuest({ ...guest, name: value })} className={fieldClass} autoComplete="name" /><GuestField label="E-mail" value={guest.email} onChange={(value) => setGuest({ ...guest, email: value })} className={fieldClass} type="email" autoComplete="email" /><GuestField label="Téléphone" value={guest.phone} onChange={(value) => setGuest({ ...guest, phone: value })} className={fieldClass} type="tel" autoComplete="tel" required={false} /><label className={`text-[11px] font-light ${muted}`}>Pays<select required value={guest.country} onChange={(event) => setGuest({ ...guest, country: event.target.value })} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm font-light outline-none ${fieldClass}`}>{COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label><div className="sm:col-span-2"><GuestField label="Adresse" value={guest.address} onChange={(value) => setGuest({ ...guest, address: value })} className={fieldClass} autoComplete="street-address" /></div><GuestField label="Code postal" value={guest.postalCode} onChange={(value) => setGuest({ ...guest, postalCode: value })} className={fieldClass} autoComplete="postal-code" /><GuestField label="Ville" value={guest.city} onChange={(value) => setGuest({ ...guest, city: value })} className={fieldClass} autoComplete="address-level2" /></div></div>}
        </div>
        <div className={`relative z-10 shrink-0 border-t px-4 py-3 shadow-[0_-12px_30px_rgba(0,0,0,.25)] ${branded ? 'border-white/10 bg-[#0b0b10]' : 'border-gray-100 bg-white'}`}><div className={`mb-2 flex justify-between text-base font-normal ${strong}`}><span>Total</span><span>{euros(total)}</span></div><button type="submit" disabled={paying || !cart.length || (!branded && !canCheckout)} className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-normal uppercase tracking-[.08em] disabled:cursor-not-allowed disabled:opacity-45 ${primaryClass}`}><LockKeyhole className="h-4 w-4" />{paying ? 'Redirection…' : 'Continuer vers le paiement'}</button><p className={`mt-1.5 text-center text-[10px] ${muted}`}>{branded ? 'Options finales, livraison et règlement sécurisé à l’étape suivante.' : canCheckout ? 'Paiement sécurisé Stripe · sans compte obligatoire' : 'Activez Stripe dans l’administration pour accepter le paiement.'}</p></div>
      </form>
    </div>
  </div>;
}

function GuestField({ label, value, onChange, className, type = 'text', autoComplete, required = true }: { label: string; value: string; onChange: (value: string) => void; className: string; type?: string; autoComplete?: string; required?: boolean }) {
  return <label className="text-[11px] font-light text-current/65">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm font-light outline-none ${className}`} /></label>;
}

function ProductModal({ product, branded, isFavorite, onFavorite, onAdd, onClose }: { product: ShopProduct; branded: boolean; isFavorite: boolean; onFavorite: () => void; onAdd: (product: ShopProduct, qty: number, variant?: ShopVariant) => void; onClose: () => void }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const variants = useMemo(() => [...(product.variants || [])].sort((left, right) => variantSizeRank(left) - variantSizeRank(right) || left.label.localeCompare(right.label, 'fr', { numeric: true })), [product.variants]);
  const [variantId, setVariantId] = useState(variants[0]?.id || '');
  const images = product.images.length ? product.images : [''];
  const variant = variants.find((item) => item.id === variantId);
  const price = variant?.priceCents || product.priceCents;
  const strong = branded ? 'text-white' : 'text-gray-900';
  const muted = branded ? 'text-white/60' : 'text-gray-500';
  const soldOut = product.stock != null && product.stock <= 0;

  return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
    <div className={`max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border sm:rounded-3xl ${branded ? 'border-white/15 bg-[#0b0b10]' : 'border-transparent bg-white'}`} onClick={(event) => event.stopPropagation()}>
      <div className="grid md:grid-cols-[1.2fr_.8fr]">
        <div className={`relative ${branded ? 'bg-black/40' : 'bg-gray-100'}`}>
          <div className="relative aspect-square">
            {images[imageIndex] && <img src={images[imageIndex]} alt={`${product.name} — vue ${imageIndex + 1}`} className="h-full w-full object-contain" />}
            {images.length > 1 && <>
              <button onClick={() => setImageIndex((value) => (value - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/65 text-white"><ChevronLeft /></button>
              <button onClick={() => setImageIndex((value) => (value + 1) % images.length)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/65 text-white"><ChevronRight /></button>
            </>}
          </div>
          {images.length > 1 && <div className="flex gap-2 overflow-x-auto p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{images.map((image, index) => <button key={`${image}-${index}`} onClick={() => setImageIndex(index)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border ${imageIndex === index ? 'border-white' : 'border-white/15 opacity-60'}`}><img src={image} alt="" className="h-full w-full object-contain" /></button>)}</div>}
        </div>
        <div className="relative flex flex-col p-5 md:p-7">
          <button onClick={onClose} className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border ${branded ? 'border-white/15 text-white' : 'border-gray-200 text-gray-700'}`}><X className="h-4 w-4" /></button>
          {(product.brand || product.category) && <p className={`pr-12 text-[10px] uppercase tracking-[.2em] ${muted}`}>{product.brand}{product.brand && product.category ? ' · ' : ''}{product.category}</p>}
          <h3 className={`mt-2 pr-12 text-xl font-light uppercase tracking-[.08em] ${strong}`}>{product.name}</h3>
          <p className={`mt-3 text-lg font-normal ${strong}`}>{euros(price)}</p>
          {product.description && <p className={`mt-4 whitespace-pre-wrap text-sm font-light leading-relaxed ${branded ? 'text-white/70' : 'text-gray-600'}`}>{product.description}</p>}
          {variants.length ? <label className={`mt-5 text-[11px] uppercase tracking-[.12em] ${muted}`}>Taille / finition<select value={variantId} onChange={(event) => setVariantId(event.target.value)} className={`mt-2 w-full rounded-xl border px-3 py-3 text-sm font-light ${branded ? 'border-white/20 bg-[#15151b] text-white' : 'border-gray-200 bg-white text-gray-900'}`}>{variants.map((item) => <option key={item.id} value={item.id}>{item.label || item.id} — {euros(item.priceCents)}</option>)}</select></label> : null}
          <button type="button" onClick={onFavorite} className={`mt-4 inline-flex w-fit items-center gap-2 text-xs ${muted}`}><Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />{isFavorite ? 'Dans mes favoris' : 'Ajouter aux favoris'}</button>
          {!soldOut && <div className="mt-auto flex items-center gap-3 pt-5">
            <div className="flex items-center rounded-xl border border-current/20"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className={`grid h-11 w-10 place-items-center ${muted}`}><Minus className="h-4 w-4" /></button><span className={`w-7 text-center text-sm ${strong}`}>{quantity}</span><button onClick={() => setQuantity((value) => Math.min(99, value + 1))} className={`grid h-11 w-10 place-items-center ${muted}`}><Plus className="h-4 w-4" /></button></div>
            <button onClick={() => onAdd(product, quantity, variant)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-normal uppercase tracking-[.08em] ${branded ? 'bg-white text-black' : 'bg-[var(--brand)] text-white'}`}><ShoppingBag className="h-4 w-4" />Ajouter au panier</button>
          </div>}
        </div>
      </div>
    </div>
  </div>;
}
