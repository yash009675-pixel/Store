import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { useCatalog } from '../context/CatalogProvider';
import { availableSizes, priceRange } from '../lib/catalog';
import { CATEGORY_DEFS } from '../lib/categories';
import { EMPTY_FILTERS, type ShopFilters, type SortKey } from '../lib/types';
import { formatPrice } from '../lib/format';
import { ProductCard } from '../components/commerce/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { BackendNotConnected, ErrorState } from '../components/ui/StateViews';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/Overlay';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useIsDesktop } from '../hooks/useMotionPrefs';
import { setMeta } from '../lib/meta';

/* ==========================================================================
   SHOP (§35, §36, §57)
   Filters derive their options from the real catalogue — sizes that no
   product has are never offered. Grid changes fade/stagger rather than
   snapping, and the result count is announced to screen readers.
   ========================================================================== */

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

export default function Shop() {
  const { products, status, error, refresh } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<ShopFilters>(() => ({
    ...EMPTY_FILTERS,
    query: params.get('q') ?? '',
    categories: params.get('category') ? [params.get('category') as string] : [],
  }));
  const [sheetOpen, setSheetOpen] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    setMeta({
      title: 'All products — Apna Store',
      description:
        'Browse the full Apna Store collection: clothing, ethnic wear, footwear and accessories.',
    });
  }, []);

  // Keep ?q= in the URL so searches are shareable and survive a refresh.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (filters.query) next.set('q', filters.query);
    else next.delete('q');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.query]);

  const sizeOptions = useMemo(() => availableSizes(products), [products]);
  const range = useMemo(() => priceRange(products), [products]);

  const visible = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.categorySlug.includes(q))
        return false;
      if (filters.categories.length && !filters.categories.includes(p.categorySlug))
        return false;
      if (filters.sizes.length) {
        const has = (p.sizes ?? []).some((s) => filters.sizes.includes(s.value));
        if (!has) return false;
      }
      if (filters.maxPrice !== null && p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && p.inStock === false) return false;
      if (filters.onSaleOnly && !(p.compareAtPrice && p.compareAtPrice > p.price))
        return false;
      return true;
    });

    list = [...list];
    switch (filters.sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0));
        break;
      case 'newest':
        list.sort((a, b) =>
          (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
        );
        break;
      default:
        break;
    }
    return list;
  }, [products, filters]);

  const activeCount =
    filters.categories.length +
    filters.sizes.length +
    (filters.maxPrice !== null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSaleOnly ? 1 : 0);

  useScrollReveal([status, visible.length, filters.sort]);

  const panel = (
    <FilterPanel
      filters={filters}
      setFilters={setFilters}
      sizeOptions={sizeOptions}
      range={range}
      activeCount={activeCount}
    />
  );

  return (
    <main id="main" className="bg-ink-800 pt-[var(--header-h)]">
      {/* ---- Page head ---- */}
      <header className="shell-wide border-b border-line py-12 sm:py-16">
        <p className="anim-fade t-eyebrow mb-4">Collection</p>
        <h1 className="t-h1 text-bone">
          <span className="line-mask inline-block">
            <span style={{ animationDelay: '120ms' }}>All products</span>
          </span>
        </h1>
        {status === 'ready' && (
          <p className="anim-rise t-body mt-4" style={{ animationDelay: '320ms' }}>
            {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}
            {activeCount > 0 ? ' matching your filters' : ' available'}
          </p>
        )}
      </header>

      <div className="shell-wide grid gap-10 py-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14 lg:py-14">
        {/* ---- Desktop sticky filters (§66) ---- */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100vh-var(--header-h)-3rem)] overflow-y-auto pr-2">
            {panel}
          </div>
        </aside>

        <div>
          {/* ---- Toolbar ---- */}
          <div className="mb-8 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal size={14} aria-hidden="true" />
              Filters
              {activeCount > 0 && (
                <span className="ml-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-bone px-1 text-[0.625rem] font-semibold text-ink-900">
                  {activeCount}
                </span>
              )}
            </Button>

            <label className="ml-auto flex items-center gap-2 text-xs text-bone-dim">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, sort: e.target.value as SortKey }))
                }
                className="field h-10 min-h-0 w-auto cursor-pointer py-0 pr-8 text-xs"
                aria-label="Sort products"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-ink-700">
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* ---- Results ---- */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {status === 'ready' && `${visible.length} products found`}
          </div>

          {status === 'loading' && <ProductGridSkeleton count={9} />}

          {status === 'error' && (
            <ErrorState
              title="We couldn’t load the collection"
              message={error}
              onRetry={refresh}
            />
          )}

          {status === 'not-configured' && <BackendNotConnected what="Products" />}

          {status === 'ready' && visible.length === 0 && products.length > 0 && (
            <EmptyState
              figure="—"
              title="No products match those filters"
              description="Try widening your selection, or clear the filters to see everything."
            >
              <Button
                variant="outline"
                onClick={() => setFilters({ ...EMPTY_FILTERS })}
              >
                Clear all filters
              </Button>
            </EmptyState>
          )}

          {status === 'ready' && products.length === 0 && (
            <EmptyState
              figure="—"
              title="Nothing listed yet"
              description="The collection is being prepared. Please check back shortly."
              action={{ label: 'Back to home', to: '/' }}
            />
          )}

          {visible.length > 0 && (
            <div
              /* key forces a clean re-stagger whenever the result set changes */
              key={`${filters.sort}-${visible.length}-${activeCount}`}
              className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 xl:grid-cols-3"
            >
              {visible.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  priority={i < 4}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- Mobile filter sheet (§67) ---- */}
      {!isDesktop && (
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          label="Filter products"
        >
          <div className="flex items-center justify-between border-b border-line px-5 pb-3">
            <h2 className="font-display text-xl text-bone">Filters</h2>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="icon-btn"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{panel}</div>
          <div className="shrink-0 border-t border-line p-4">
            <Button block onClick={() => setSheetOpen(false)}>
              Show {visible.length} {visible.length === 1 ? 'result' : 'results'}
            </Button>
          </div>
        </BottomSheet>
      )}
    </main>
  );
}

