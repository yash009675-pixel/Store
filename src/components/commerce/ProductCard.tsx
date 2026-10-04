import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { discountPercent, formatPrice } from '../../lib/format';
import type { Product } from '../../lib/types';
import { SmartImage } from '../ui/SmartImage';
import { WishlistButton } from './WishlistButton';
import { revealDelay } from '../../hooks/useScrollReveal';

/* ==========================================================================
   PRODUCT CARD (§22, §23)
   Only renders facts the backend actually supplied. No placeholder ratings,
   no invented "only 2 left", no fake discount badge.
   Hover swaps to a genuine second image when one exists; touch devices get
   a tap-through with no hover dependency.
   ========================================================================== */

export function ProductCard({
  product,
  index = 0,
  priority = false,
}: {
  product: Product;
  index?: number;
  priority?: boolean;
}) {
  const primary = product.images[0];
  const secondary = product.images[1];
  const discount = discountPercent(product.price, product.compareAtPrice);
  const soldOut = product.inStock === false;

  return (
    <article
      data-reveal="rise"
      style={revealDelay(index, 60)}
      className="group relative"
    >
      <Link
        to={`/product/${product.slug}`}
        className="block focus-visible:outline-none"
        aria-label={product.name}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-ink-700">
          {primary ? (
            <>
              <div
                className={cn(
                  'absolute inset-0 transition-[transform,opacity] duration-[var(--motion-cinematic)] ease-cinematic',
                  secondary && 'group-hover:opacity-0',
                  'group-hover:scale-[1.04]',
                )}
              >
                <SmartImage
                  src={primary.url}
                  alt={primary.alt || product.name}
                  objectPosition={primary.objectPosition ?? 'center 20%'}
                  priority={priority}
                  sizes="(min-width:1280px) 22vw, (min-width:1024px) 30vw, (min-width:640px) 45vw, 48vw"
                />
              </div>

              {secondary && (
                <div className="absolute inset-0 opacity-0 transition-[transform,opacity] duration-[var(--motion-cinematic)] ease-cinematic group-hover:scale-[1.04] group-hover:opacity-100">
                  <SmartImage
                    src={secondary.url}
                    alt=""
                    objectPosition={secondary.objectPosition ?? 'center 20%'}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="grid h-full place-items-center">
              <span className="font-display text-sm italic text-bone-dim">
                No image
              </span>
            </div>
          )}

          {/* Badges: only shown when the data is real */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {discount !== null && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-white">
                {discount}% off
              </span>
            )}
            {soldOut && (
              <span className="glass-soft rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wide text-bone">
                Sold out
              </span>
            )}
          </div>

          <div className="absolute right-2 top-2 opacity-100 transition-opacity duration-[var(--motion-normal)] md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <WishlistButton product={product} surface="glass" size={16} />
          </div>
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[0.9375rem] leading-snug text-bone">
            <Link to={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          {/* Real aggregate rating only — absent when the product has none */}
          {product.ratingAverage !== undefined && product.ratingCount ? (
            <p className="t-meta mt-1">
              {product.ratingAverage.toFixed(1)} ★ ({product.ratingCount})
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[0.9375rem] tabular-nums text-bone">
            {formatPrice(product.price)}
          </p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <p className="t-meta tabular-nums line-through">
              {formatPrice(product.compareAtPrice)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
