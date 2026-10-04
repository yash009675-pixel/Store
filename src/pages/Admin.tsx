import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { isBackendConfigured } from '../lib/supabase';
import { useCatalog } from '../context/CatalogProvider';
import { Reveal } from '../components/ui/Reveal';
import { ButtonLink } from '../components/ui/Button';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { setMeta } from '../lib/meta';

/* ==========================================================================
   ADMIN (§59, §61)
   --------------------------------------------------------------------------
   SECURITY NOTE — read before extending this file.

   This route renders nothing privileged. Admin data and admin actions must
   be gated on the server (RLS / row policies / an authorised role check),
   never by hiding a React component. A client-side `if (isAdmin)` is a
   cosmetic lock on a glass door: the bundle ships to everyone.

   So while no authenticated admin session exists, this page shows the
   locked state and no business data at all. It does not invent revenue,
   order counts, customers or inventory figures.
   ========================================================================== */

const MODULES = [
  'Business insights',
  'Search analytics',
  'Product management',
  'Order management',
  'Logistics',
  'Inventory',
  'Store management',
  'Customer analytics',
];

export default function Admin() {
  const { products, status } = useCatalog();
  useScrollReveal([status]);

  useEffect(() => {
    setMeta({ title: 'Admin — Apna Store' });
  }, []);

  return (
    <main id="main" className="min-h-app bg-ink-800 pt-[var(--header-h)]">
      <header className="shell-wide border-b border-line py-12 sm:py-16">
        <p className="anim-fade t-eyebrow mb-4">Internal</p>
        <h1 className="t-h1 text-bone">
          <span className="line-mask inline-block">
            <span style={{ animationDelay: '120ms' }}>Admin</span>
          </span>
        </h1>
      </header>

      <div className="shell-wide section-y">
        <Reveal>
          <div className="surface mx-auto max-w-2xl rounded-2xl p-7 text-center sm:p-10">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-line text-bone-dim">
              <Lock size={18} />
            </span>

            <h2 className="t-h3 mt-6 text-bone">Authentication required</h2>

            <p className="t-body mx-auto mt-4 max-w-prose2">
              {isBackendConfigured
                ? 'Sign in with an authorised account to open the admin panel. Access is verified on the server.'
                : 'No authentication backend is connected in this environment, so there is no admin session to verify and no business data to display.'}
            </p>

            <p className="t-meta mx-auto mt-5 max-w-prose2">
              Admin access must be enforced by server-side authorisation.
              Hiding this interface in the browser is not a security control.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/" variant="outline">
                Back to store
              </ButtonLink>
            </div>
          </div>
        </Reveal>

        {/* Module map — structure only, carrying no business figures */}
        <div className="mx-auto mt-14 max-w-4xl">
          <Reveal>
            <h2 className="t-eyebrow mb-6 text-center">
              Modules available once authorised
            </h2>
          </Reveal>

          <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m, i) => (
              <li
                key={m}
                data-reveal="rise"
                style={{ ['--reveal-delay' as string]: `${i * 55}ms` }}
                className="bg-ink-800 p-5"
              >
                <p className="text-sm text-bone-muted">{m}</p>
              </li>
            ))}
          </ul>

          <Reveal index={2}>
            <p className="t-meta mt-6 text-center">
              {status === 'ready'
                ? `Catalogue currently reachable: ${products.length} ${products.length === 1 ? 'product' : 'products'}.`
                : 'Catalogue connection: not configured.'}{' '}
              <Link to="/support" className="link-underline text-bone-muted hover:text-bone">
                Need access?
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
