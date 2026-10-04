import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { CATEGORY_DEFS } from '../../lib/categories';
import { useCatalog } from '../../context/CatalogProvider';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useStore } from '../../context/StoreProvider';

/* ==========================================================================
   MOBILE NAVIGATION (§13)
   Full-height sheet, staggered entrance, scroll-locked body, 48px+ targets,
   trapped focus, Escape to close. Never causes horizontal overflow.
   ========================================================================== */

const PRIMARY = [
  { label: 'Home', to: '/' },
  { label: 'All products', to: '/shop' },
  { label: 'About', to: '/about' },
  { label: 'Support', to: '/support' },
];

const SECONDARY = [
  { label: 'Your account', to: '/account' },
  { label: 'Orders', to: '/account/orders' },
  { label: 'Wishlist', to: '/account/wishlist' },
];

export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [catsOpen, setCatsOpen] = useState(false);
  const { categories } = useCatalog();
  const { wishlistCount } = useStore();

  useBodyScrollLock(open);
  useFocusTrap(panelRef, open, onClose);

  if (!open) return null;

  const liveLookup = new Map(categories.map((c) => [c.slug, c]));
  let step = 0;
  const nextDelay = () => `${60 + step++ * 45}ms`;

  return createPortal(
    <div className="fixed inset-0 z-drawer lg:hidden">
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm animate-[fade-in_240ms_ease-out_both]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        tabIndex={-1}
        className="liquid-glass absolute inset-y-0 right-0 flex w-full max-w-sm flex-col animate-[drawer-in-right_380ms_cubic-bezier(0.22,1,0.36,1)_both]"
      >
        <div className="relative z-[2] flex h-[var(--header-h)] shrink-0 items-center justify-between px-5">
          <span className="font-display text-xl text-bone">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav
          className="relative z-[2] flex-1 overflow-y-auto overscroll-contain px-5 pb-[calc(2rem+env(safe-area-inset-bottom))]"
          aria-label="Mobile"
        >
          <ul className="border-t border-line">
            {PRIMARY.map((item) => (
              <li
                key={item.to}
                className="anim-rise border-b border-line"
                style={{ animationDelay: nextDelay() }}
              >
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex min-h-[56px] items-center font-display text-2xl text-bone transition-opacity active:opacity-60"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Categories collapse inline rather than opening a second screen */}
            <li
              className="anim-rise border-b border-line"
              style={{ animationDelay: nextDelay() }}
            >
              <button
                type="button"
                onClick={() => setCatsOpen((v) => !v)}
                aria-expanded={catsOpen}
                className="flex min-h-[56px] w-full items-center justify-between gap-3 text-left font-display text-2xl text-bone"
              >
                Categories
                <ChevronDown
                  size={18}
                  className={cn(
                    'shrink-0 text-bone-dim transition-transform duration-[var(--motion-normal)] ease-premium',
                    catsOpen && 'rotate-180',
                  )}
                />
              </button>

              <div
                className="grid transition-[grid-template-rows,opacity] duration-[var(--motion-normal)] ease-premium"
                style={{
                  gridTemplateRows: catsOpen ? '1fr' : '0fr',
                  opacity: catsOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <ul className="pb-4 pl-1">
                    {CATEGORY_DEFS.map((def, i) => (
                      <li key={def.slug}>
                        <Link
                          to={`/category/${def.slug}`}
                          onClick={onClose}
                          className="flex min-h-[46px] items-center justify-between gap-3 text-[0.9375rem] text-bone-muted transition-colors active:text-bone"
                          style={
                            catsOpen
                              ? {
                                  animation: `fade-rise 420ms cubic-bezier(0.22,1,0.36,1) ${i * 30}ms both`,
                                }
                              : undefined
                          }
                        >
                          {def.name}
                          {liveLookup.get(def.slug)?.live && (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                              aria-label="Available now"
                            />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          </ul>

          <ul className="mt-8 space-y-1">
            {SECONDARY.map((item) => (
              <li
                key={item.to}
                className="anim-rise"
                style={{ animationDelay: nextDelay() }}
              >
                <Link
                  to={item.to}
                  onClick={onClose}
                  className="flex min-h-[44px] items-center justify-between text-sm text-bone-muted transition-colors active:text-bone"
                >
                  {item.label}
                  {item.to === '/account/wishlist' && wishlistCount > 0 && (
                    <span className="text-xs text-bone-dim">{wishlistCount}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <p
            className="anim-rise t-eyebrow mt-10"
            style={{ animationDelay: nextDelay() }}
          >
            Style that feels like you
          </p>
        </nav>
      </div>
    </div>,
    document.body,
  );
}
