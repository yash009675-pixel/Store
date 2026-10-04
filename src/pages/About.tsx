import { useEffect } from 'react';
import { Reveal, LineReveal } from '../components/ui/Reveal';
import { SmartImage } from '../components/ui/SmartImage';
import { ButtonLink } from '../components/ui/Button';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { revealDelay } from '../hooks/useScrollReveal';
import { setMeta } from '../lib/meta';

/* ==========================================================================
   ABOUT (§42)
   An editorial brand page. It describes how the store operates and what it
   values — it does not claim a history, awards or certifications.
   ========================================================================== */

const VALUES = [
  {
    title: 'Chosen narrowly',
    body: 'We would rather carry a short list we believe in than a long one we can’t vouch for.',
  },
  {
    title: 'Honest description',
    body: 'Fabric, fit and finish described as they are. If something runs small, we say so.',
  },
  {
    title: 'Priced plainly',
    body: 'No invented discounts and no struck-through prices that were never charged.',
  },
  {
    title: 'Answered by people',
    body: 'Questions reach a real person who can look at your order and help.',
  },
];

export default function About() {
  useScrollReveal();

  useEffect(() => {
    setMeta({
      title: 'About — Apna Store',
      description:
        'How Apna Store chooses what it sells, and the standards we hold ourselves to.',
    });
  }, []);

  return (
    <main id="main" className="bg-ink-800">
      {/* ---- Hero ---- */}
      <header className="relative isolate flex min-h-[70vh] items-end overflow-hidden bg-ink-900 pt-[var(--header-h)]">
        <div className="absolute inset-0 -z-10">
          <SmartImage
            src="/media/lookbook-1.jpg"
            alt=""
            objectPosition="center 30%"
            priority
          />
        </div>
        <div className="scrim scrim-bottom -z-10" aria-hidden="true" />

        <div className="shell-wide pb-14 sm:pb-20">
          <p className="anim-fade t-eyebrow mb-5">About</p>
          <h1 className="t-display max-w-[14ch] text-bone">
            <LineReveal lines={['A smaller,', 'better list.']} delay={260} step={130} />
          </h1>
        </div>
      </header>

      {/* ---- Introduction ---- */}
      <section className="section-y" aria-labelledby="story">
        <div className="shell-wide grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
          <Reveal>
            <h2 id="story" className="t-h2 text-bone">
              Why we started
            </h2>
          </Reveal>
          <div>
            <Reveal index={1}>
              <p className="t-lead">
                Shopping online had become exhausting. Endless grids, prices
                that moved for no reason, and descriptions that told you
                nothing useful about what you were actually buying.
              </p>
            </Reveal>
            <Reveal index={2}>
              <p className="t-body mt-5">
                Apna Store is our answer to that. We keep the selection small
                enough that a person can genuinely stand behind every piece in
                it. We write descriptions we would want to read. And we try to
                make the whole experience quieter — fewer banners, fewer
                countdowns, more room to think.
              </p>
            </Reveal>
            <Reveal index={3}>
              <p className="t-body mt-4">
                It is a work in progress, and we would rather grow slowly and
                get it right.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Visual story ---- */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="scene-seam" aria-hidden="true" />
        <div className="shell-wide pb-[var(--section-y)]">
          <div className="grid gap-4 sm:grid-cols-12 sm:gap-6">
            <Reveal kind="image" className="sm:col-span-5">
              <figure className="hover-zoom relative aspect-[3/4] overflow-hidden rounded-xl">
                <SmartImage
                  src="/media/editorial-craft.jpg"
                  alt="Hands working thread at a traditional handloom"
                  objectPosition="center 50%"
                />
              </figure>
            </Reveal>
            <Reveal kind="image" index={1} className="sm:col-span-7 sm:mt-20">
              <figure className="hover-zoom relative aspect-[4/3] overflow-hidden rounded-xl">
                <SmartImage
                  src="/media/lookbook-2.jpg"
                  alt="Models walking down a dim corridor in flowing garments"
                  objectPosition="center 40%"
                />
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Values ---- */}
      <section className="section-y" aria-labelledby="values">
        <div className="shell-wide">
          <Reveal>
            <h2 id="values" className="t-h2 mb-12 text-bone">
              What we hold to
            </h2>
          </Reveal>

          <ul className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <li
                key={v.title}
                data-reveal="rise"
                style={revealDelay(i, 80)}
                className="bg-ink-800 p-7 sm:p-9"
              >
                <span className="font-display text-2xl text-bone-dim">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="t-h3 mt-3 text-bone">{v.title}</h3>
                <p className="t-body mt-3">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="border-t border-line bg-ink-900">
        <div className="shell-wide section-y text-center">
          <Reveal>
            <h2 className="t-h1 mx-auto max-w-[18ch] text-bone">
              Have a look around.
            </h2>
          </Reveal>
          <Reveal index={1}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/shop" size="lg">
                Shop collection
              </ButtonLink>
              <ButtonLink to="/support" variant="outline" size="lg">
                Contact us
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
