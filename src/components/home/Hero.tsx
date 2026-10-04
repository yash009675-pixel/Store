import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import { LineReveal } from '../ui/Reveal';
import { MagneticButtonLink } from '../ui/Button';
import { useReducedMotion } from '../../hooks/useMotionPrefs';

/* ==========================================================================
   HERO (§15, §18, §19)
   A slow editorial carousel: crossfade + a very gentle scale drift, long
   enough to actually read each frame. Swipe, arrow keys, dot controls and a
   pause affordance are all supported; autoplay stops when the tab is hidden
   or the pointer is inside, and never starts under reduced motion.

   VIDEO (§16): drop a file at /media/hero.mp4 and set HERO_VIDEO to its
   path — the hero will use it as the first scene with these stills as the
   poster/fallback. Left unset because no such asset exists in the project.
   ========================================================================== */

const HERO_VIDEO: string | null = null;

const SLIDES = [
  {
    src: '/media/hero-1.jpg',
    alt: 'A model walking in a studio wearing a flowing deep-toned outfit',
    position: 'center 30%',
  },
  {
    src: '/media/hero-2.jpg',
    alt: 'A model in a minimal tailored overcoat in a shadowed interior',
    position: 'center 25%',
  },
  {
    src: '/media/hero-3.jpg',
    alt: 'Close detail of richly textured woven fabric catching the light',
    position: 'center 45%',
  },
];

const INTERVAL = 6400;

export function Hero() {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(() => SLIDES.map(() => false));
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const touchStart = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  const go = useCallback((next: number) => {
    setActive((next + SLIDES.length) % SLIDES.length);
  }, []);

  // Preload every frame up front so a transition never shows a blank panel.
  useEffect(() => {
    SLIDES.forEach((slide, i) => {
      const img = new Image();
      img.src = slide.src;
      const done = () =>
        setLoaded((prev) => {
          if (prev[i]) return prev;
          const next = [...prev];
          next[i] = true;
          return next;
        });
      if (img.complete) done();
      else {
        img.onload = done;
        img.onerror = done;
      }
    });
  }, []);

  // Autoplay — disabled for reduced motion, while paused, or when hidden.
  useEffect(() => {
    if (reduced || paused || SLIDES.length < 2) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        setActive((a) => (a + 1) % SLIDES.length);
      }
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, [reduced, paused]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(active + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(active - 1);
    }
  };

  return (
    <section
      className="relative isolate flex min-h-[640px] flex-col justify-end overflow-hidden bg-ink-900"
      style={{ height: 'var(--app-vh)' }}
      aria-label="Apna Store — new season"
    >
      {/* ---- Scene layer ---- */}
      <div
        ref={regionRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Seasonal imagery"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(dx) > 48) go(active + (dx < 0 ? 1 : -1));
          touchStart.current = null;
        }}
        className="absolute inset-0 focus-visible:outline-none"
      >
        {HERO_VIDEO ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster={SLIDES[0].src}
            aria-hidden="true"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        ) : (
          SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              aria-hidden={i !== active}
              className={cn(
                'absolute inset-0 transition-opacity ease-cinematic',
                i === active ? 'opacity-100' : 'opacity-0',
              )}
              style={{ transitionDuration: 'var(--motion-scene)' }}
            >
              <img
                src={slide.src}
                alt={i === active ? slide.alt : ''}
                {...{ fetchpriority: i === 0 ? 'high' : 'low' }}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className={cn(
                  'h-full w-full object-cover',
                  // Very slow drift — motion you feel rather than notice.
                  !reduced && i === active && 'animate-[hero-drift_9s_linear_both]',
                )}
                style={{ objectPosition: slide.position }}
              />
            </div>
          ))
        )}

        {!loaded[active] && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      </div>

      {/* ---- Readability scrim (§73) ---- */}
      <div className="scrim scrim-bottom" aria-hidden="true" />

      {/* ---- Content ---- */}
      <div className="shell-wide relative z-10 pb-14 sm:pb-16 lg:pb-20">
        <p
          className="t-eyebrow anim-fade mb-5 text-bone/70"
          style={{ animationDelay: '320ms' }}
        >
          New season
        </p>

        {/* Lines are split for motion but remain a single readable heading */}
        <h1 className="t-display max-w-[16ch] text-bone">
          <LineReveal
            lines={['Style that', 'feels like you.']}
            delay={420}
            step={130}
          />
        </h1>

        <div className="mt-7 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <p
            className="t-lead anim-rise max-w-prose2 text-bone/80"
            style={{ animationDelay: '880ms' }}
          >
            Considered pieces for the season ahead — chosen for how they feel,
            not just how they look.
          </p>

          <div
            className="anim-rise shrink-0"
            style={{ animationDelay: '1020ms' }}
          >
            <MagneticButtonLink to="/shop" variant="primary" size="lg">
              Shop collection
            </MagneticButtonLink>
          </div>
        </div>

        {/* ---- Carousel controls ---- */}
        {!HERO_VIDEO && SLIDES.length > 1 && (
          <div
            className="anim-fade mt-10 flex items-center gap-3"
            style={{ animationDelay: '1160ms' }}
          >
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show image ${i + 1} of ${SLIDES.length}`}
                aria-current={i === active}
                className="group relative h-6 py-2.5"
                style={{ width: i === active ? 56 : 28 }}
              >
                <span
                  className={cn(
                    'block h-px w-full transition-colors duration-[var(--motion-normal)]',
                    i === active ? 'bg-bone' : 'bg-bone/30 group-hover:bg-bone/60',
                  )}
                />
              </button>
            ))}
            <span className="ml-1 text-[0.6875rem] tabular-nums tracking-wide2 text-bone/50">
              {String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* ---- Scroll cue ---- */}
      <a
        href="#intro"
        aria-label="Scroll to content"
        className="anim-fade absolute bottom-6 right-[var(--shell-pad)] z-10 hidden h-11 w-11 place-items-center rounded-full border border-bone/25 text-bone/70 transition-colors hover:border-bone hover:text-bone lg:grid"
        style={{ animationDelay: '1300ms' }}
      >
        <ArrowDown size={15} className={reduced ? undefined : 'animate-[nudge_2.4s_ease-in-out_infinite]'} />
      </a>
    </section>
  );
}
