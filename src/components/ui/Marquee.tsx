import { Fragment } from 'react';
import { cn } from '../../lib/cn';

/**
 * Marquee (§41). The track is duplicated once and the duplicate is hidden
 * from assistive tech, so the phrase is announced a single time.
 * Pauses on hover; fully stopped under reduced motion via global CSS.
 */
export function Marquee({
  items,
  duration = 42,
  className,
  separator = '—',
}: {
  items: string[];
  duration?: number;
  className?: string;
  separator?: string;
}) {
  const track = (
    <div className="marquee__track" style={{ animationDuration: `${duration}s` }}>
      {items.map((item, i) => (
        <Fragment key={`${item}-${i}`}>
          <span className="font-display text-[clamp(1.75rem,5vw,3.5rem)] leading-none text-bone/85">
            {item}
          </span>
          <span
            aria-hidden="true"
            className="font-display text-[clamp(1.75rem,5vw,3.5rem)] leading-none text-bone/20"
          >
            {separator}
          </span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <div
      className={cn('marquee relative', className)}
      style={{ ['--marquee-duration' as string]: `${duration}s` }}
    >
      {/* Edge fades so words don't collide with the viewport border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink-900 to-transparent sm:w-32"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink-900 to-transparent sm:w-32"
      />
      {track}
      <div aria-hidden="true">{track}</div>
    </div>
  );
}
