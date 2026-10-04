import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { CATEGORY_DEFS } from '../../lib/categories';
import { useCatalog } from '../../context/CatalogProvider';
import { SmartImage } from '../ui/SmartImage';

/* ==========================================================================
   MORPHING DROPDOWN (§14)
   A single panel element that measures each menu's content and animates its
   width and height between states, while the content itself crossfades with
   a slight blur. No layout jumps, no second panel popping in.
   Pointer + keyboard + Escape + touch are all supported.
   ========================================================================== */

export type MenuKey = 'shop' | 'help' | null;

interface Size {
  w: number;
  h: number;
}

export function MorphingNav({
  active,
  onActivate,
  onClose,
}: {
  active: MenuKey;
  onActivate: (key: Exclude<MenuKey, null>) => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { categories } = useCatalog();
  const panelRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const closeTimer = useRef<number>();

  // Keep the morph target in sync with whichever menu is rendered.
  useEffect(() => {
    if (!active || !measureRef.current) return;
    const el = measureRef.current;
    const measure = () =>
      setSize({ w: el.scrollWidth, h: el.scrollHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  useEffect(() => {
    if (!active) {
      setPreview(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, onClose]);

  const cancelClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
  }, []);
  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    // Small grace period so the pointer can travel from trigger to panel.
    closeTimer.current = window.setTimeout(onClose, 140);
  }, [onClose]);

  const liveLookup = new Map(categories.map((c) => [c.slug, c]));

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <div
      className="relative hidden lg:block"
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <ul className="flex items-center gap-1">
        <NavTrigger
          label="Shop"
          expanded={active === 'shop'}
          onEnter={() => {
            cancelClose();
            onActivate('shop');
          }}
          onToggle={() => (active === 'shop' ? onClose() : onActivate('shop'))}
        />
        <li>
          <Link
            to="/about"
            className="link-underline inline-flex h-9 items-center px-3 text-[0.8125rem] tracking-wide text-bone-muted transition-colors hover:text-bone"
            onMouseEnter={onClose}
          >
            About
          </Link>
        </li>
        <NavTrigger
          label="Help"
          expanded={active === 'help'}
          onEnter={() => {
            cancelClose();
            onActivate('help');
          }}
          onToggle={() => (active === 'help' ? onClose() : onActivate('help'))}
        />
      </ul>

      {/* ---- The single morphing panel ---- */}
      <div
        className={cn(
          'absolute left-0 top-[calc(100%+0.75rem)] origin-top-left',
          'transition-[opacity,transform,width,height] duration-[var(--motion-normal)] ease-cinematic',
          active
            ? 'pointer-events-auto opacity-100 translate-y-0'
            : 'pointer-events-none opacity-0 -translate-y-1',
        )}
        style={{
          width: size && active ? size.w : undefined,
          height: size && active ? size.h : 0,
        }}
        aria-hidden={!active}
      >
        <div
          ref={panelRef}
          className="liquid-glass h-full w-full overflow-hidden rounded-2xl"
        >
          <div ref={measureRef} className="relative z-[2] w-max">
            {active === 'shop' && (
              <div
                key="shop"
                className="flex gap-8 p-7 animate-[blur-sharp_300ms_cubic-bezier(0.22,1,0.36,1)_both]"
              >
                <div className="w-[21rem]">
                  <p className="t-eyebrow mb-4">Shop by category</p>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                    {CATEGORY_DEFS.map((def) => {
                      const live = liveLookup.get(def.slug)?.live ?? false;
                      return (
                        <li key={def.slug}>
                          <button
                            type="button"
                            onClick={() => go(`/category/${def.slug}`)}
                            onMouseEnter={() => setPreview(def.image ?? null)}
                            onFocus={() => setPreview(def.image ?? null)}
                            className="group flex w-full items-center justify-between gap-2 rounded-md py-2 pr-1 text-left"
                          >
                            <span className="text-sm text-bone-muted transition-colors group-hover:text-bone">
                              {def.name}
                            </span>
                            {/* Truthful availability marker, driven by real counts */}
                            {live && (
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                                title="Shopping now"
                                aria-label="Available now"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-5 border-t border-line pt-4">
                    <button
                      type="button"
                      onClick={() => go('/shop')}
                      className="group inline-flex items-center gap-1.5 text-sm text-bone"
                    >
                      View everything
                      <ArrowUpRight
                        size={14}
                        className="btn-arrow transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </button>
                  </div>
                </div>

                {/* Preview pane crossfades as the pointer moves down the list */}
                <div className="relative h-[15rem] w-[11.5rem] shrink-0 overflow-hidden rounded-xl bg-ink-700">
                  {preview ? (
                    <div
                      key={preview}
                      className="absolute inset-0 animate-[fade-in_320ms_ease-out_both]"
                    >
                      <SmartImage
                        src={preview}
                        alt=""
                        objectPosition="center 25%"
                      />
                    </div>
                  ) : (
                    <div className="grid h-full place-items-center px-4 text-center">
                      <span className="font-display text-base italic leading-snug text-bone-dim">
                        Apna Store
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {active === 'help' && (
              <div
                key="help"
                className="w-[16rem] p-7 animate-[blur-sharp_300ms_cubic-bezier(0.22,1,0.36,1)_both]"
              >
                <p className="t-eyebrow mb-4">Customer care</p>
                <ul className="space-y-0.5">
                  {[
                    { label: 'Contact us', to: '/support' },
                    { label: 'Shipping', to: '/legal/shipping' },
                    { label: 'Returns & exchanges', to: '/legal/returns' },
                    { label: 'Privacy policy', to: '/legal/privacy' },
                    { label: 'Terms of use', to: '/legal/terms' },
                  ].map((item) => (
                    <li key={item.to}>
                      <button
                        type="button"
                        onClick={() => go(item.to)}
                        className="w-full rounded-md py-2 text-left text-sm text-bone-muted transition-colors hover:text-bone"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavTrigger({
  label,
  expanded,
  onEnter,
  onToggle,
}: {
  label: string;
  expanded: boolean;
  onEnter: () => void;
  onToggle: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        aria-haspopup="true"
        onMouseEnter={onEnter}
        onClick={onToggle}
        onFocus={onEnter}
        data-active={expanded}
        className={cn(
          'link-underline inline-flex h-9 items-center px-3 text-[0.8125rem] tracking-wide transition-colors',
          expanded ? 'text-bone' : 'text-bone-muted hover:text-bone',
        )}
      >
        {label}
      </button>
    </li>
  );
}
