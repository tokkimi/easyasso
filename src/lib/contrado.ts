import 'server-only';

const CONTRADO_API_BASE = 'https://api.contrado.app/helix/v1';
const MAX_SYNCED_PRODUCTS = 75;

type JsonRecord = Record<string, any>;

export type ContradoSyncProduct = {
  externalId: string;
  name: string;
  description: string;
  priceCents: number;
  images: string[];
  category: string;
  stock: number | null;
  externalData: JsonRecord;
};

function safeMessage(value: unknown, fallback: string) {
  const text = typeof value === 'string' ? value.trim() : '';
  return (text || fallback).slice(0, 260);
}

function unwrap(payload: any): any {
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data;
  return payload;
}

function listFrom(payload: any, keys: string[]): any[] {
  const value = unwrap(payload);
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  for (const key of keys) if (Array.isArray(value[key])) return value[key];
  return Object.keys(value).length ? [value] : [];
}

function recordsWithKey(payload: any, key: string): JsonRecord[] {
  const records: JsonRecord[] = [];
  const seen = new Set<any>();
  const visit = (value: any, depth: number) => {
    if (depth > 6 || value == null || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (!Array.isArray(value) && key in value) {
      records.push(value);
      return;
    }
    for (const child of Array.isArray(value) ? value : Object.values(value)) visit(child, depth + 1);
  };
  visit(payload, 0);
  return records;
}

async function request(apiKey: string, path: string, storeId?: string) {
  const response = await fetch(`${CONTRADO_API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'X-Culture-Code': 'fr-FR',
      ...(storeId ? { 'X-Store-Id': storeId } : {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(safeMessage(payload?.message || payload?.error?.message, response.status === 401 ? 'Clé Contrado refusée.' : `Contrado a répondu avec le code ${response.status}.`));
  }
  return payload;
}

function imageUrl(value: any) {
  return [value?.storeThumb800Quality, value?.thumbHighQuality, value?.storeThumb420Quality]
    .find((url) => typeof url === 'string' && /^https:\/\//i.test(url)) || '';
}

function uniqueImages(product: JsonRecord) {
  const preferred = Array.isArray(product.product3dImages) && product.product3dImages.length
    ? product.product3dImages
    : Array.isArray(product.productImages) ? product.productImages : [];
  const urls = preferred.map(imageUrl).filter(Boolean);
  if (typeof product.productThumb === 'string' && /^https:\/\//i.test(product.productThumb)) urls.unshift(product.productThumb);
  return Array.from(new Set(urls)).slice(0, 8);
}

function variantPrice(variant: JsonRecord) {
  const direct = Number(variant?.rrp);
  if (Number.isFinite(direct) && direct >= 0) return direct;
  const parsed = Number(String(variant?.formattedRRP || '').replace(/[^0-9,.-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
}

export async function readContradoStore(apiKey: string) {
  const storesPayload = await request(apiKey, '/stores');
  const stores = listFrom(storesPayload, ['stores', 'items', 'results', 'values']);
  const store = stores[0];
  if (!store) throw new Error('Aucune boutique Contrado n’est liée à cette clé.');
  return {
    storeId: String(store.storeId ?? ''),
    storeName: String(store.storeName || store.storeShortName || 'VIELUSOS'),
  };
}

export async function readContradoCatalog(apiKey: string, storeId: string) {
  const [productsPayload, collectionsPayload] = await Promise.all([
    request(apiKey, `/stores/products?PageNumber=1&PageSize=${MAX_SYNCED_PRODUCTS}`, storeId),
    request(apiKey, '/stores/collections?PageNumber=1&PageSize=100', storeId).catch(() => null),
  ]);
  const rawProducts = recordsWithKey(productsPayload, 'storeProductId').slice(0, MAX_SYNCED_PRODUCTS);
  const collections = recordsWithKey(collectionsPayload, 'storeCollectionId');
  const categoryById = new Map(collections.map((item) => [String(item.storeCollectionId || item.collectionId || ''), String(item.storeCollectionName || item.name || 'Collection')]));

  const products: ContradoSyncProduct[] = [];
  for (let offset = 0; offset < rawProducts.length; offset += 5) {
    const batch = rawProducts.slice(offset, offset + 5);
    const hydrated = await Promise.all(batch.map(async (product) => {
      const id = Number(product.storeProductId);
      if (!Number.isFinite(id) || id <= 0) return null;
      const variantsPayload = await request(apiKey, `/stores/products/${id}/option-variants`, storeId).catch(() => null);
      const variantData = unwrap(variantsPayload) || {};
      const variants = recordsWithKey(variantData, 'variantId');
      const prices = variants.map(variantPrice).filter(Number.isFinite);
      const price = prices.length ? Math.min(...prices) : 0;
      return {
        externalId: String(id),
        name: String(product.storeProductName || `Produit ${id}`).slice(0, 140),
        description: String(product.storeProductDescription || '').slice(0, 4000),
        priceCents: Math.max(0, Math.round(price * 100)),
        images: uniqueImages(product),
        category: categoryById.get(String(product.collectionId || '')) || 'Collection VIELUSOS',
        stock: product.isOutOfStock ? 0 : null,
        externalData: {
          storeProductId: id,
          storeId,
          storeProductURL: typeof product.storeProductURL === 'string' ? product.storeProductURL : '',
          siteUrl: typeof product.siteUrl === 'string' ? product.siteUrl : '',
          productOptions: Array.isArray(variantData.productOptions) ? variantData.productOptions : [],
          productVariants: variants,
          syncedFrom: 'contrado',
        },
      } satisfies ContradoSyncProduct;
    }));
    for (const product of hydrated) if (product) products.push(product);
  }
  return products;
}

export async function createContradoOrder(apiKey: string, storeId: string, order: {
  referenceId: string;
  totalAmount: number;
  recipient: { name: string; email: string; phone?: string; address1: string; city: string; postCode: string; countryCode: string };
  lines: Array<{ storeProductId: number; externalReferenceId?: string; variantId?: string; quantity: number; price: number; selectedOptions?: any[] }>;
}) {
  const response = await fetch(`${CONTRADO_API_BASE}/orders/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'X-Store-Id': storeId,
      'X-Culture-Code': 'fr-FR',
    },
    body: JSON.stringify({
      externalReferenceId: order.referenceId,
      recipient: {
        name: order.recipient.name,
        email: order.recipient.email,
        phone: order.recipient.phone || '',
        recipientPhone: order.recipient.phone || '',
        address1: order.recipient.address1,
        city: order.recipient.city,
        postCode: order.recipient.postCode,
        countryCode: order.recipient.countryCode,
      },
      lineItem: order.lines,
      totalAmount: order.totalAmount,
      currencyCode: 'EUR',
      cultureCode: 'fr-FR',
      forceInsert: false,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw new Error(safeMessage(payload?.message || payload?.error?.message, `Contrado a refusé la commande (${response.status}).`));
  }
  const data = unwrap(payload) || payload || {};
  return { referenceId: String(data.referenceId || order.referenceId), status: String(data.status || 'SUBMITTED') };
}
