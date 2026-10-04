import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreProvider';
import { useToast } from '../context/ToastProvider';
import { formatPrice } from '../lib/format';
import { SmartImage } from '../components/ui/SmartImage';
import { ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { setMeta } from '../lib/meta';

/* ==========================================================================
   BAG PAGE (§30)
   Subtotal is the only money figure shown. Shipping, tax and any discount
   are determined by the real checkout — printing an estimate here would be
   inventing a number.
   ========================================================================== */

export default function Bag() {
  const { bag, bagSubtotal, bagCount, setQuantity, removeFromBag } = useStore();
  const { toast } = useToast();
  useScrollReveal([bag.length]);

  useEffect(() => {
    setMeta({ title: 'Your bag — Apna Store' });
  }, []);

  return (
    <main id="main" className="bg-ink-800 pt-[var(--header-h)]">
      <header className="shell-wide border-b border-line py-12 sm:py-16">
        <p className="anim-fade t-eyebrow mb-4">Checkout</p>
        <h1 className="t-h1 text-bone">
          <span className="line-mask inline-block">
            <span style={{ animationDelay: '120ms' }}>Your bag</span>
          </span>
        </h1>
        {bagCount > 0 && (
          <p className="anim-rise t-body mt-4" style={{ animationDelay: '300ms' }}>
            {bagCount} {bagCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </header>

      <div className="shell-wide section-y">
        {bag.length === 0 ? (
          <EmptyState
            figure={<ShoppingBag size={40} strokeWidth={0.9} />}
            title="Your bag is empty"
            description="Nothing here yet. Pieces you add will be saved for whenever you’re ready."
            action={{ label: 'Start shopping', to: '/shop' }}
            secondaryAction={{ label: 'View wishlist', to: '/account/wishlist' }}
          />
        ) : (
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
            {/* ---- Lines ---- */}
            <ul className="border-t border-line">
              {bag.map((line, i) => (
                <li
                  key={line.key}
                  data-reveal="rise"
                  style={{ ['--reveal-delay' as string]: `${i * 60}ms` }}
                  className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-line py-6 sm:grid-cols-[7rem_1fr] sm:gap-6"
                >
                  <Link
                    to={`/product/${line.slug}`}
                    className="relative aspect-[3/4] overflow-hidden rounded-lg bg-ink-700"
                  >
                    {line.image && (
                      <SmartImage
                        src={line.image}
                        alt={line.name}
                        objectPosition="center 20%"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-[0.9375rem] leading-snug text-bone">
                          <Link to={`/product/${line.slug}`} className="hover:underline">
                            {line.name}
                          </Link>
                        </h2>
                        {(line.size || line.color) && (
                          <p className="t-meta mt-1">
                            {[line.color, line.size].filter(Boolean).join(' · ')}
                          </p>
                        )}
                        <p className="t-meta mt-1 tabular-nums">
                          {formatPrice(line.price)} each
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          removeFromBag(line.key);
                          toast('Removed from bag', {
                            tone: 'info',
                            detail: line.name,
                          });
                        }}
                        aria-label={`Remove ${line.name}`}
                        className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-bone-dim transition-colors hover:text-accent"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <div className="inline-flex items-center rounded-full border border-line">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.key, line.quantity - 1)}
                          className="grid h-10 w-10 place-items-center rounded-full text-bone-muted transition-colors hover:text-bone active:scale-90"
                          aria-label={`Decrease quantity of ${line.name}`}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm tabular-nums text-bone">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                          className="grid h-10 w-10 place-items-center rounded-full text-bone-muted transition-colors hover:text-bone active:scale-90"
                          aria-label={`Increase quantity of ${line.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <span className="tabular-nums text-bone">
                        {formatPrice(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* ---- Summary (§66 sticky) ---- */}
            <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
              <div className="surface rounded-xl p-6">
                <h2 className="t-eyebrow mb-5">Summary</h2>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-bone-muted">
                      Subtotal ({bagCount} {bagCount === 1 ? 'item' : 'items'})
                    </dt>
                    <dd className="tabular-nums text-bone">
                      {formatPrice(bagSubtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-bone-muted">Shipping</dt>
                    <dd className="text-bone-dim">Calculated at checkout</dd>
                  </div>
                </dl>

                <div className="mt-5 flex items-baseline justify-between border-t border-line pt-5">
                  <span className="text-sm text-bone">Total so far</span>
                  <span className="text-xl tabular-nums text-bone">
                    {formatPrice(bagSubtotal)}
                  </span>
                </div>

                <ButtonLink to="/checkout" block size="lg" className="mt-6">
                  Checkout
                </ButtonLink>

                <Link
                  to="/shop"
                  className="link-underline mt-4 block text-center text-sm text-bone-muted hover:text-bone"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
