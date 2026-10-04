import { Link } from 'react-router-dom';
import {
  Bell,
  Crown,
  Heart,
  Package,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useStore } from '../../context/StoreProvider';
import { useToast } from '../../context/ToastProvider';
import { isBackendConfigured } from '../../lib/supabase';
import { formatPrice } from '../../lib/format';
import { EmptyState } from '../../components/ui/EmptyState';
import { SmartImage } from '../../components/ui/SmartImage';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { useState } from 'react';

/* ==========================================================================
   ACCOUNT PANELS
   Orders, wallet, notifications and membership are all server-owned. With
   no account backend connected there is genuinely nothing to show, and each
   panel says so plainly rather than rendering invented history (§32, §62).
   ========================================================================== */

function SignedOutNotice({ what }: { what: string }) {
  return (
    <EmptyState
      figure="—"
      title={`${what} need an account`}
      description={
        isBackendConfigured
          ? `Sign in to see your ${what.toLowerCase()}.`
          : `Accounts aren’t connected in this environment, so there is no real ${what.toLowerCase()} to display. Nothing is being simulated here.`
      }
      action={{ label: 'Browse the collection', to: '/shop' }}
    />
  );
}

function PanelHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="mb-8">
      <h2 className="t-h2 text-bone">{title}</h2>
      {sub && <p className="t-body mt-2">{sub}</p>}
    </header>
  );
}

