/* ==========================================================================
   APNA STORE — DOMAIN TYPES
   These mirror the real commerce schema. Nothing here fabricates data; the
   catalog layer only ever returns what the configured backend actually has.
   ========================================================================== */

export type ID = string;

export interface ProductImage {
  url: string;
  alt: string;
  /** Lets fashion crops keep faces and hems in frame (§87). */
  objectPosition?: string;
}

export interface ProductVariantOption {
  /** e.g. "M", "41", "Free Size" */
  value: string;
  available: boolean;
}

export interface ProductColor {
  name: string;
  /** CSS colour used only for the swatch dot. */
  swatch: string;
  available: boolean;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  /** Minor units avoided deliberately — store rupees as a number. */
  price: number;
  /** Original price when a genuine markdown exists. Never synthesised. */
  compareAtPrice?: number | null;
  currency: 'INR';
  categorySlug: string;
  images: ProductImage[];
  description?: string;
  /** Size axis differs per product type (§27) — never forced. */
  sizeLabel?: string;
  sizes?: ProductVariantOption[];
  colors?: ProductColor[];
  /** null = the backend does not track stock for this item. */
  inStock: boolean | null;
  /** Real aggregates only. undefined = not rated yet. */
  ratingAverage?: number;
  ratingCount?: number;
  createdAt?: string;
}

export interface Review {
  id: ID;
  productId: ID;
  authorName: string;
  rating: number;
  title?: string;
  body?: string;
  createdAt: string;
}

export interface Category {
  slug: string;
  name: string;
  /** Short editorial line shown on the tile. */
  blurb: string;
  image: string;
  objectPosition?: string;
  /**
   * Whether the category is actually live. Resolved from real inventory —
   * a category with no products renders the Coming Soon state (§38),
   * never "no products match".
   */
  live: boolean;
  productCount: number;
}

/* ---- Bag & wishlist (client-owned until a backend session exists) ---- */

export interface BagLine {
  key: string;
  productId: ID;
  slug: string;
  name: string;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface WishlistEntry {
  productId: ID;
  slug: string;
  name: string;
  price: number;
  image?: string;
  addedAt: number;
}

/* ---- Data-layer envelope ---------------------------------------------- */

/**
 * Every read returns this. `source` makes it explicit on screen whether the
 * numbers came from a real backend or whether no backend is connected yet,
 * so the UI can tell the truth instead of inventing a catalogue.
 */
export interface DataResult<T> {
  data: T;
  status: 'loading' | 'ready' | 'error' | 'not-configured';
  error?: string;
  source: 'backend' | 'none';
}

export type SortKey =
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating';

export interface ShopFilters {
  query: string;
  categories: string[];
  sizes: string[];
  maxPrice: number | null;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sort: SortKey;
}

export const EMPTY_FILTERS: ShopFilters = {
  query: '',
  categories: [],
  sizes: [],
  maxPrice: null,
  inStockOnly: false,
  onSaleOnly: false,
  sort: 'featured',
};
