import { useEffect, useState } from 'react';

/** Reads a media query reactively, SSR-safe and Safari-safe. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    // addEventListener is unsupported on older Safari MediaQueryList
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

/** Central reduced-motion switch (§11). Also mirrored onto <html>. */
export function useReducedMotion(): boolean {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reduced);
  }, [reduced]);
  return reduced;
}

/** True for pointer-coarse / touch devices — disables hover-only affordances. */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none), (pointer: coarse)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Keeps --app-vh correct on mobile Safari, where 100vh includes the
 * collapsing toolbar and causes hero sections to overflow (§86).
 */
export function useViewportHeight(): void {
  useEffect(() => {
    const supportsDvh =
      typeof CSS !== 'undefined' && CSS.supports?.('height', '100dvh');

    const set = () => {
      const root = document.documentElement;
      if (supportsDvh) {
        root.style.setProperty('--app-vh', '100dvh');
      } else {
        root.style.setProperty('--app-vh', `${window.innerHeight}px`);
      }
      root.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    set();
    if (supportsDvh) return;
    window.addEventListener('resize', set);
    window.addEventListener('orientationchange', set);
    return () => {
      window.removeEventListener('resize', set);
      window.removeEventListener('orientationchange', set);
    };
  }, []);
}
