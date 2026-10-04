import { AlertTriangle, PlugZap, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/cn';

/* ==========================================================================
   ERROR / NOT-CONFIGURED VIEWS (§46, §62)
   Nothing here hides a failure behind an animation, and nothing here
   substitutes invented content for missing data.
   ========================================================================== */

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'surface flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center',
        className,
      )}
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 text-accent">
        <AlertTriangle size={18} />
      </span>
      <div>
        <h3 className="t-h3 text-bone">{title}</h3>
        {message && <p className="t-body mx-auto mt-2 max-w-prose2">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw size={14} aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}

/**
 * Shown wherever real commerce data would appear but no backend is wired up.
 * It is deliberately explicit: the store is not pretending to have a
 * catalogue it does not have.
 */
export function BackendNotConnected({
  what = 'Products',
  className,
}: {
  what?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'surface relative overflow-hidden rounded-2xl px-6 py-14 text-center sm:py-20',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, var(--as-bone), transparent 65%)',
          animation: 'morph-blob 16s ease-in-out infinite',
        }}
      />
      <span className="relative mx-auto grid h-11 w-11 place-items-center rounded-full border border-line text-bone-dim">
        <PlugZap size={18} />
      </span>
      <h3 className="t-h3 relative mt-5 text-bone">{what} aren’t connected yet</h3>
      <p className="t-body relative mx-auto mt-3 max-w-prose2">
        Apna Store is not linked to a product database in this environment, so
        there is nothing real to show here. Rather than display sample items,
        this space stays honest and empty until the store’s live catalogue is
        connected.
      </p>
      <p className="relative mx-auto mt-5 max-w-prose2 text-xs leading-relaxed text-bone-dim">
        Set <code className="rounded bg-ink-600 px-1.5 py-0.5 text-bone">VITE_SUPABASE_URL</code>{' '}
        and{' '}
        <code className="rounded bg-ink-600 px-1.5 py-0.5 text-bone">
          VITE_SUPABASE_ANON_KEY
        </code>{' '}
        to go live.
      </p>
    </div>
  );
}
