import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORY_DEFS } from '../../lib/categories';
import { Reveal } from '../ui/Reveal';

/* ==========================================================================
   FOOTER (§82)
   Every link here resolves to a route that genuinely exists — no dead links.
   ========================================================================== */

const GROUPS = [
  {
    title: 'Shop',
    links: CATEGORY_DEFS.slice(0, 5).map((c) => ({
      label: c.name,
      to: `/category/${c.slug}`,
    })),
  },
  {
    title: 'Account',
    links: [
      { label: 'Your account', to: '/account' },
      { label: 'Orders', to: '/account/orders' },
      { label: 'Wishlist', to: '/account/wishlist' },
      { label: 'Wallet', to: '/account/wallet' },
      { label: 'Notifications', to: '/account/notifications' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact', to: '/support' },
      { label: 'Shipping', to: '/legal/shipping' },
      { label: 'Returns', to: '/legal/returns' },
      { label: 'Privacy', to: '/legal/privacy' },
      { label: 'Terms', to: '/legal/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink-900">
      <div className="shell-wide py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          {/* ---- Brand block ---- */}
          <Reveal>
            <Link to="/" className="inline-flex items-baseline">
              <span className="font-display text-3xl leading-none tracking-tight text-bone sm:text-4xl">
                Apna
              </span>
              <span className="ml-2 text-xs font-medium uppercase tracking-wide3 text-bone-dim">
                Store
              </span>
            </Link>
            <p className="t-body mt-5 max-w-sm">
              Style that feels like you. Considered pieces, honest fabric and a
              shopping experience built to be calm.
            </p>

            <Link
              to="/about"
              className="group mt-7 inline-flex items-center gap-1.5 text-sm text-bone"
            >
              <span className="link-underline">Read our story</span>
              <ArrowUpRight
                size={14}
                className="transition-transform duration-[var(--motion-normal)] ease-premium group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </Reveal>

          {/* ---- Link groups ---- */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {GROUPS.map((group, gi) => (
              <Reveal key={group.title} index={gi + 1}>
                <h2 className="t-eyebrow mb-4">{group.title}</h2>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="link-underline text-sm text-bone-muted transition-colors hover:text-bone"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-meta">
            © {new Date().getFullYear()} Apna Store. All rights reserved.
          </p>
          <p className="t-meta">Made in India</p>
        </div>
      </div>
    </footer>
  );
}
