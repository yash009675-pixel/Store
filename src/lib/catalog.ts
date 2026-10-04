import { getSupabase, isBackendConfigured } from './supabase';
import { CATEGORY_DEFS } from './categories';
import type {
  Category,
  DataResult,
  Product,
  ProductImage,
  Review,
} from './types';

/* ==========================================================================
   CATALOG DATA ACCESS
   --------------------------------------------------------------------------
   Single rule: this module never invents a product, price, rating, review or
   stock level. If no backend is connected it returns an empty set tagged
   `not-configured`, and the UI renders an honest state (§44, §62, §111).
   ========================================================================== */

const PRODUCT_TABLE = 'products';
const REVIEW_TABLE = 'reviews';

function emptyResult<T>(data: T): DataResult<T> {
  return {
    data,
    status: isBackendConfigured ? 'ready' : 'not-configured',
    source: 'none',
  };
}

/** Tolerant row → Product mapping; works across reasonable column namings. */
function mapProduct(row: Record<string, unknown>): Product | null {
  const id = (row.id ?? row.product_id) as string | undefined;
  const name = (row.name ?? row.title ?? row.product_name) as string | undefined;
  if (!id || !name) return null;

  const rawPrice = row.price ?? row.selling_price ?? row.amount;
  const price = typeof rawPrice === 'string' ? Number(rawPrice) : (rawPrice as number);
  if (typeof price !== 'number' || Number.isNaN(price)) return null;

  const rawCompare = row.compare_at_price ?? row.mrp ?? row.original_price;
  const compareAtPrice =
    rawCompare == null ? null : Number(rawCompare) || null;

  // Images may arrive as a text[], a jsonb array, or a single url column.
  const images: ProductImage[] = [];
  const rawImages = row.images ?? row.image_urls ?? row.gallery;
  if (Array.isArray(rawImages)) {
    for (const item of rawImages) {
      if (typeof item === 'string') {
        images.push({ url: item, alt: name });
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const url = (obj.url ?? obj.src ?? obj.path) as string | undefined;
        if (url) {
          images.push({
            url,
            alt: (obj.alt as string) ?? name,
            objectPosition: obj.object_position as string | undefined,
          });
        }
      }
    }
  }
  const single = (row.image_url ?? row.image ?? row.thumbnail) as string | undefined;
  if (!images.length && single) images.push({ url: single, alt: name });

  const sizesRaw = row.sizes ?? row.available_sizes;
  const sizes = Array.isArray(sizesRaw)
    ? sizesRaw
        .map((s) =>
          typeof s === 'string'
            ? { value: s, available: true }
            : s && typeof s === 'object'
              ? {
                  value: String((s as Record<string, unknown>).value ?? ''),
                  available:
                    (s as Record<string, unknown>).available !== false,
                }
              : null,
        )
        .filter((s): s is { value: string; available: boolean } => !!s?.value)
    : undefined;

  const colorsRaw = row.colors ?? row.available_colors;
  const colors = Array.isArray(colorsRaw)
    ? colorsRaw
        .map((c) => {
          if (typeof c === 'string') {
            return { name: c, swatch: c.toLowerCase(), available: true };
          }
          if (c && typeof c === 'object') {
            const obj = c as Record<string, unknown>;
            const cname = String(obj.name ?? '');
            if (!cname) return null;
            return {
              name: cname,
              swatch: String(obj.swatch ?? obj.hex ?? cname.toLowerCase()),
              available: obj.available !== false,
            };
          }
          return null;
        })
        .filter(
          (c): c is { name: string; swatch: string; available: boolean } => !!c,
        )
    : undefined;

  const stockRaw = row.in_stock ?? row.available ?? row.stock ?? row.quantity;
  let inStock: boolean | null = null;
  if (typeof stockRaw === 'boolean') inStock = stockRaw;
  else if (typeof stockRaw === 'number') inStock = stockRaw > 0;

  const ratingAvg = row.rating_average ?? row.rating ?? row.average_rating;
  const ratingCnt = row.rating_count ?? row.review_count ?? row.reviews_count;

  return {
    id: String(id),
    slug: String(row.slug ?? row.handle ?? id),
    name,
    price,
    compareAtPrice,
    currency: 'INR',
    categorySlug: String(row.category_slug ?? row.category ?? ''),
    images,
    description: (row.description ?? row.details) as string | undefined,
    sizeLabel: (row.size_label as string) ?? undefined,
    sizes: sizes?.length ? sizes : undefined,
    colors: colors?.length ? colors : undefined,
    inStock,
    ratingAverage:
      typeof ratingAvg === 'number' && ratingAvg > 0 ? ratingAvg : undefined,
    ratingCount:
      typeof ratingCnt === 'number' && ratingCnt > 0 ? ratingCnt : undefined,
    createdAt: (row.created_at as string) ?? undefined,
  };
}