/* ---------------------------------------------------------- filters ---- */

function FilterPanel({
  filters,
  setFilters,
  sizeOptions,
  range,
  activeCount,
}: {
  filters: ShopFilters;
  setFilters: React.Dispatch<React.SetStateAction<ShopFilters>>;
  sizeOptions: string[];
  range: [number, number] | null;
  activeCount: number;
}) {
  const toggle = (key: 'categories' | 'sizes', value: string) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value],
    }));

  return (
    <div className="space-y-8">
      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => setFilters({ ...EMPTY_FILTERS })}
          className="link-underline text-xs text-bone-muted hover:text-bone"
        >
          Clear all ({activeCount})
        </button>
      )}

      <FilterGroup title="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_DEFS.map((c) => (
            <button
              key={c.slug}
              type="button"
              className="chip"
              data-selected={filters.categories.includes(c.slug)}
              aria-pressed={filters.categories.includes(c.slug)}
              onClick={() => toggle('categories', c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Only rendered when real products actually carry sizes (§27) */}
      {sizeOptions.length > 0 && (
        <FilterGroup title="Size">
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((s) => (
              <button
                key={s}
                type="button"
                className="chip min-w-[3rem] justify-center"
                data-selected={filters.sizes.includes(s)}
                aria-pressed={filters.sizes.includes(s)}
                onClick={() => toggle('sizes', s)}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {range && range[0] !== range[1] && (
        <FilterGroup title="Max price">
          <input
            type="range"
            min={range[0]}
            max={range[1]}
            step={Math.max(1, Math.round((range[1] - range[0]) / 50))}
            value={filters.maxPrice ?? range[1]}
            onChange={(e) =>
              setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))
            }
            className="w-full accent-[var(--as-accent)]"
            aria-label="Maximum price"
          />
          <p className="t-meta mt-2 tabular-nums">
            Up to {formatPrice(filters.maxPrice ?? range[1])}
          </p>
        </FilterGroup>
      )}

      <FilterGroup title="Availability">
        <div className="space-y-3">
          <Check
            label="In stock only"
            checked={filters.inStockOnly}
            onChange={(v) => setFilters((f) => ({ ...f, inStockOnly: v }))}
          />
          <Check
            label="On sale"
            checked={filters.onSaleOnly}
            onChange={(v) => setFilters((f) => ({ ...f, onSaleOnly: v }))}
          />
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="t-eyebrow mb-3.5">{title}</h3>
      {children}
    </section>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-bone-muted transition-colors hover:text-bone">
      <span
        className={cn(
          'grid h-[18px] w-[18px] shrink-0 place-items-center rounded border transition-all duration-[var(--motion-fast)]',
          checked ? 'border-bone bg-bone' : 'border-line-strong',
        )}
      >
        {checked && (
          <svg viewBox="0 0 10 8" className="h-2 w-2.5 fill-none stroke-ink-900" strokeWidth={2}>
            <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  );
}
