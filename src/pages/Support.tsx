import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionItem } from '../components/ui/Accordion';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Reveal } from '../components/ui/Reveal';
import { useToast } from '../context/ToastProvider';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { setMeta } from '../lib/meta';

/* ==========================================================================
   SUPPORT / CONTACT (§43)
   The form validates properly and gives real feedback — but because no
   message service is connected, it never claims a message was delivered.
   ========================================================================== */

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Delivery timelines depend on your address and are confirmed at checkout. Once your parcel is collected, the real tracking status appears in your account.',
  },
  {
    q: 'Can I return something?',
    a: 'Yes. Our returns policy sets out the window, the condition items need to be in, and how long a refund takes.',
  },
  {
    q: 'How do I know my size?',
    a: 'Size options shown on a product page are the ones actually available for that piece. Where a product has specific fit notes, they appear in its description.',
  },
  {
    q: 'Is my payment information safe?',
    a: 'Payment details are handled over an encrypted connection by the payment provider. Apna Store does not store your card details.',
  },
];

export default function Support() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);

  useScrollReveal();

  useEffect(() => {
    setMeta({
      title: 'Support — Apna Store',
      description: 'Questions about an order, a return or a product? Reach the Apna Store team.',
    });
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Please tell us your name';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Enter a valid email address';
    if (!message.trim()) next.message = 'Please write a message';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setAttempted(true);
    toast('Message not sent', {
      tone: 'error',
      detail: 'The contact service isn’t connected yet.',
    });
  };

  return (
    <main id="main" className="bg-ink-800 pt-[var(--header-h)]">
      <header className="shell-wide border-b border-line py-12 sm:py-16">
        <p className="anim-fade t-eyebrow mb-4">Support</p>
        <h1 className="t-h1 text-bone">
          <span className="line-mask inline-block">
            <span style={{ animationDelay: '120ms' }}>How can we help?</span>
          </span>
        </h1>
      </header>

      <div className="shell-wide section-y">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* ---- Contact form ---- */}
          <section aria-labelledby="contact">
            <Reveal>
              <h2 id="contact" className="t-h2 mb-8 text-bone">
                Send a message
              </h2>
            </Reveal>

            <form onSubmit={submit} noValidate className="space-y-4">
              <Reveal index={1}>
                <Field
                  label="Your name"
                  value={name}
                  onChange={(v) => {
                    setName(v);
                    setErrors((e) => ({ ...e, name: '' }));
                  }}
                  error={errors.name}
                  required
                  autoComplete="name"
                />
              </Reveal>
              <Reveal index={2}>
                <Field
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(v) => {
                    setEmail(v);
                    setErrors((e) => ({ ...e, email: '' }));
                  }}
                  error={errors.email}
                  required
                  autoComplete="email"
                />
              </Reveal>
              <Reveal index={3}>
                <Field
                  label="Message"
                  value={message}
                  onChange={(v) => {
                    setMessage(v);
                    setErrors((e) => ({ ...e, message: '' }));
                  }}
                  error={errors.message}
                  required
                  multiline
                  rows={6}
                />
              </Reveal>

              <Reveal index={4}>
                <Button type="submit" size="lg">
                  Send message
                </Button>
              </Reveal>

              {attempted && (
                <div
                  role="alert"
                  className="surface animate-[fade-rise_280ms_ease-out_both] rounded-xl border-accent/30 p-5"
                >
                  <p className="text-sm font-medium text-bone">
                    Your message wasn’t sent
                  </p>
                  <p className="t-body mt-2 text-sm">
                    This form isn’t connected to a live support inbox in this
                    environment, so nothing was delivered. We’d rather tell you
                    that than show a success message that isn’t true.
                  </p>
                </div>
              )}
            </form>
          </section>

          {/* ---- FAQs ---- */}
          <section aria-labelledby="faq">
            <Reveal>
              <h2 id="faq" className="t-h2 mb-8 text-bone">
                Common questions
              </h2>
            </Reveal>

            <Reveal index={1}>
              <Accordion>
                {FAQS.map((f) => (
                  <AccordionItem key={f.q} title={f.q}>
                    <p>{f.a}</p>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>

            <Reveal index={2}>
              <div className="mt-10 space-y-2 text-sm">
                <p className="t-eyebrow mb-3">Policies</p>
                {[
                  { label: 'Shipping policy', to: '/legal/shipping' },
                  { label: 'Returns & exchanges', to: '/legal/returns' },
                  { label: 'Privacy policy', to: '/legal/privacy' },
                  { label: 'Terms of use', to: '/legal/terms' },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="link-underline block text-bone-muted transition-colors hover:text-bone"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </Reveal>
          </section>
        </div>
      </div>
    </main>
  );
}
