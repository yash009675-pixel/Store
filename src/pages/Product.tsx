import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Share2, Truck } from 'lucide-react';
import { cn } from '../lib/cn';
import { useCatalog } from '../context/CatalogProvider';
import { useStore } from '../context/StoreProvider';
import { useToast } from '../context/ToastProvider';
import { fetchProductBySlug, fetchReviews, relatedProducts } from '../lib/catalog';
import { categoryName } from '../lib/categories';
import { discountPercent, formatDate, formatPrice } from '../lib/format';
import type { Product as ProductType, Review } from '../lib/types';
import { ProductGallery } from '../components/commerce/ProductGallery';
import { ProductCard } from '../components/commerce/ProductCard';
import { WishlistButton } from '../components/commerce/WishlistButton';
import { Button } from '../components/ui/Button';
import { Accordion, AccordionItem } from '../components/ui/Accordion';
import { ErrorState } from '../components/ui/StateViews';
import { Skeleton } from '../components/ui/Skeleton';
import { Reveal } from '../components/ui/Reveal';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { setMeta } from '../lib/meta';
import NotFound from './NotFound';

/* ==========================================================================
   PRODUCT DETAIL (§25–§28)
   Mobile order: image → rating → details → purchase → description → related.
   Every fact shown is backed by real data; anything the backend doesn't
   provide is simply not rendered rather than filled in.
   ========================================================================== */

