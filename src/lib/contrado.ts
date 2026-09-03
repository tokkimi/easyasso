// Fetch a merchant's catalogue from an external Contrado (print-on-demand) API
// and normalise it into the shape our Product table uses. Everything is pulled
// server-side so visitors never leave the site — no external redirect.

export type NormalizedProduct = {
  externalId: string;
  name: string;
  description: string;
  priceCents: number;
  images: string[];
  category: string;
  brand: string;
};

export type ContradoResult = {
  items: NormalizedProduct[];
  diagnostic: { topKeys: string[]; container: string; itemKeys: string[]; count: number };
};

// Reject non-https and internal/private hosts (SSRF-safe). The action itself is
// already gated behind SITE_EDIT, but we still refuse obviously-internal targets.
export function assertSafeFeedUrl(raw: string): string {
  let u: URL;
  try { u = new URL(String(raw).trim()); } catch { throw new Error('URL invalide.'); }
  if (u.protocol !== 'https:') throw new Error('L’adresse de l’API doit commencer par https://');
  const host = u.hostname.toLowerCase();
  const blocked =
    ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(host) ||
    host.endsWith('.local') ||
    /^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  if (blocked) throw new Error('Cet hôte n’est pas autorisé.');
  return u.toString();
}

function toUrl(v: any): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.url || v.src || v.href || v.large || v.original || v.image || v.imageUrl || '';
  return '';
}

function extractImages(item: any): string[] {
  const out: string[] = [];
  const push = (v: any) => { const u = toUrl(v); if (u) out.push(u); };
  if (Array.isArray(item.images)) item.images.forEach(push);
  else if (item.images) push(item.images);
  if (Array.isArray(item.photos)) item.photos.forEach(push);
  ['imageUrl', 'image', 'thumbnail', 'mainImage', 'photo', 'picture'].forEach((k) => push(item[k]));
  return Array.from(new Set(out.filter((u) => /^https?:\/\//i.test(u)))).slice(0, 8);
}

function parsePriceCents(item: any): number {
  for (const k of ['priceCents', 'price_cents', 'amountCents']) {
    if (typeof item[k] === 'number') return Math.max(0, Math.round(item[k]));
  }
  const raw =
    item.price ?? item.unitPrice ?? item.unit_price ?? item.amount ??
    item.retailPrice ?? item.retail_price ?? item.sellingPrice ?? item.cost;
  if (raw == null) return 0;
  if (typeof raw === 'number') return Math.max(0, Math.round(raw * 100));
  // Strings like "£19.99", "19,99 €", "1 299,00"
  const s = String(raw).replace(/[^0-9.,]/g, '').replace(/\s/g, '').replace(/,(\d{2})$/, '.$1').replace(/,/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : 0;
}

function pickArray(json: any): { arr: any[]; container: string } {
  if (Array.isArray(json)) return { arr: json, container: '(racine)' };
  if (json && typeof json === 'object') {
    for (const k of ['products', 'items', 'data', 'results', 'catalogue', 'catalog', 'Products', 'productList']) {
      if (Array.isArray(json[k])) return { arr: json[k], container: k };
    }
    // Fallback: first array-valued property.
    for (const [k, v] of Object.entries(json)) {
      if (Array.isArray(v)) return { arr: v as any[], container: k };
    }
  }
  return { arr: [], container: '' };
}

function normalizeItem(item: any, i: number): NormalizedProduct {
  const name = String(item.name || item.title || item.productName || item.product_name || item.label || '').trim();
  return {
    externalId: String(item.id ?? item.productId ?? item.product_id ?? item.sku ?? item.code ?? (name || i)),
    name: name || 'Article',
    description: String(item.description || item.desc || item.summary || item.details || '').trim(),
    priceCents: parsePriceCents(item),
    images: extractImages(item),
    category: String(item.category || item.categoryName || item.productType || item.product_type || item.type || '').trim(),
    brand: String(item.brand || item.vendor || item.manufacturer || '').trim(),
  };
}

export async function fetchContradoProducts(rawUrl: string, token: string): Promise<ContradoResult> {
  const url = assertSafeFeedUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}`, 'x-api-key': token } : {}),
      },
      signal: controller.signal,
      cache: 'no-store',
    });
  } catch (e: any) {
    clearTimeout(timeout);
    throw new Error(e?.name === 'AbortError' ? 'L’API Contrado n’a pas répondu (délai dépassé).' : 'Impossible de joindre l’API Contrado.');
  }
  clearTimeout(timeout);

  if (!res.ok) throw new Error(`L’API a répondu ${res.status}. Vérifiez le lien et le jeton.`);

  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error('La réponse de l’API n’est pas au format JSON attendu.'); }

  const { arr, container } = pickArray(json);
  const items = arr.map(normalizeItem).filter((p) => p.name);
  const diagnostic = {
    topKeys: json && typeof json === 'object' && !Array.isArray(json) ? Object.keys(json).slice(0, 20) : [],
    container,
    itemKeys: arr[0] && typeof arr[0] === 'object' ? Object.keys(arr[0]).slice(0, 30) : [],
    count: items.length,
  };
  return { items, diagnostic };
}
