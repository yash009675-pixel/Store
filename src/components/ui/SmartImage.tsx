import { useState, type CSSProperties } from 'react';
import { cn } from '../../lib/cn';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Fashion crops need intentional framing — never blanket "center" (§87). */
  objectPosition?: string;
  priority?: boolean;
  sizes?: string;
  style?: CSSProperties;
}

/**
 * Image with a shimmering placeholder, graceful decode-in, and a real
 * fallback if the asset 404s — so a broken URL never leaves a white hole.
 */
export function SmartImage({
  src,
  alt,
  className,
  objectPosition = 'center center',
  priority = false,
  sizes,
  style,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={cn(
          'grid h-full w-full place-items-center bg-ink-700',
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <span className="px-4 text-center font-display text-sm italic text-bone-dim">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="skeleton absolute inset-0 rounded-[inherit]" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...{ fetchpriority: priority ? 'high' : 'auto' }}
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-700 ease-premium',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        style={{ objectPosition, ...style }}
      />
    </>
  );
}
