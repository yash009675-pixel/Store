import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useStore } from '../../context/StoreProvider';
import { useToast } from '../../context/ToastProvider';
import type { Product } from '../../lib/types';

/* ==========================================================================
   WISHLIST BUTTON (§29, §70)
   idle → press (scale down) → success (fill + ring pulse)
   ========================================================================== */

export function WishlistButton({
  product,
  className,
  size = 18,
  surface = 'bare',
}: {
  product: Product;
  className?: string;
  size?: number;
  surface?: 'bare' | 'glass';
}) {
  const { isWishlisted, toggleWishlist } = useStore();
  const { toast } = useToast();
  const [burst, setBurst] = useState(false);
  const active = isWishlisted(product.id);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
    toast(added ? 'Saved to wishlist' : 'Removed from wishlist', {
      tone: added ? 'success' : 'info',
      detail: product.name,
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={
        active
          ? `Remove ${product.name} from wishlist`
          : `Save ${product.name} to wishlist`
      }
      className={cn(
        'relative grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all duration-[var(--motion-fast)] ease-premium active:scale-90',
        surface === 'glass' && 'glass-soft',
        active ? 'text-accent' : 'text-bone-muted hover:text-bone',
        className,
      )}
    >
      {/* Success ring — fires only on add, never on remove */}
      {burst && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full border border-accent animate-[pulse-ring_600ms_ease-out_forwards]"
        />
      )}
      <Heart
        size={size}
        strokeWidth={1.7}
        className={cn(
          'transition-transform duration-[var(--motion-fast)] ease-premium',
          active && 'scale-110 fill-current',
        )}
      />
    </button>
  );
}
