import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;
let savedStyles: Partial<CSSStyleDeclaration> = {};

/**
 * Body scroll lock that works on iOS Safari (§86).
 * position:fixed + restoring scrollY is the only reliable approach there;
 * we also pad for the scrollbar so the page doesn't shift sideways.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;
    if (lockCount === 1) {
      savedScrollY = window.scrollY;
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      const body = document.body;

      savedStyles = {
        position: body.style.position,
        top: body.style.top,
        width: body.style.width,
        paddingRight: body.style.paddingRight,
      };

      body.style.position = 'fixed';
      body.style.top = `-${savedScrollY}px`;
      body.style.width = '100%';
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
      body.dataset.scrollLocked = 'true';
    }

    return () => {
      lockCount -= 1;
      if (lockCount !== 0) return;

      const body = document.body;
      body.style.position = savedStyles.position ?? '';
      body.style.top = savedStyles.top ?? '';
      body.style.width = savedStyles.width ?? '';
      body.style.paddingRight = savedStyles.paddingRight ?? '';
      delete body.dataset.scrollLocked;
      window.scrollTo(0, savedScrollY);
    };
  }, [active]);
}