/* ----------------------------------------------------------- profile -- */
export function ProfilePanel() {
  const { bagCount, wishlistCount } = useStore();

  const stats = [
    { label: 'In your bag', value: bagCount, to: '/bag' },
    { label: 'Saved items', value: wishlistCount, to: '/account/wishlist' },
  ];

  return (
    <div>
      <PanelHead
        title="Your profile"
        sub="Everything about your Apna Store account in one place."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            to={s.to}
            data-reveal="rise"
            style={{ ['--reveal-delay' as string]: `${i * 80}ms` }}
            className="surface hover-lift group rounded-xl p-6 transition-colors hover:border-line-strong"
          >
            <p className="t-eyebrow">{s.label}</p>
            <p className="mt-3 font-display text-4xl tabular-nums text-bone">
              {s.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="surface mt-4 rounded-xl p-6" data-reveal="rise">
        <h3 className="t-eyebrow mb-4">Account details</h3>
        {isBackendConfigured ? (
          <p className="t-body">Sign in to view and edit your details.</p>
        ) : (
          <p className="t-body">
            Account details are stored by the Apna Store backend, which isn’t
            connected in this environment. No placeholder profile is shown
            here on purpose.
          </p>
        )}
        <div className="mt-6">
          <ButtonLink to="/support" variant="outline" size="sm">
            Need help?
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ orders -- */
export function OrdersPanel() {
  return (
    <div>
      <PanelHead title="My orders" />
      {/* Order history, AWB, courier and delivery status are real backend
          facts. Nothing is fabricated here (§32, §64). */}
      <EmptyState
        figure={<Package size={38} strokeWidth={0.9} />}
        title="No orders to show"
        description={
          isBackendConfigured
            ? 'Once you place an order it will appear here with its real status and tracking details.'
            : 'Order history comes from the Apna Store backend, which isn’t connected in this environment. No sample orders, tracking numbers or courier details are shown.'
        }
        action={{ label: 'Start shopping', to: '/shop' }}
      />
    </div>
  );
}

/* ---------------------------------------------------------- wishlist -- */
export function WishlistPanel() {
  const { wishlist, removeFromWishlist, addToBag } = useStore();
  const { toast } = useToast();

  if (wishlist.length === 0) {
    return (
      <div>
        <PanelHead title="Wishlist" />
        <EmptyState
          figure={<Heart size={38} strokeWidth={0.9} />}
          title="Nothing saved yet"
          description="Tap the heart on any piece to keep it here while you decide."
          action={{ label: 'Browse the collection', to: '/shop' }}
        />
      </div>
    );
  }

  return (
    <div>
      <PanelHead
        title="Wishlist"
        sub={`${wishlist.length} saved ${wishlist.length === 1 ? 'piece' : 'pieces'}`}
      />

      <ul className="grid gap-4 sm:grid-cols-2">
        {wishlist.map((item, i) => (
          <li
            key={item.productId}
            data-reveal="rise"
            style={{ ['--reveal-delay' as string]: `${i * 70}ms` }}
            className="surface flex gap-4 rounded-xl p-4"
          >
            <Link
              to={`/product/${item.slug}`}
              className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-lg bg-ink-700"
            >
              {item.image && (
                <SmartImage src={item.image} alt={item.name} objectPosition="center 20%" />
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                to={`/product/${item.slug}`}
                className="text-sm leading-snug text-bone hover:underline"
              >
                {item.name}
              </Link>
              <p className="t-meta mt-1 tabular-nums">{formatPrice(item.price)}</p>

              <div className="mt-auto flex flex-wrap gap-2 pt-3">
                <Button
                  size="sm"
                  onClick={() => {
                    addToBag({
                      id: item.productId,
                      slug: item.slug,
                      name: item.name,
                      price: item.price,
                      currency: 'INR',
                      categorySlug: '',
                      images: item.image
                        ? [{ url: item.image, alt: item.name }]
                        : [],
                      inStock: null,
                    });
                    removeFromWishlist(item.productId);
                    toast('Moved to bag', { detail: item.name });
                  }}
                >
                  Move to bag
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    removeFromWishlist(item.productId);
                    toast('Removed from wishlist', { tone: 'info', detail: item.name });
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------ wallet -- */
export function WalletPanel() {
  return (
    <div>
      <PanelHead title="Wallet" />
      <EmptyState
        figure={<WalletIcon size={38} strokeWidth={0.9} />}
        title="No wallet activity"
        description={
          isBackendConfigured
            ? 'Credits, refunds and wallet transactions will appear here.'
            : 'Wallet balances and transactions are held by the backend, which isn’t connected in this environment. No balance is being displayed.'
        }
      />
    </div>
  );
}

/* ----------------------------------------------------- notifications -- */
export function NotificationsPanel() {
  return (
    <div>
      <PanelHead title="Notifications" />
      <EmptyState
        figure={<Bell size={38} strokeWidth={0.9} />}
        title="You’re all caught up"
        description={
          isBackendConfigured
            ? 'Order updates and account notices will appear here.'
            : 'Notifications are delivered by the backend, which isn’t connected in this environment.'
        }
      />
    </div>
  );
}

/* -------------------------------------------------------- membership -- */
export function MembershipPanel() {
  return (
    <div>
      <PanelHead title="Membership" />
      <EmptyState
        figure={<Crown size={36} strokeWidth={0.9} />}
        title="No membership on this account"
        description={
          isBackendConfigured
            ? 'Membership status and benefits will appear here once active.'
            : 'Membership is managed by the backend, which isn’t connected in this environment. No tier or benefits are being invented here.'
        }
        action={{ label: 'Talk to support', to: '/support' }}
      />
    </div>
  );
}

/* ----------------------------------------------------------- support -- */
export function AccountSupportPanel() {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  return (
    <div>
      <PanelHead
        title="Support"
        sub="Tell us what’s happening and we’ll pick it up."
      />

      <div className="surface rounded-xl p-6" data-reveal="rise">
        <Field
          label="How can we help?"
          value={message}
          onChange={setMessage}
          multiline
          rows={5}
        />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            disabled={!message.trim() || sent}
            onClick={() => {
              // No message service is connected, so we don't claim delivery.
              setSent(true);
              toast('Message not sent', {
                tone: 'error',
                detail: 'Support messaging isn’t connected yet.',
              });
            }}
          >
            Send message
          </Button>
          <ButtonLink to="/support" variant="ghost" size="sm">
            Other ways to reach us
          </ButtonLink>
        </div>

        {sent && (
          <p role="alert" className="mt-4 text-xs leading-relaxed text-accent">
            This form isn’t wired to a live support inbox in this environment,
            so your message was not delivered. Please use the contact details
            on the support page instead.
          </p>
        )}
      </div>
    </div>
  );
}

export { SignedOutNotice };