export default function Product() {
  const { slug = '' } = useParams();
  const { products, status: catalogStatus } = useCatalog();
  const { addToBag, openBag } = useStore();
  const { toast } = useToast();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>(
    'loading',
  );
  const [error, setError] = useState<string>();
  const [reviews, setReviews] = useState<Review[]>([]);

  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Prefer the already-loaded catalogue; fall back to a direct fetch so
  // deep links work on a cold load.
  useEffect(() => {
    let cancelled = false;
    setState('loading');

    const fromCache = products.find((p) => p.slug === slug || p.id === slug);
    if (fromCache) {
      setProduct(fromCache);
      setState('ready');
      return;
    }
    if (catalogStatus === 'loading') return;
    if (catalogStatus === 'not-configured') {
      setState('missing');
      return;
    }

    fetchProductBySlug(slug).then((res) => {
      if (cancelled) return;
      if (res.status === 'error') {
        setError(res.error);
        setState('error');
      } else if (!res.data) {
        setState('missing');
      } else {
        setProduct(res.data);
        setState('ready');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug, products, catalogStatus]);

  useEffect(() => {
    if (!product) return;
    setMeta({
      title: `${product.name} — Apna Store`,
      description:
        product.description?.slice(0, 155) ??
        `${product.name} from Apna Store.`,
    });
    setSize(undefined);
    setColor(undefined);
    setQty(1);
    fetchReviews(product.id).then((r) => setReviews(r.data));
  }, [product]);

  const related = useMemo(
    () => (product ? relatedProducts(products, product, 4) : []),
    [products, product],
  );

  useScrollReveal([product?.id, related.length]);

  if (state === 'loading') return <ProductSkeleton />;
  if (state === 'missing') return <NotFound />;
  if (state === 'error' || !product) {
    return (
      <main id="main" className="shell-wide section-y pt-[calc(var(--header-h)+3rem)]">
        <ErrorState
          title="We couldn’t load this product"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }

  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.inStock === false;
  const needsSize = Boolean(product.sizes?.length);
  const needsColor = Boolean(product.colors?.length);
  const ready = (!needsSize || size) && (!needsColor || color) && !soldOut;

  const onAdd = () => {
    if (!ready) {
      toast(needsSize && !size ? 'Please choose a size' : 'Please choose an option', {
        tone: 'info',
      });
      return;
    }
    addToBag(product, { size, color, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    toast('Added to bag', { detail: product.name });
  };

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast('Link copied', { tone: 'info' });
      }
    } catch {
      /* user dismissed the share sheet — not an error */
    }
  };

  return (
    <main id="main" className="bg-ink-800 pt-[var(--header-h)]">
      {/* ---- Breadcrumb ---- */}
      <nav aria-label="Breadcrumb" className="shell-wide pt-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-bone-dim">
          <li>
            <Link to="/" className="hover:text-bone">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/shop" className="hover:text-bone">Shop</Link>
          </li>
          {product.categorySlug && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  to={`/category/${product.categorySlug}`}
                  className="hover:text-bone"
                >
                  {categoryName(product.categorySlug)}
                </Link>
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="shell-wide grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        {/* ---- Gallery ---- */}
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* ---- Details + purchase ---- */}
        <div className="flex flex-col">
          <header>
            <p className="t-eyebrow mb-3">
              {product.categorySlug
                ? categoryName(product.categorySlug)
                : 'Apna Store'}
            </p>
            <h1 className="t-h2 text-bone">{product.name}</h1>

            {/* Rating: real aggregate, or an honest empty note */}
            <div className="mt-3">
              {product.ratingAverage !== undefined && product.ratingCount ? (
                <a href="#reviews" className="inline-flex items-center gap-2 text-sm text-bone-muted hover:text-bone">
                  <Stars value={product.ratingAverage} />
                  <span className="tabular-nums">
                    {product.ratingAverage.toFixed(1)}
                  </span>
                  <span className="text-bone-dim">
                    ({product.ratingCount}{' '}
                    {product.ratingCount === 1 ? 'review' : 'reviews'})
                  </span>
                </a>
              ) : (
                <p className="t-meta">No reviews yet</p>
              )}
            </div>
          </header>

          {/* ---- Price ---- */}
          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl tabular-nums text-bone">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-sm tabular-nums text-bone-dim line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                {discount !== null && (
                  <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-accent">
                    {discount}% off
                  </span>
                )}
              </>
            )}
          </div>
          <p className="t-meta mt-1.5">Inclusive of all taxes</p>

          {/* ---- Colour ---- */}
          {product.colors?.length ? (
            <fieldset className="mt-8">
              <legend className="t-eyebrow mb-3">
                Colour{color ? <span className="ml-2 normal-case tracking-normal text-bone">{color}</span> : null}
              </legend>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    disabled={!c.available}
                    onClick={() => setColor(c.name)}
                    aria-pressed={color === c.name}
                    aria-label={c.name}
                    title={c.name}
                    className={cn(
                      'relative grid h-9 w-9 place-items-center rounded-full border transition-all duration-[var(--motion-fast)] ease-premium',
                      color === c.name
                        ? 'border-bone scale-105'
                        : 'border-line hover:border-line-strong',
                      !c.available && 'cursor-not-allowed opacity-35',
                    )}
                  >
                    <span
                      className="h-6 w-6 rounded-full"
                      style={{ background: c.swatch }}
                    />
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {/* ---- Size (axis comes from the product itself, §27) ---- */}
          {product.sizes?.length ? (
            <fieldset className="mt-7">
              <legend className="t-eyebrow mb-3 flex w-full items-center justify-between">
                <span>{product.sizeLabel ?? 'Size'}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSize(s.value)}
                    aria-pressed={size === s.value}
                    className={cn(
                      'chip min-w-[3.25rem] justify-center',
                      !s.available &&
                        'cursor-not-allowed line-through opacity-35 hover:border-line',
                    )}
                    data-selected={size === s.value}
                  >
                    {s.value}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {/* ---- Quantity + purchase ---- */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-line">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center rounded-full text-bone-muted transition-colors hover:text-bone active:scale-90"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span
                className="min-w-[2rem] text-center text-sm tabular-nums text-bone"
                aria-live="polite"
              >
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="grid h-11 w-11 place-items-center rounded-full text-bone-muted transition-colors hover:text-bone active:scale-90"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <WishlistButton product={product} className="border border-line" />

            <button
              type="button"
              onClick={onShare}
              className="icon-btn border border-line"
              aria-label="Share this product"
            >
              <Share2 size={16} />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <Button
              onClick={onAdd}
              disabled={soldOut}
              block
              size="lg"
              className="sm:flex-1"
            >
              {added ? (
                <>
                  <Check size={16} /> Added
                </>
              ) : soldOut ? (
                'Sold out'
              ) : (
                'Add to bag'
              )}
            </Button>
            {!soldOut && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  onAdd();
                  if (ready) setTimeout(openBag, 240);
                }}
                className="sm:w-auto"
              >
                Buy now
              </Button>
            )}
          </div>

          {/* Stock line only when the backend actually tracks it */}
          {product.inStock !== null && (
            <p
              className={cn(
                'mt-3 text-xs',
                product.inStock ? 'text-bone-dim' : 'text-accent',
              )}
            >
              {product.inStock ? 'In stock' : 'Currently unavailable'}
            </p>
          )}

          <p className="mt-5 flex items-center gap-2 text-xs text-bone-dim">
            <Truck size={14} aria-hidden="true" />
            Delivery timelines are confirmed at checkout.
          </p>

          {/* ---- Detail accordions ---- */}
          <Accordion className="mt-10">
            {product.description && (
              <AccordionItem title="Description" defaultOpen>
                <p className="whitespace-pre-line">{product.description}</p>
              </AccordionItem>
            )}
            <AccordionItem title="Shipping">
              <p>
                Orders are dispatched once payment is confirmed. Tracking
                details appear in your account as soon as the courier collects
                your parcel.
              </p>
              <Link to="/legal/shipping" className="link-underline mt-3 inline-block text-bone">
                Full shipping policy
              </Link>
            </AccordionItem>
            <AccordionItem title="Returns">
              <p>
                If something isn’t right, our returns policy explains the
                window, condition requirements and refund timeline in plain
                language.
              </p>
              <Link to="/legal/returns" className="link-underline mt-3 inline-block text-bone">
                Full returns policy
              </Link>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* ---- Reviews ---- */}
      <section
        id="reviews"
        className="border-t border-line bg-ink-900"
        aria-labelledby="reviews-title"
      >
        <div className="shell-wide section-y">
          <Reveal>
            <h2 id="reviews-title" className="t-h2 mb-10 text-bone">
              Reviews
            </h2>
          </Reveal>

          {reviews.length === 0 ? (
            <Reveal index={1}>
              <div className="surface rounded-xl px-6 py-12 text-center">
                <p className="font-display text-2xl text-bone">
                  No reviews yet
                </p>
                <p className="t-body mx-auto mt-3 max-w-prose2">
                  This piece hasn’t been reviewed yet. Reviews appear here once
                  verified buyers leave them.
                </p>
              </div>
            </Reveal>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2">
              {reviews.map((r, i) => (
                <li key={r.id} data-reveal="rise" style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}>
                  <article className="surface h-full rounded-xl p-6">
                    <Stars value={r.rating} />
                    {r.title && (
                      <h3 className="mt-3 text-[0.9375rem] font-medium text-bone">
                        {r.title}
                      </h3>
                    )}
                    {r.body && <p className="t-body mt-2">{r.body}</p>}
                    <footer className="t-meta mt-4">
                      {r.authorName}
                      {r.createdAt && ` · ${formatDate(r.createdAt)}`}
                    </footer>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---- Related ---- */}
      {related.length > 0 && (
        <section className="bg-ink-800" aria-labelledby="related-title">
          <div className="shell-wide section-y">
            <Reveal>
              <h2 id="related-title" className="t-h2 mb-10 text-bone">
                You might also like
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={cn(
            'h-3.5 w-3.5',
            i <= rounded ? 'fill-accent' : 'fill-bone/15',
          )}
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9 4.7 17.6l1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

function ProductSkeleton() {
  return (
    <main id="main" className="shell-wide pt-[calc(var(--header-h)+2.5rem)]">
      <div className="grid gap-10 py-8 lg:grid-cols-2 lg:gap-16">
        <Skeleton className="aspect-[3/4] w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-9 w-3/4 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-7 w-28 rounded" />
          <div className="!mt-10 space-y-3">
            <Skeleton className="h-3 w-16 rounded" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-14 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="!mt-10 h-14 w-full rounded-full" />
        </div>
      </div>
    </main>
  );
}
