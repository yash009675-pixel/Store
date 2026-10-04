import { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useCatalog } from '../context/CatalogProvider';
import { CATEGORY_DEFS } from '../lib/categories';
import { ProductCard } from '../components/commerce/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/StateViews';
import { EmptyState } from '../components/ui/EmptyState';
import { SmartImage } from '../components/ui/SmartImage';
import { ButtonLink } from '../components/ui/Button';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { setMeta } from '../lib/meta';

/* ==========================================================================
   CATEGORY (§38, §39)
   A category with no live inventory gets the Coming Soon state and the
   approved wording — never "no products match", which would wrongly imply
   the shopper's filters were at fault.
   ========================================================================== */

export default function Category() {
  const { slug = '' } = useParams();
  const { products, categories, status, error, refresh } = useCatalog();

  const def = CATEGORY_DEFS.find((c) => c.slug === slug);
  const resolved = categories.find((c) => c.slug === slug);

  const items = useMemo(
    () => products.filter((p) => p.categorySlug === slug),
    [products, slug],
  );

  useEffect(() => {
    if (!def) return;
    setMeta({
      title: `${def.name} — Apna Store`,
      description: def.blurb,
    });
  }, [def]);

  useScrollReveal([status, items.length, slug]);

  // Unknown slug is a genuine 404, not an empty category.
  if (!def) return <Navigate to="/404" replace />;

  const live = resolved?.live ?? false;
  const liveCategories = categories.filter((c) => c.live);

  return (
    <main id="main" className="bg-ink-800">
      {/* ---- Category hero ---- */}
      <header className="relative isolate flex min-h-[46vh] items-end overflow-hidden bg-ink-900 pt-[var(--header-h)] sm:min-h-[56vh]">
        {def.image ? (
          <div className="absolute inset-0 -z-10">
            <SmartImage
              src={def.image}
              alt=""
              objectPosition={def.objectPosition ?? 'center 25%'}
              priority
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(110% 80% at 25% 0%, #22242a 0%, #141519 55%, #0d0e11 100%)',
            }}
          />
        )}
        <div className="scrim scrim-bottom -z-10" aria-hidden="true" />

        <div className="shell-wide pb-12 sm:pb-16">
          <p className="anim-fade t-eyebrow mb-4">Category</p>
          <h1 className="t-h1 text-bone">
            <span className="line-mask inline-block">
              <span style={{ animationDelay: '120ms' }}>{def.name}</span>
            </span>
          </h1>
          <p
            className="anim-rise t-lead mt-4 max-w-prose2"
            style={{ animationDelay: '340ms' }}
          >
            {def.blurb}
          </p>
        </div>
      </header>

      <div className="shell-wide section-y">
        {status === 'loading' && <ProductGridSkeleton count={8} />}

        {status === 'error' && (
          <ErrorState
            title="We couldn’t load this category"
            message={error}
            onRetry={refresh}
          />
        )}

        {(status === 'ready' || status === 'not-configured') && !live && (
          <EmptyState
            figure={def.name.charAt(0)}
            title={`${def.name} isn’t live yet`}
            description={
              <>
                {def.name} products are not live yet. This category will be
                added soon — please check back shortly.
              </>
            }
          >
            {/* Point shoppers at something that genuinely is shoppable */}
            {liveCategories.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-3">
                {liveCategories.slice(0, 3).map((c) => (
                  <ButtonLink
                    key={c.slug}
                    to={`/category/${c.slug}`}
                    variant="outline"
                    size="sm"
                  >
                    Shop {c.name}
                  </ButtonLink>
                ))}
              </div>
            ) : (
              <div className="flex justify-center">
                <ButtonLink to="/shop" variant="outline" size="sm">
                  Browse everything
                </ButtonLink>
              </div>
            )}
          </EmptyState>
        )}

        {status === 'ready' && live && (
          <>
            <p className="t-body mb-10">
              {items.length} {items.length === 1 ? 'piece' : 'pieces'}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  priority={i < 4}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
