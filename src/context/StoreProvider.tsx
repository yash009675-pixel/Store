import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { BagLine, Product, WishlistEntry } from '../lib/types';

/* ==========================================================================
   BAG + WISHLIST
   These are the shopper's own selections, persisted locally so a refresh
   doesn't lose them. They are never pre-seeded with sample items — an
   untouched bag is genuinely empty (§30, §44).
   When a backend session exists this is the layer that syncs to it.
   ========================================================================== */

const BAG_KEY = 'apnastore.bag.v1';
const WISH_KEY = 'apnastore.wishlist.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage can be unavailable in private mode — fail silently */
  }
}

function lineKey(productId: string, size?: string, color?: string) {
  return [productId, size ?? '', color ?? ''].join('::');
}

interface StoreContextValue {
  bag: BagLine[];
  bagCount: number;
  bagSubtotal: number;
  addToBag: (
    product: Product,
    opts?: { size?: string; color?: string; quantity?: number },
  ) => void;
  removeFromBag: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearBag: () => void;

  wishlist: WishlistEntry[];
  wishlistCount: number;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => boolean;
  removeFromWishlist: (productId: string) => void;

  bagOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [bag, setBag] = useState<BagLine[]>(() => read<BagLine[]>(BAG_KEY, []));
  const [wishlist, setWishlist] = useState<WishlistEntry[]>(() =>
    read<WishlistEntry[]>(WISH_KEY, []),
  );
  const [bagOpen, setBagOpen] = useState(false);

  useEffect(() => write(BAG_KEY, bag), [bag]);
  useEffect(() => write(WISH_KEY, wishlist), [wishlist]);

  const addToBag = useCallback<StoreContextValue['addToBag']>(
    (product, opts) => {
      const size = opts?.size;
      const color = opts?.color;
      const qty = Math.max(1, opts?.quantity ?? 1);
      const key = lineKey(product.id, size, color);

      setBag((lines) => {
        const existing = lines.find((l) => l.key === key);
        if (existing) {
          return lines.map((l) =>
            l.key === key
              ? { ...l, quantity: Math.min(l.quantity + qty, 99) }
              : l,
          );
        }
        return [
          ...lines,
          {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url,
            size,
            color,
            quantity: qty,
          },
        ];
      });
    },
    [],
  );

  const removeFromBag = useCallback((key: string) => {
    setBag((lines) => lines.filter((l) => l.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setBag((lines) =>
      quantity <= 0
        ? lines.filter((l) => l.key !== key)
        : lines.map((l) =>
            l.key === key ? { ...l, quantity: Math.min(quantity, 99) } : l,
          ),
    );
  }, []);

  const clearBag = useCallback(() => setBag([]), []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.some((w) => w.productId === productId),
    [wishlist],
  );

  /** Returns true when the item was added, so callers can word their toast. */
  const toggleWishlist = useCallback(
    (product: Product) => {
      const exists = wishlist.some((w) => w.productId === product.id);
      setWishlist((list) =>
        exists
          ? list.filter((w) => w.productId !== product.id)
          : [
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0]?.url,
                addedAt: Date.now(),
              },
              ...list,
            ],
      );
      return !exists;
    },
    [wishlist],
  );

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((list) => list.filter((w) => w.productId !== productId));
  }, []);

  const bagCount = useMemo(
    () => bag.reduce((n, l) => n + l.quantity, 0),
    [bag],
  );
  const bagSubtotal = useMemo(
    () => bag.reduce((n, l) => n + l.price * l.quantity, 0),
    [bag],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      bag,
      bagCount,
      bagSubtotal,
      addToBag,
      removeFromBag,
      setQuantity,
      clearBag,
      wishlist,
      wishlistCount: wishlist.length,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      bagOpen,
      openBag: () => setBagOpen(true),
      closeBag: () => setBagOpen(false),
    }),
    [
      bag,
      bagCount,
      bagSubtotal,
      addToBag,
      removeFromBag,
      setQuantity,
      clearBag,
      wishlist,
      isWishlisted,
      toggleWishlist,
      removeFromWishlist,
      bagOpen,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
