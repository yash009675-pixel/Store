import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ButtonLink } from './Button';

/* ==========================================================================
   ONE EMPTY STATE FOR THE WHOLE STORE (§44)
   Used by: empty bag, empty wishlist, no orders, no notifications, no wallet
   activity, no search results, no products, and Coming Soon categories.
   It explains the truth and always offers a way forward.
   ========================================================================== */

interface EmptyStateProps {
  /** Large editorial mark — a short word or a glyph, not a cartoon. */
  figure?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: { label: string; to: string };
  secondaryAction?: { label: string; to: string };
  children?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  figure,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl px-6 text-center',
        compact ? 'py-12' : 'py-16 sm:py-24',
        className,
      )}
    >
      {/* Slow morphing mark — the only decorative motion in an empty state */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-56 w-56 -translate-x-1/2 -translate-y-1/2 opacity-[0.07] sm:h-72 sm:w-72"
        style={{
          background:
            'radial-gradient(circle at 40% 35%, var(--as-bone), transparent 62%)',
          animation: 'morph-blob 14s ease-in-out infinite, float-slow 11s ease-in-out infinite',
        }}
      />

      {figure && (
        <div className="anim-scale mb-5 font-display text-5xl leading-none text-bone-dim sm:text-6xl">
          {figure}
        </div>
      )}

      <h3 className="anim-rise t-h3 max-w-md text-bone" style={{ animationDelay: '60ms' }}>
        {title}
      </h3>

      {description && (
        <p
          className="anim-rise t-body mt-3 max-w-prose2 text-balance"
          style={{ animationDelay: '140ms' }}
        >
          {description}
        </p>
      )}

      {children && <div className="mt-6 w-full max-w-md">{children}</div>}

      {(action || secondaryAction) && (
        <div
          className="anim-rise mt-8 flex flex-col items-center gap-3 sm:flex-row"
          style={{ animationDelay: '220ms' }}
        >
          {action && (
            <ButtonLink to={action.to} variant="primary">
              {action.label}
            </ButtonLink>
          )}
          {secondaryAction && (
            <ButtonLink to={secondaryAction.to} variant="ghost">
              {secondaryAction.label}
            </ButtonLink>
          )}
        </div>
      )}
    </div>
  );
}
