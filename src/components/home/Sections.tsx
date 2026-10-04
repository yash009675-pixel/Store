import { Link } from 'react-router-dom';
import { ArrowUpRight, PackageCheck, RotateCcw, ShieldCheck } from 'lucide-react';
import { Reveal } from '../ui/Reveal';
import { ButtonLink } from '../ui/Button';
import { Marquee } from '../ui/Marquee';
import { SmartImage } from '../ui/SmartImage';
import { CategoryTile } from '../commerce/CategoryTile';
import { ProductCard } from '../commerce/ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';
import { BackendNotConnected, ErrorState } from '../ui/StateViews';
import { EmptyState } from '../ui/EmptyState';
import { useCatalog } from '../../context/CatalogProvider';
import { revealDelay } from '../../hooks/useScrollReveal';

/* ==========================================================================
   HOMEPAGE SECTIONS (§89)
   Each one is a scene that flows into the next — no hard theme jumps.
   Product-bearing sections render real data or an honest state, never
   placeholder merchandise.
   ========================================================================== */

/* ------------------------------------------------- 2. Editorial intro -- */
export function EditorialIntro() {
  return (
    <section id="intro" className="section-y bg-ink-900" aria-labelledby="intro-title">
      <div className="shell-wide grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal kind="image" className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[3/2] lg:aspect-[4/5]">
            <SmartImage
              src="/media/editorial-craft.jpg"
              alt="Hands working thread at a traditional handloom"
              objectPosition="center 45%"
              sizes="(min-width:1024px) 45vw, 92vw"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="t-eyebrow mb-5">Our approach</p>
          </Reveal>

          <Reveal index={1}>
            <h2 id="intro-title" className="t-h1 text-bone">
              Fewer things, chosen properly.
            </h2>
          </Reveal>

          <Reveal index={2}>
            <p className="t-lead mt-6 max-w-prose2">
              Apna Store began with a simple frustration — too much choice, too
              little care. So we buy narrow and we buy well: fabric you want to
              keep touching, cuts that hold their shape, and prices we can
              explain.
            </p>
          </Reveal>

          <Reveal index={3}>
            <p className="t-body mt-4 max-w-prose2">
              Everything here is picked by a small team, one piece at a time.
            </p>
          </Reveal>

          <Reveal index={4}>
            <div className="mt-9">
              <ButtonLink to="/about" variant="outline">
                Read our story
                <ArrowUpRight size={15} className="btn-arrow" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------- 3. Shop by category -- */
export function ShopByCategory() {
  const { categories } = useCatalog();
  const [first, second, ...rest] = categories;

  return (
    <section className="section-y bg-ink-800" aria-labelledby="cat-title">
      <div className="shell-wide">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <Reveal>
              <p className="t-eyebrow mb-4">Browse</p>
            </Reveal>
            <Reveal index={1}>
              <h2 id="cat-title" className="t-h2 text-bone">
                Shop by category
              </h2>
            </Reveal>
          </div>
          <Reveal index={2}>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-1.5 text-sm text-bone-muted transition-colors hover:text-bone"
            >
              <span className="link-underline">All products</span>
              <ArrowUpRight
                size={14}
                className="transition-transform duration-[var(--motion-normal)] ease-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </Reveal>
        </div>

        {/* Two feature tiles lead, the rest follow in a calmer grid */}
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {first && <CategoryTile category={first} index={0} size="lg" />}
          {second && <CategoryTile category={second} index={1} size="lg" />}
        </div>

        {rest.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-3">
            {rest.map((cat, i) => (
              <CategoryTile key={cat.slug} category={cat} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------- 4. Featured grid -- */
export function FeaturedProducts() {
  const { products, status, error, refresh } = useCatalog();
  const featured = products.slice(0, 8);

  return (
    <section className="section-y bg-ink-800" aria-labelledby="featured-title">
      <div className="shell-wide">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <Reveal>
              <p className="t-eyebrow mb-4">New in</p>
            </Reveal>
            <Reveal index={1}>
              <h2 id="featured-title" className="t-h2 text-bone">
                Latest pieces
              </h2>
            </Reveal>
          </div>
          {featured.length > 0 && (
            <Reveal index={2}>
              <ButtonLink to="/shop" variant="ghost" size="sm">
                View all
                <ArrowUpRight size={14} className="btn-arrow" />
              </ButtonLink>
            </Reveal>
          )}
        </div>

        {status === 'loading' && <ProductGridSkeleton count={8} />}

        {status === 'error' && (
          <ErrorState
            title="We couldn’t load the collection"
            message={error}
            onRetry={refresh}
          />
        )}

        {status === 'not-configured' && <BackendNotConnected what="Products" />}

        {status === 'ready' && featured.length === 0 && (
          <EmptyState
            figure="—"
            title="Nothing listed yet"
            description="New pieces are added as they arrive. Check back shortly."
            action={{ label: 'Browse categories', to: '/shop' }}
          />
        )}

        {status === 'ready' && featured.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- 5. Lookbook -- */
export function Lookbook() {
  return (
    <section className="relative overflow-hidden bg-ink-900" aria-labelledby="look-title">
      <div className="scene-seam" aria-hidden="true" />

      <div className="shell-wide pb-[var(--section-y)]">
        <div className="mb-12 max-w-xl">
          <Reveal>
            <p className="t-eyebrow mb-4">Lookbook</p>
          </Reveal>
          <Reveal index={1}>
            <h2 id="look-title" className="t-h2 text-bone">
              The season, worn in.
            </h2>
          </Reveal>
          <Reveal index={2}>
            <p className="t-body mt-5">
              Photographed as the pieces are actually worn — in daylight, in
              movement, in real rooms.
            </p>
          </Reveal>
        </div>

        {/* Offset masonry: two images at different heights, deliberately
            uneven so the composition reads as editorial rather than grid */}
        <div className="grid gap-4 sm:grid-cols-12 sm:gap-6">
          <Reveal kind="image" className="sm:col-span-7">
            <figure className="hover-zoom relative aspect-[4/5] overflow-hidden rounded-xl sm:aspect-[4/3]">
              <SmartImage
                src="/media/lookbook-1.jpg"
                alt="A model seated in a concrete room wearing minimal contemporary clothing"
                objectPosition="center 35%"
                sizes="(min-width:640px) 56vw, 92vw"
              />
            </figure>
          </Reveal>

          <Reveal kind="image" index={1} className="sm:col-span-5 sm:mt-16">
            <figure className="hover-zoom relative aspect-[4/5] overflow-hidden rounded-xl">
              <SmartImage
                src="/media/lookbook-2.jpg"
                alt="Two models walking away down a dim corridor in flowing dark garments"
                objectPosition="center 40%"
                sizes="(min-width:640px) 40vw, 92vw"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <span className="scrim scrim-card" aria-hidden="true" />
                <span className="relative font-display text-lg text-bone">
                  In motion
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------- 6. Brand marquee -- */
export function BrandBand() {
  return (
    <section
      className="border-y border-line bg-ink-900 py-9 sm:py-12"
      aria-label="Apna Store"
    >
      <Marquee
        items={['Apna Store', 'New season', 'Style that feels like you']}
        duration={46}
      />
    </section>
  );
}

/* --------------------------------------------------- 7. Support strip -- */
const PROMISES = [
  {
    icon: PackageCheck,
    title: 'Tracked delivery',
    body: 'Every order ships with tracking, and you’ll see its real status in your account.',
  },
  {
    icon: RotateCcw,
    title: 'Straightforward returns',
    body: 'Changed your mind? Our returns policy is written in plain language.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure checkout',
    body: 'Payments are handled over an encrypted connection, every time.',
  },
];

export function SupportStrip() {
  return (
    <section className="section-y bg-ink-800" aria-labelledby="promise-title">
      <div className="shell-wide">
        <Reveal>
          <h2 id="promise-title" className="t-eyebrow mb-10">
            Shopping with us
          </h2>
        </Reveal>

        <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {PROMISES.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                data-reveal="rise"
                style={revealDelay(i, 90)}
                className="bg-ink-800 p-7"
              >
                <Icon size={19} strokeWidth={1.5} className="text-bone-muted" aria-hidden="true" />
                <h3 className="mt-4 text-[0.9375rem] font-medium text-bone">
                  {item.title}
                </h3>
                <p className="t-body mt-2 text-sm">{item.body}</p>
              </li>
            );
          })}
        </ul>

        <Reveal index={3}>
          <div className="mt-8 text-center sm:text-left">
            <Link
              to="/support"
              className="link-underline text-sm text-bone-muted transition-colors hover:text-bone"
            >
              Questions? Talk to us
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
