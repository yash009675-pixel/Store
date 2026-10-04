import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useStore } from '../../context/StoreProvider';
import { MorphingNav, type MenuKey } from './MorphingNav';
import { MobileMenu } from './MobileMenu';
import { SearchOverlay } from './SearchOverlay';

/* ==========================================================================
   GLOBAL HEADER (§12)
   Integrated with the hero at the top of immersive pages, then transitions
   into a liquid-glass surface on scroll. One header for the whole site.
   ========================================================================== */

/** Routes that open with a full-bleed visual the header should float over. */
const IMMERSIVE_ROUTES = ['/', '/about'];

export function Header() {
  const location = useLocation();
  const { bagCount, wishlistCount, openBag } = useStore();

  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagPulse, setBagPulse] = useState(false);

  const immersive =
    IMMERSIVE_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith('/category/');

  // Solid surface as soon as the hero starts leaving the viewport.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close every overlay on navigation.
  useEffect(() => {
    setMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Count badge animates only when the number actually changes.
  useEffect(() => {
    if (bagCount === 0) return;
    setBagPulse(true);
    const t = setTimeout(() => setBagPulse(false), 450);
    return () => clearTimeout(t);
  }, [bagCount]);

  // Cmd/Ctrl+K opens search — standard, discoverable, keyboard-first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const solid = scrolled || !immersive || menu !== null;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-bone focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-ink-900"
      >
        Skip to content
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-header transition-[background-color,box-shadow,backdrop-filter] duration-[var(--motion-normal)] ease-premium',
          solid
            ? 'header-solid border-b border-line'
            : 'bg-transparent',
        )}
      >
        {/* Gradient guarantees logo/nav contrast over bright hero frames (§73) */}
        {!solid && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink-900/75 to-transparent"
          />
        )}

        <div className="shell-wide relative flex h-[var(--header-h)] items-center justify-between gap-4">
          {/* ---- Left: brand + desktop nav ---- */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="group relative shrink-0"
              aria-label="Apna Store — home"
            >
              <span className="font-display text-[1.375rem] leading-none tracking-tight text-bone transition-opacity group-hover:opacity-80 sm:text-2xl">
                Apna
              </span>
              <span className="ml-1.5 text-[0.6875rem] font-medium uppercase tracking-wide3 text-bone-dim transition-colors group-hover:text-bone-muted">
                Store
              </span>
            </Link>

            <MorphingNav
              active={menu}
              onActivate={setMenu}
              onClose={() => setMenu(null)}
            />
          </div>

          {/* ---- Right: actions ---- */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <NavLink
              to="/shop"
              className={({ isActive }) =>
                cn(
                  'link-underline mr-2 hidden h-9 items-center px-3 text-[0.8125rem] tracking-wide transition-colors lg:inline-flex',
                  isActive ? 'text-bone' : 'text-bone-muted hover:text-bone',
                )
              }
            >
              All products
            </NavLink>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="icon-btn"
              aria-label="Search products"
            >
              <Search size={18} strokeWidth={1.6} />
            </button>

            <Link
              to="/account/wishlist"
              className="icon-btn relative hidden sm:inline-flex"
              aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'}`}
            >
              <Heart size={18} strokeWidth={1.6} />
              {wishlistCount > 0 && <CountDot value={wishlistCount} />}
            </Link>

            <Link
              to="/account"
              className="icon-btn hidden sm:inline-flex"
              aria-label="Your account"
            >
              <User size={18} strokeWidth={1.6} />
            </Link>

            <button
              type="button"
              onClick={openBag}
              className="icon-btn relative"
              aria-label={`Open bag, ${bagCount} ${bagCount === 1 ? 'item' : 'items'}`}
            >
              <ShoppingBag size={18} strokeWidth={1.6} />
              {bagCount > 0 && <CountDot value={bagCount} pulse={bagPulse} />}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="icon-btn lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={20} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function CountDot({ value, pulse }: { value: number; pulse?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute right-1 top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-bone px-1 text-[0.625rem] font-semibold leading-none text-ink-900 transition-transform duration-[var(--motion-fast)] ease-premium',
        pulse && 'scale-125',
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  );
}
