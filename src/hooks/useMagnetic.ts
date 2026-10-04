import { useEffect, useRef } from 'react';

/* ==========================================================================
   MAGNETIC BUTTON (§50)
   Desktop + fine-pointer only, never on touch, never under reduced motion,
   and the pull is small enough that the button is never harder to click.
   ========================================================================== */

export function useMagnetic<T extends HTMLElement>(strength = 0.22, radius = 70) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduced.matches) return;

    let frame = 0;
    let active = false;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      if (Math.hypot(dx, dy) > Math.max(rect.width, rect.height) / 2 + radius) {
        if (active) reset();
        return;
      }

      active = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.willChange = 'transform';
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
      });
    };

    const reset = () => {
      active = false;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = 'translate3d(0, 0, 0)';
        el.style.willChange = 'auto';
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', reset);
      el.style.transform = '';
      el.style.willChange = '';
    };
  }, [strength, radius]);

  return ref;
}
