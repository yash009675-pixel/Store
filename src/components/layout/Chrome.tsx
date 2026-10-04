import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsDesktop, useReducedMotion } from '../../hooks/useMotionPrefs';

/* ==========================================================================
   AMBIENT CHROME
   Grain, scroll progress, custom cursor and route transitions.
   Every one of these is decorative, so every one of these switches off
   under reduced motion or on touch (§11, §51, §78).
   ========================================================================== */

export function Grain() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return <div className="grain" aria-hidden="true" />;
}

/** Thin top progress line (§65) — hidden from AT, driven by rAF. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = barRef.current;
      if (!el) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${pct})`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[75] h-px bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-bone/55 will-change-transform"
      />
    </div>
  );
}

/**
 * Custom cursor (§51). Desktop + fine pointer only. It is purely additive:
 * the native cursor is never hidden on interactive elements, so pointer
 * behaviour is never blocked.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const isDesktop = useIsDesktop();
  const reduced = useReducedMotion();
  const enabled = isDesktop && !reduced;

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const render = () => {
      // Lerp toward the pointer for a weighted, premium feel.
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      const el = dotRef.current;
      if (el) {
        el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(render);
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) setVisible(true);

      const hit = (e.target as HTMLElement | null)?.closest?.('[data-cursor]');
      setLabel(hit ? (hit as HTMLElement).dataset.cursor || null : null);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled, visible]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-cursor hidden lg:block"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
    >
      <div
        className="grid place-items-center rounded-full border border-bone/60 bg-bone/10 backdrop-blur-sm transition-all duration-300 ease-premium"
        style={{
          width: label ? 68 : 14,
          height: label ? 68 : 14,
        }}
      >
        {label && (
          <span className="text-[0.5625rem] font-medium uppercase tracking-wide2 text-bone">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Route transition (§55). A short clip/fade on the incoming page only —
 * navigation is never delayed waiting for an exit animation, so back/forward
 * and deep links stay instant and correct.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const reduced = useReducedMotion();

  // Always land at the top of a new route, but respect hash anchors.
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return (
    <div
      key={location.pathname}
      className={reduced ? undefined : 'animate-[page-in_520ms_cubic-bezier(0.22,1,0.36,1)_both]'}
    >
      {children}
    </div>
  );
}
