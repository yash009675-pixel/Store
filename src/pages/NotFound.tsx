import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/ui/Button';
import { useReducedMotion } from '../hooks/useMotionPrefs';
import { setMeta } from '../lib/meta';

/* ==========================================================================
   404 (§45)
   Large editorial numeral, one slowly morphing shape behind it, and a clear
   way back. Premium, not playful.
   ========================================================================== */

export default function NotFound() {
  const reduced = useReducedMotion();

  useEffect(() => {
    setMeta({
      title: 'Page not found — Apna Store',
      description: 'The page you’re looking for doesn’t exist.',
    });
  }, []);

  return (
    <main
      id="main"
      className="relative flex min-h-[80vh] items-center overflow-hidden bg-ink-900 pt-[var(--header-h)]"
    >
      {/* Morphing mark — the only moving element on the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 'min(72vw, 34rem)',
          height: 'min(72vw, 34rem)',
          background:
            'radial-gradient(circle at 38% 32%, rgba(196,103,74,0.5), transparent 62%)',
          filter: 'blur(28px)',
          opacity: 0.4,
          animation: reduced
            ? undefined
            : 'morph-blob 18s ease-in-out infinite, float-slow 13s ease-in-out infinite',
        }}
      />

      <div className="shell-wide relative text-center">
        <p
          className="anim-fade t-eyebrow mb-6"
          style={{ animationDelay: '80ms' }}
        >
          Error 404
        </p>

        <h1 className="font-display text-[clamp(5rem,26vw,16rem)] leading-[0.82] tracking-tightest text-bone">
          <span className="line-mask inline-block">
            <span style={{ animationDelay: '160ms' }}>404</span>
          </span>
        </h1>

        <p
          className="anim-rise t-lead mx-auto mt-8 max-w-prose2"
          style={{ animationDelay: '520ms' }}
        >
          The page you’re looking for doesn’t exist. It may have moved, or the
          link may be out of date.
        </p>

        <div
          className="anim-rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: '640ms' }}
        >
          <ButtonLink to="/" variant="primary" size="lg">
            Back to home
          </ButtonLink>
          <ButtonLink to="/shop" variant="ghost" size="lg">
            Browse products
          </ButtonLink>
        </div>

        <p
          className="anim-fade mt-12 text-sm text-bone-dim"
          style={{ animationDelay: '760ms' }}
        >
          Or{' '}
          <Link to="/support" className="link-underline text-bone-muted hover:text-bone">
            contact support
          </Link>{' '}
          and we’ll help you find it.
        </p>
      </div>
    </main>
  );
}
