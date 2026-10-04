import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Bell,
  Crown,
  Heart,
  LifeBuoy,
  Package,
  User,
  Wallet,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { useStore } from '../context/StoreProvider';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { setMeta } from '../lib/meta';

/* ==========================================================================
   ACCOUNT SHELL (§33, §34)
   Same typography, buttons, surfaces and motion as the storefront — this is
   not a separate dashboard theme. Navigation is labelled text, never
   icon-only squares.
   ========================================================================== */

const NAV = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/orders', label: 'My orders', icon: Package },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/wallet', label: 'Wallet', icon: Wallet },
  { to: '/account/notifications', label: 'Notifications', icon: Bell },
  { to: '/account/membership', label: 'Membership', icon: Crown },
  { to: '/account/support', label: 'Support', icon: LifeBuoy },
];

export default function Account() {
  const { wishlistCount } = useStore();
  const location = useLocation();
  useScrollReveal([location.pathname]);

  useEffect(() => {
    setMeta({ title: 'Your account — Apna Store' });
  }, []);

  return (
    <main id="main" className="bg-ink-800 pt-[var(--header-h)]">
      <header className="shell-wide border-b border-line py-12 sm:py-16">
        <p className="anim-fade t-eyebrow mb-4">Account</p>
        <h1 className="t-h1 text-bone">
          <span className="line-mask inline-block">
            <span style={{ animationDelay: '120ms' }}>Shopping, made personal.</span>
          </span>
        </h1>
      </header>

      <div className="shell-wide section-y">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          {/* ---- Sidebar: horizontal rail on mobile, column on desktop ---- */}
          <nav aria-label="Account" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
            <ul className="no-scrollbar -mx-[var(--shell-pad)] flex gap-2 overflow-x-auto px-[var(--shell-pad)] pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
              {NAV.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={item.to} className="shrink-0 lg:shrink">
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'group flex min-h-[44px] items-center gap-2.5 whitespace-nowrap rounded-full px-4 text-sm transition-all duration-[var(--motion-fast)] ease-premium lg:rounded-lg lg:px-3',
                          isActive
                            ? 'bg-bone text-ink-900 lg:bg-ink-700 lg:text-bone'
                            : 'text-bone-muted hover:bg-bone/5 hover:text-bone',
                        )
                      }
                      style={{
                        animation: `fade-rise 420ms cubic-bezier(0.22,1,0.36,1) ${i * 45}ms both`,
                      }}
                    >
                      <Icon size={15} strokeWidth={1.7} aria-hidden="true" />
                      {item.label}
                      {item.to === '/account/wishlist' && wishlistCount > 0 && (
                        <span className="ml-auto hidden text-xs tabular-nums opacity-70 lg:inline">
                          {wishlistCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            key={location.pathname}
            className="min-w-0 animate-[fade-rise_420ms_cubic-bezier(0.22,1,0.36,1)_both]"
          >
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
