import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { Category } from '../../lib/types';
import { SmartImage } from '../ui/SmartImage';
import { revealDelay } from '../../hooks/useScrollReveal';

/* ==========================================================================
   CATEGORY TILE (§39)
   A tile without a photograph falls back to a typographic treatment rather
   than a stretched or borrowed image.
   Availability text is driven by real inventory counts (§38) — a category
   with nothing in it reads "Coming soon", never "no products match".
   ========================================================================== */

export function CategoryTile({
  category,
  index = 0,
  size = 'md',
}: {
  category: Category;
  index?: number;
  size?: 'md' | 'lg';
}) {
  const hasImage = Boolean(category.image);

  return (
    <Link
      to={`/category/${category.slug}`}
      data-reveal="rise"
      style={revealDelay(index, 80)}
      className={cn(
        'hover-zoom group relative block overflow-hidden rounded-xl bg-ink-700',
        size === 'lg' ? 'aspect-[4/5] sm:aspect-[3/4]' : 'aspect-[4/5]',
      )}
    >
      {hasImage ? (
        <SmartImage
          src={category.image}
          alt={category.name}
          objectPosition={category.objectPosition ?? 'center 25%'}
          sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden"
          style={{
            background:
              'radial-gradient(120% 90% at 20% 0%, #22242a 0%, #141519 55%, #0d0e11 100%)',
          }}
        >
          <span className="zoom-target absolute -bottom-6 -right-3 select-none font-display text-[7rem] leading-none text-bone/[0.055] sm:text-[9rem]">
            {category.name.charAt(0)}
          </span>
        </div>
      )}

      <div className="scrim scrim-card" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-tight text-bone sm:text-2xl">
            {category.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-bone-muted">
            {category.blurb}
          </p>

          <p
            className={cn(
              'mt-2.5 text-[0.6875rem] font-medium uppercase tracking-wide2',
              category.live ? 'text-accent' : 'text-bone-dim',
            )}
          >
            {category.live
              ? `${category.productCount} ${category.productCount === 1 ? 'piece' : 'pieces'}`
              : 'Coming soon'}
          </p>
        </div>

        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong text-bone transition-all duration-[var(--motion-normal)] ease-premium group-hover:border-bone group-hover:bg-bone group-hover:text-ink-900">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </Link>
  );
}
