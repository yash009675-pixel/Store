import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Search, X } from 'lucide-react';
import { useCatalog } from '../../context/CatalogProvider';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { formatPrice } from '../../lib/format';
import { SmartImage } from '../ui/SmartImage';
import { CATEGORY_DEFS } from '../../lib/categories';

/* ==========================================================================
   SEARCH (§37)
   Suggestions are derived strictly from the real catalogue. With no backend
   connected there are no products to suggest, and the overlay says exactly
   that instead of showing invented results.
   ========================================================================== */

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { products, status } = useCatalog();

  useBodyScrollLock(open);
  useFocusTrap(panelRef, open, onClose);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    setQuery('');
    setDebounced('');
  }, [open]);

  // Debounce keeps the result list from thrashing on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 160);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (!debounced) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(debounced) ||
          p.categorySlug.toLowerCase().includes(debounced),
      )
      .slice(0, 8);
  }, [products, debounced]);

  if (!open) return null;

  const searching = status === 'loading';
  const hasQuery = debounced.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return createPortal(
    <div className="fixed inset-0 z-modal flex flex-col">
      <div
        className="absolute inset-0 bg-ink-900/85 backdrop-blur-md animate-[fade-in_240ms_ease-out_both]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search Apna Store"
        tabIndex={-1}
        className="relative mx-auto flex max-h-full w-full max-w-3xl flex-col px-4 pt-4 sm:px-6 sm:pt-16"
      >
        <form
          onSubmit={submit}
          role="search"
          className="liquid-glass flex shrink-0 items-center gap-3 rounded-full px-5 animate-[fade-rise_320ms_cubic-bezier(0.22,1,0.36,1)_both]"
        >
          <Search size={18} className="relative z-[2] shrink-0 text-bone-dim" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a product or category"
            aria-label="Search for a product or category"
            className="relative z-[2] h-14 min-w-0 flex-1 bg-transparent text-base text-bone outline-none placeholder:text-bone-dim"
          />
          {searching && hasQuery && (
            <Loader2 size={16} className="spin relative z-[2] text-bone-dim" />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="icon-btn relative z-[2] -mr-2 shrink-0"
          >
            <X size={18} />
          </button>
        </form>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8">
          {!hasQuery && (
            <div className="animate-[fade-in_320ms_ease-out_both] px-2 py-6">
              <p className="t-eyebrow mb-4">Browse categories</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_DEFS.map((def) => (
                  <Link
                    key={def.slug}
                    to={`/category/${def.slug}`}
                    onClick={onClose}
                    className="chip"
                  >
                    {def.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {hasQuery && results.length > 0 && (
            <ul className="liquid-glass overflow-hidden rounded-2xl animate-[fade-rise_300ms_cubic-bezier(0.22,1,0.36,1)_both]">
              {results.map((p, i) => (
                <li key={p.id} className="relative z-[2]">
                  <Link
                    to={`/product/${p.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-bone/5"
                    style={{
                      animation: `fade-rise 340ms cubic-bezier(0.22,1,0.36,1) ${i * 35}ms both`,
                    }}
                  >
                    <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-ink-700">
                      {p.images[0] && (
                        <SmartImage
                          src={p.images[0].url}
                          alt=""
                          objectPosition={p.images[0].objectPosition}
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-bone">{p.name}</span>
                      <span className="mt-0.5 block text-xs text-bone-dim">
                        {formatPrice(p.price)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {hasQuery && !searching && results.length === 0 && (
            <div className="animate-[fade-in_320ms_ease-out_both] px-4 py-14 text-center">
              <p className="font-display text-2xl text-bone">
                Nothing matches “{query.trim()}”
              </p>
              <p className="t-body mx-auto mt-3 max-w-prose2">
                {status === 'not-configured'
                  ? 'The product catalogue isn’t connected in this environment, so there is nothing to search yet.'
                  : 'Try a different word, or browse the categories instead.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
