import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchProducts, resolveCategories } from '../lib/catalog';
import { isBackendConfigured } from '../lib/supabase';
import type { Category, Product } from '../lib/types';

/* ==========================================================================
   CATALOG CONTEXT
   Fetched once, shared by every page, re-fetchable on error.
   `status` is surfaced to the UI so each screen can render loading / empty /
   error / not-configured honestly instead of guessing.
   ========================================================================== */

interface CatalogContextValue {
  products: Product[];
  categories: Category[];
  status: 'loading' | 'ready' | 'error' | 'not-configured';
  error?: string;
  backendConfigured: boolean;
  refresh: () => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside <CatalogProvider>');
  return ctx;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] =
    useState<CatalogContextValue['status']>(
      isBackendConfigured ? 'loading' : 'not-configured',
    );
  const [error, setError] = useState<string | undefined>();
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!isBackendConfigured) {
      setStatus('not-configured');
      setProducts([]);
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(undefined);

    fetchProducts().then((result) => {
      if (cancelled) return;
      setProducts(result.data);
      setStatus(result.status);
      setError(result.error);
    });

    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const categories = useMemo(() => resolveCategories(products), [products]);

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      categories,
      status,
      error,
      backendConfigured: isBackendConfigured,
      refresh,
    }),
    [products, categories, status, error, refresh],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}
