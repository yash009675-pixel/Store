import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../../context/StoreProvider';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { formatPrice } from '../../lib/format';
import { SmartImage } from '../ui/SmartImage';
import { ButtonLink } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../lib/cn';

/* ==========================================================================
   BAG DRAWER (§30)
   Real quantities, real subtotal. No shipping, tax or discount figures are
   shown here because those are decided by the real checkout — inventing a
   total would be a lie to the shopper.
   ========================================================================== */

export function BagDrawer() {
  const {
    bag,
    bagOpen,
    closeBag,
    bagSubtotal,
    bagCount,
    setQuantity,
    removeFromBag,
  } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(bagOpen);
  useFocusTrap(panelRef, bagOpen, closeBag);

  if (!bagOpen) return null;

  return (
    <div className="fixed inset-0 z-drawer">
      <div
        className="absolute inset-0 bg-ink-900/70 backdrop-blur-[3px] animate-[fade-in_260ms_ease-out_both]"
        onClick={closeBag}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabIndex={-1}
        className="liquid-glass absolute inset-y-0 right-0 flex w-full max-w-[27rem] flex-col animate-[drawer-in-right_400ms_cubic-bezier(0.22,1,0.36,1)_both]"
      >
        <header className="relative z-[2] flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="font-display text-xl text-bone">
            Your bag
            {bagCount > 0 && (
              <span className="ml-2 align-middle text-xs tracking-wide text-bone-dim">
                {bagCount} {bagCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </h2>
          <button type="button" onClick={closeBag} className="icon-btn" aria-label="Close bag">
            <X size={20} />
          </button>
        </header>

        {bag.length === 0 ? (
          <div className="relative z-[2] flex flex-1 items-center justify-center p-4">
            <EmptyState
              compact
              figure={<ShoppingBag size={34} strokeWidth={1} />}
              title="Your bag is empty"
              description="Pieces you add will gather here, ready whenever you are."
              action={{ label: 'Start shopping', to: '/shop' }}
            />
          </div>
        ) : (
          <>
            <ul className="relative z-[2] min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
              {bag.map((line, i) => (
                <BagLineRow
                  key={line.key}
                  line={line}
                  index={i}
                  onQuantity={setQuantity}
                  onRemove={removeFromBag}
                  onNavigate={closeBag}
                />
              ))}
            </ul>

            <footer className="relative z-[2] shrink-0 border-t border-line px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-bone-muted">Subtotal</span>
                <AnimatedPrice value={bagSubtotal} />
              </div>
              <p className="t-meta mt-1.5">
                Shipping and taxes are calculated at checkout.
              </p>
              <div className="mt-4 space-y-2">
                <ButtonLink to="/checkout" variant="primary" block onClick={closeBag}>
                  Checkout
                </ButtonLink>
                <ButtonLink to="/bag" variant="ghost" block onClick={closeBag}>
                  View full bag
                </ButtonLink>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function BagLineRow({
  line,
  index,
  onQuantity,
  onRemove,
  onNavigate,
}: {
  line: import('../../lib/types').BagLine;
  index: number;
  onQuantity: (key: string, q: number) => void;
  onRemove: (key: string) => void;
  onNavigate: () => void;
}) {
  const [leaving, setLeaving] = useState(false);

  const remove = () => {
    setLeaving(true);
    // Let the row collapse before it leaves the list.
    setTimeout(() => onRemove(line.key), 220);
  };

  return (
    <li
      className={cn(
        'grid grid-cols-[4.5rem_1fr] gap-4 border-b border-line py-4 transition-all duration-200 ease-premium',
        leaving && 'pointer-events-none -translate-x-4 opacity-0',
      )}
      style={{
        animation: `fade-rise 380ms cubic-bezier(0.22,1,0.36,1) ${index * 50}ms both`,
      }}
    >
      <Link
        to={`/product/${line.slug}`}
        onClick={onNavigate}
        className="relative aspect-[3/4] overflow-hidden rounded bg-ink-700"
      >
        {line.image ? (
          <SmartImage src={line.image} alt={line.name} objectPosition="center 20%" />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/product/${line.slug}`}
            onClick={onNavigate}
            className="min-w-0 text-sm leading-snug text-bone hover:underline"
          >
            {line.name}
          </Link>
          <button
            type="button"
            onClick={remove}
            aria-label={`Remove ${line.name} from bag`}
            className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-bone-dim transition-colors hover:text-accent"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {(line.size || line.color) && (
          <p className="t-meta mt-1">
            {[line.color, line.size].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="inline-flex items-center rounded-full border border-line">
            <button
              type="button"
              onClick={() => onQuantity(line.key, line.quantity - 1)}
              aria-label={`Decrease quantity of ${line.name}`}
              className="grid h-9 w-9 place-items-center rounded-full text-bone-muted transition-colors hover:text-bone active:scale-90"
            >
              <Minus size={13} />
            </button>
            <span
              aria-live="polite"
              className="min-w-[1.75rem] text-center text-sm tabular-nums text-bone"
            >
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantity(line.key, line.quantity + 1)}
              aria-label={`Increase quantity of ${line.name}`}
              className="grid h-9 w-9 place-items-center rounded-full text-bone-muted transition-colors hover:text-bone active:scale-90"
            >
              <Plus size={13} />
            </button>
          </div>
          <span className="text-sm tabular-nums text-bone">
            {formatPrice(line.price * line.quantity)}
          </span>
        </div>
      </div>
    </li>
  );
}

/** Counts the subtotal up/down so price changes are felt, not just seen. */
function AnimatedPrice({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    if (reduced || from === value) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const duration = 420;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span className="text-lg tabular-nums text-bone">{formatPrice(display)}</span>
  );
}
