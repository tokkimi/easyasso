'use client';
import { useMemo, useState } from 'react';
import { Search, X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  images: string[];
  category?: string;
  brand?: string;
  stock?: number | null;
};

function euros(cents: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: (cents % 100 ? 2 : 0) }).format((cents || 0) / 100);
}

export function ShopCatalog({
  products, title, intro, search = true, showCategories = true, columns = 4,
}: { products: ShopProduct[]; title?: string; intro?: string; search?: boolean; showCategories?: boolean; columns?: number }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('');
  const [sort, setSort] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [open, setOpen] = useState<ShopProduct | null>(null);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[], [products]);

  const list = useMemo(() => {
    let l = products.slice();
    if (cat) l = l.filter((p) => p.category === cat);
    const query = q.trim().toLowerCase();
    if (query) l = l.filter((p) => [p.name, p.brand, p.category, p.description].some((v) => (v || '').toLowerCase().includes(query)));
    if (sort === 'price-asc') l.sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === 'price-desc') l.sort((a, b) => b.priceCents - a.priceCents);
    return l; // 'recent' keeps the server order (newest handled server-side)
  }, [products, cat, q, sort]);

  const gridCols = columns >= 4 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : columns === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2';

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      {title && <h2 className="text-center text-3xl font-extrabold text-gray-900 md:text-4xl">{title}</h2>}
      {intro && <p className="mx-auto mt-2 max-w-2xl text-center text-gray-500">{intro}</p>}

      {/* Categories — horizontal scroll on mobile and desktop */}
      {showCategories && categories.length > 0 && (
        <div className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setCat('')} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${cat === '' ? 'bg-[var(--brand)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Tout</button>
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c ? 'bg-[var(--brand)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{c}</button>
          ))}
        </div>
      )}

      {/* Search (shop page only) + sort */}
      {(search || products.length > 3) && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {search ? (
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit, une marque…" className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand)]" />
            </div>
          ) : <div />}
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]">
            <option value="recent">Plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
      )}

      {/* Product grid */}
      {list.length === 0 ? (
        <p className="py-16 text-center text-gray-400">{products.length === 0 ? 'La boutique arrive bientôt.' : 'Aucun produit ne correspond à votre recherche.'}</p>
      ) : (
        <div className={`mt-6 grid gap-4 ${gridCols}`}>
          {list.map((p) => (
            <button key={p.id} onClick={() => setOpen(p)} className="group text-left">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : null}
                <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-gray-500 shadow-sm"><Heart className="h-4 w-4" /></span>
              </div>
              <div className="mt-2">
                {(p.brand || p.category) && <p className="truncate text-[11px] font-bold uppercase tracking-wide text-gray-500"><span className="text-[var(--brand)]">{p.brand}</span>{p.brand && p.category ? ' · ' : ''}{p.category}</p>}
                <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-gray-900">{p.name}</p>
                <p className="mt-1 font-extrabold text-gray-900">{euros(p.priceCents)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && <ProductModal product={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function ProductModal({ product, onClose }: { product: ShopProduct; onClose: () => void }) {
  const [i, setI] = useState(0);
  const imgs = product.images.length ? product.images : [''];
  const prev = () => setI((v) => (v - 1 + imgs.length) % imgs.length);
  const next = () => setI((v) => (v + 1) % imgs.length);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <div className="relative aspect-square w-full overflow-hidden bg-gray-100 sm:aspect-[4/3]">
            {imgs[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgs[i]} alt={product.name} className="h-full w-full object-contain" />
            ) : null}
            {imgs.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-700 shadow"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={next} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-700 shadow"><ChevronRight className="h-5 w-5" /></button>
              </>
            )}
          </div>
          <button onClick={onClose} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-700 shadow"><X className="h-5 w-5" /></button>
          {imgs.length > 1 && (
            <div className="flex justify-center gap-1.5 py-2">
              {imgs.map((_, idx) => <button key={idx} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-5 bg-[var(--brand)]' : 'w-1.5 bg-gray-300'}`} />)}
            </div>
          )}
        </div>
        <div className="p-5">
          {(product.brand || product.category) && <p className="text-xs font-bold uppercase tracking-wide text-gray-500"><span className="text-[var(--brand)]">{product.brand}</span>{product.brand && product.category ? ' · ' : ''}{product.category}</p>}
          <div className="mt-1 flex items-start justify-between gap-3">
            <h3 className="text-xl font-extrabold text-gray-900">{product.name}</h3>
            <p className="shrink-0 text-xl font-extrabold text-gray-900">{euros(product.priceCents)}</p>
          </div>
          {product.stock != null && <p className="mt-1 text-sm text-gray-500">{product.stock > 0 ? `${product.stock} en stock` : 'Épuisé'}</p>}
          {product.description && <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-600">{product.description}</p>}
        </div>
      </div>
    </div>
  );
}
