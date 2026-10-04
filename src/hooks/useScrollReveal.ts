import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* ==========================================================================
   SCROLL REVEAL (§20)
   One IntersectionObserver for the whole document rather than one per
   element — cheap, and it survives route changes.
   Elements opt in with [data-reveal]; they are marked [data-revealed] once
   and then released so nothing keeps `will-change` alive (§75).
   ========================================================================== */

export function useScrollReveal(deps: unknown[] = []): void {
  const location = useLocation();

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])'),
    );
    if (!nodes.length) return;

    // Reduced motion: show everything immediately, no observer at all.
    if (reduced) {
      nodes.forEach((n) => (n.dataset.revealed = 'true'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.dataset.revealed = 'true';
          observer.unobserve(el);
        }
      },
      {
        // Fire a little before the element reaches the fold so the motion
        // reads as "arriving", not "popping in late".
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.08,
      },
    );

    nodes.forEach((n) => {
      // Anything already on screen at mount reveals on the next frame,
      // which keeps the initial page entrance feeling intentional.
      const rect = n.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        requestAnimationFrame(() => {
          n.dataset.revealed = 'true';
        });
      } else {
        observer.observe(n);
      }
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, ...deps]);
}

/** Stagger helper: turns an index into a capped CSS delay. */
export function revealDelay(index: number, step = 70, max = 560): React.CSSProperties {
  return { ['--reveal-delay' as string]: `${Math.min(index * step, max)}ms` };
}
