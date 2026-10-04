import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Check, Lock, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/cn';
import { useStore } from '../context/StoreProvider';
import { formatPrice } from '../lib/format';
import { isBackendConfigured } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { setMeta } from '../lib/meta';

/* ==========================================================================
   CHECKOUT (§31, §63)
   Clarity over choreography. Motion is limited to step transitions and
   validation feedback.

   CRITICAL: no payment provider is connected in this environment, so this
   flow stops at the payment step and says so. It never renders "payment
   successful" or an order confirmation that didn't happen.
   ========================================================================== */

const STEPS = ['Contact', 'Delivery', 'Payment'] as const;

interface Form {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
}

const BLANK: Form = {
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  pincode: '',
};

export default function Checkout() {
  const { bag, bagSubtotal, bagCount } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  useEffect(() => {
    setMeta({ title: 'Checkout — Apna Store' });
  }, []);

  if (bag.length === 0) return <Navigate to="/bag" replace />;

  const set = (key: keyof Form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (which: 0 | 1): boolean => {
    const next: Partial<Record<keyof Form, string>> = {};

    if (which === 0) {
      if (!form.email.trim()) next.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        next.email = 'Enter a valid email address';
      if (!form.phone.trim()) next.phone = 'Phone number is required';
      else if (!/^[0-9+\-\s()]{8,15}$/.test(form.phone))
        next.phone = 'Enter a valid phone number';
    } else {
      if (!form.firstName.trim()) next.firstName = 'First name is required';
      if (!form.lastName.trim()) next.lastName = 'Last name is required';
      if (!form.address1.trim()) next.address1 = 'Address is required';
      if (!form.city.trim()) next.city = 'City is required';
      if (!form.state.trim()) next.state = 'State is required';
      if (!form.pincode.trim()) next.pincode = 'PIN code is required';
      else if (!/^\d{6}$/.test(form.pincode.trim()))
        next.pincode = 'PIN code should be 6 digits';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const advance = () => {
    if (step === 0 && !validate(0)) return;
    if (step === 1 && !validate(1)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <main id="main" className="bg-ink-800 pt-[var(--header-h)]">
      <header className="shell-wide border-b border-line py-10 sm:py-14">
        <Link to="/bag" className="t-eyebrow mb-4 inline-block hover:text-bone">
          ← Back to bag
        </Link>
        <h1 className="t-h1 text-bone">Checkout</h1>
      </header>

      <div className="shell-wide section-y">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          <div>
            {/* ---- Step indicator ---- */}
            <ol className="mb-10 flex items-center gap-2" aria-label="Checkout progress">
              {STEPS.map((label, i) => (
                <li key={label} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      'grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs tabular-nums transition-all duration-[var(--motion-normal)] ease-premium',
                      i < step && 'border-bone bg-bone text-ink-900',
                      i === step && 'border-bone text-bone',
                      i > step && 'border-line text-bone-dim',
                    )}
                    aria-current={i === step ? 'step' : undefined}
                  >
                    {i < step ? <Check size={13} /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      'hidden text-xs tracking-wide sm:inline',
                      i <= step ? 'text-bone' : 'text-bone-dim',
                    )}
                  >
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      className={cn(
                        'h-px flex-1 transition-colors duration-[var(--motion-normal)]',
                        i < step ? 'bg-bone/50' : 'bg-line',
                      )}
                    />
                  )}
                </li>
              ))}
            </ol>

            {/* ---- Step panes ---- */}
            <div key={step} className="animate-[fade-rise_380ms_cubic-bezier(0.22,1,0.36,1)_both]">
              {step === 0 && (
                <section aria-labelledby="s0">
                  <h2 id="s0" className="t-h3 mb-6 text-bone">
                    Contact details
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Email address"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={set('email')}
                      error={errors.email}
                      className="sm:col-span-2"
                    />
                    <Field
                      label="Phone number"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      error={errors.phone}
                      className="sm:col-span-2"
                    />
                  </div>
                  <p className="t-meta mt-4">
                    We’ll use these only to send order updates.
                  </p>
                </section>
              )}

              {step === 1 && (
                <section aria-labelledby="s1">
                  <h2 id="s1" className="t-h3 mb-6 text-bone">
                    Delivery address
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="First name"
                      autoComplete="given-name"
                      value={form.firstName}
                      onChange={set('firstName')}
                      error={errors.firstName}
                    />
                    <Field
                      label="Last name"
                      autoComplete="family-name"
                      value={form.lastName}
                      onChange={set('lastName')}
                      error={errors.lastName}
                    />
                    <Field
                      label="Address"
                      autoComplete="address-line1"
                      value={form.address1}
                      onChange={set('address1')}
                      error={errors.address1}
                      className="sm:col-span-2"
                    />
                    <Field
                      label="Apartment, landmark (optional)"
                      autoComplete="address-line2"
                      value={form.address2}
                      onChange={set('address2')}
                      className="sm:col-span-2"
                    />
                    <Field
                      label="City"
                      autoComplete="address-level2"
                      value={form.city}
                      onChange={set('city')}
                      error={errors.city}
                    />
                    <Field
                      label="State"
                      autoComplete="address-level1"
                      value={form.state}
                      onChange={set('state')}
                      error={errors.state}
                    />
                    <Field
                      label="PIN code"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={form.pincode}
                      onChange={set('pincode')}
                      error={errors.pincode}
                    />
                  </div>
                </section>
              )}

              {step === 2 && (
                <section aria-labelledby="s2">
                  <h2 id="s2" className="t-h3 mb-6 text-bone">
                    Payment
                  </h2>

                  {/* The honest stop. No fake success, ever. */}
                  <div
                    role="status"
                    className="surface rounded-xl border-accent/30 p-6 sm:p-8"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 text-accent">
                      <ShieldAlert size={18} />
                    </span>
                    <h3 className="t-h3 mt-5 text-bone">
                      Payment isn’t connected yet
                    </h3>
                    <p className="t-body mt-3 max-w-prose2">
                      This storefront is not linked to a live payment gateway
                      {isBackendConfigured ? '' : ' or order backend'} in this
                      environment. Your bag and details are safe, but no
                      payment can be taken and no order can be placed — so
                      nothing here will tell you it succeeded.
                    </p>
                    <p className="t-meta mt-4">
                      Connect a payment provider and order service to complete
                      this step.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back to delivery
                      </Button>
                      <Link to="/support" className="btn btn-ghost">
                        Contact support
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {step < 2 && (
              <div className="mt-8 flex items-center gap-3">
                {step > 0 && (
                  <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </Button>
                )}
                <Button onClick={advance} size="lg" className="ml-auto">
                  Continue
                </Button>
              </div>
            )}
          </div>

          {/* ---- Order summary ---- */}
          <aside className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
            <div className="surface rounded-xl p-6">
              <h2 className="t-eyebrow mb-5">
                Order summary ({bagCount} {bagCount === 1 ? 'item' : 'items'})
              </h2>

              <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {bag.map((line) => (
                  <li key={line.key} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 text-bone-muted">
                      <span className="block truncate text-bone">{line.name}</span>
                      <span className="text-xs text-bone-dim">
                        {[line.color, line.size, `× ${line.quantity}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums text-bone">
                      {formatPrice(line.price * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-bone-muted">Subtotal</span>
                  <span className="tabular-nums text-bone">
                    {formatPrice(bagSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bone-muted">Shipping</span>
                  <span className="text-bone-dim">Not yet calculated</span>
                </div>
              </div>

              <p className="t-meta mt-5 flex items-center gap-2">
                <Lock size={12} aria-hidden="true" />
                Your details are sent over an encrypted connection.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