/* ---------------------------------------------------------------- reads -- */

export async function fetchProducts(): Promise<DataResult<Product[]>> {
  const sbPromise = getSupabase();
  if (!sbPromise) return emptyResult<Product[]>([]);

  try {
    const sb = await sbPromise;
    const { data, error } = await sb
      .from(PRODUCT_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        data: [],
        status: 'error',
        error: error.message,
        source: 'backend',
      };
    }

    const products = (data ?? [])
      .map((row) => mapProduct(row as Record<string, unknown>))
      .filter((p): p is Product => p !== null);

    return { data: products, status: 'ready', source: 'backend' };
  } catch (err) {
    return {
      data: [],
      status: 'error',
      error: err instanceof Error ? err.message : 'Could not reach the store.',
      source: 'backend',
    };
  }
}

export async function fetchProductBySlug(
  slug: string,
): Promise<DataResult<Product | null>> {
  const sbPromise = getSupabase();
  if (!sbPromise) return emptyResult<Product | null>(null);

  try {
    const sb = await sbPromise;
    const { data, error } = await sb
      .from(PRODUCT_TABLE)
      .select('*')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        data: null,
        status: 'error',
        error: error.message,
        source: 'backend',
      };
    }
    return {
      data: data ? mapProduct(data as Record<string, unknown>) : null,
      status: 'ready',
      source: 'backend',
    };
  } catch (err) {
    return {
      data: null,
      status: 'error',
      error: err instanceof Error ? err.message : 'Could not reach the store.',
      source: 'backend',
    };
  }
}

export async function fetchReviews(
  productId: string,
): Promise<DataResult<Review[]>> {
  const sbPromise = getSupabase();
  if (!sbPromise) return emptyResult<Review[]>([]);

  try {
    const sb = await sbPromise;
    const { data, error } = await sb
      .from(REVIEW_TABLE)
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      // A missing reviews table is not a user-facing failure — it simply
      // means this store has no reviews yet.
      return { data: [], status: 'ready', source: 'backend' };
    }

    const reviews: Review[] = (data ?? []).map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        productId,
        authorName: String(r.author_name ?? r.name ?? 'Verified buyer'),
        rating: Number(r.rating ?? 0),
        title: (r.title as string) ?? undefined,
        body: (r.body ?? r.comment ?? r.review) as string | undefined,
        createdAt: String(r.created_at ?? ''),
      };
    });

    return { data: reviews, status: 'ready', source: 'backend' };
  } catch {
    return { data: [], status: 'ready', source: 'backend' };
  }
}

/* -------------------------------------------------------- derived views -- */

/**
 * Merges the brand taxonomy with real inventory. A category is "live" only
 * when actual products exist in it — everything else renders Coming Soon
 * rather than a misleading "no products match" (§38).
 */
export function resolveCategories(products: Product[]): Category[] {
  return CATEGORY_DEFS.map((def) => {
    const count = products.filter(
      (p) => p.categorySlug === def.slug,
    ).length;
    return {
      slug: def.slug,
      name: def.name,
      blurb: def.blurb,
      image: def.image ?? '',
      objectPosition: def.objectPosition,
      live: count > 0,
      productCount: count,
    };
  });
}

export function relatedProducts(
  all: Product[],
  current: Product,
  limit = 4,
): Product[] {
  return all
    .filter((p) => p.id !== current.id && p.categorySlug === current.categorySlug)
    .slice(0, limit);
}

/** Size options actually present across the given products (§27, §35). */
export function availableSizes(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    for (const s of p.sizes ?? []) set.add(s.value);
  }
  return Array.from(set);
}

export function priceRange(products: Product[]): [number, number] | null {
  if (!products.length) return null;
  let min = Infinity;
  let max = 0;
  for (const p of products) {
    if (p.price < min) min = p.price;
    if (p.price > max) max = p.price;
  }
  return [Math.floor(min), Math.ceil(max)];
}
