import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { ProductImage } from '../../lib/types';
import { SmartImage } from '../ui/SmartImage';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useIsTouch } from '../../hooks/useMotionPrefs';

/* ==========================================================================
   PRODUCT GALLERY (§26, §69)
   Desktop: thumbnail rail + hover-to-zoom on the main image + lightbox.
   Mobile: native swipe rail with snap points and a position indicator.
   Images are contained, never cropped past their subject.
   ========================================================================== */

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouch();

  const count = images.length;
  const go = (next: number) => setActive(((next % count) + count) % count);

  // Keep the mobile rail's indicator in sync with the actual scroll position.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const i = Math.round(rail.scrollLeft / rail.clientWidth);
        setActive((prev) => (prev === i ? prev : i));
      });
    };
    rail.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener('scroll', onScroll);
    };
  }, []);

  if (!count) {
    return (
      <div className="grid aspect-[3/4] place-items-center rounded-xl bg-ink-700">
        <span className="font-display text-sm italic text-bone-dim">
          No image available
        </span>
      </div>
    );
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(active + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(active - 1);
    }
  };

  return (
    <>
      {/* ---------------- Mobile: swipe rail ---------------- */}
      <div className="lg:hidden">
        <div
          ref={railRef}
          className="snap-x-rail no-scrollbar flex overflow-x-auto"
          aria-label={`${name} images`}
        >
          {images.map((img, i) => (
            <div
              key={img.url + i}
              className="snap-item relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-ink-700"
            >
              <SmartImage
                src={img.url}
                alt={img.alt || `${name} — view ${i + 1}`}
                objectPosition={img.objectPosition ?? 'center 20%'}
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {images.map((img, i) => (
              <span
                key={img.url + i}
                className={cn(
                  'h-1 rounded-full transition-all duration-[var(--motion-normal)] ease-premium',
                  i === active ? 'w-5 bg-bone' : 'w-1 bg-bone/30',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------------- Desktop: rail + stage ---------------- */}
      <div
        className="hidden gap-4 lg:flex"
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-label={`${name} images — use arrow keys to change view`}
      >
        {count > 1 && (
          <div className="flex w-20 shrink-0 flex-col gap-3">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={i === active}
                className={cn(
                  'relative aspect-[3/4] overflow-hidden rounded-md bg-ink-700 transition-all duration-[var(--motion-normal)] ease-premium',
                  i === active
                    ? 'opacity-100 ring-1 ring-bone'
                    : 'opacity-50 hover:opacity-85',
                )}
              >
                <SmartImage
                  src={img.url}
                  alt=""
                  objectPosition={img.objectPosition ?? 'center 20%'}
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative min-w-0 flex-1">
          <div
            className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-ink-700"
            data-cursor="Expand"
            onMouseMove={(e) => {
              if (isTouch) return;
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            {images.map((img, i) => (
              <div
                key={img.url + i}
                className={cn(
                  'absolute inset-0 transition-opacity duration-[var(--motion-normal)] ease-premium',
                  i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                aria-hidden={i !== active}
              >
                <img
                  src={img.url}
                  alt={img.alt || `${name} — view ${i + 1}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover transition-transform duration-[var(--motion-slow)] ease-premium"
                  style={{
                    objectPosition:
                      zoom && i === active
                        ? `${zoom.x}% ${zoom.y}%`
                        : (img.objectPosition ?? 'center 20%'),
                    transform: zoom && i === active ? 'scale(1.9)' : 'scale(1)',
                  }}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => setLightbox(true)}
              aria-label="Open full-screen gallery"
              className="glass-soft absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-bone opacity-0 transition-opacity duration-[var(--motion-normal)] group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Expand size={15} />
            </button>

            {count > 1 && (
              <>
                <GalleryArrow side="left" onClick={() => go(active - 1)} />
                <GalleryArrow side="right" onClick={() => go(active + 1)} />
              </>
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <Lightbox
          images={images}
          name={name}
          active={active}
          onChange={go}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  );
}

function GalleryArrow({
  side,
  onClick,
}: {
  side: 'left' | 'right';
  onClick: () => void;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous image' : 'Next image'}
      className={cn(
        'glass-soft absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-bone opacity-0 transition-opacity duration-[var(--motion-normal)] group-hover:opacity-100 focus-visible:opacity-100',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      <Icon size={18} />
    </button>
  );
}

function Lightbox({
  images,
  name,
  active,
  onChange,
  onClose,
}: {
  images: ProductImage[];
  name: string;
  active: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  useBodyScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChange(active + 1);
      if (e.key === 'ArrowLeft') onChange(active - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, onChange, onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} — full screen gallery`}
      className="fixed inset-0 z-modal flex flex-col bg-ink-900/97 animate-[fade-in_240ms_ease-out_both]"
    >
      <div className="flex shrink-0 items-center justify-between px-5 py-4">
        <span className="text-xs tabular-nums tracking-wide2 text-bone-dim">
          {String(active + 1).padStart(2, '0')} /{' '}
          {String(images.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="icon-btn"
          aria-label="Close gallery"
          autoFocus
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 sm:p-10">
        <img
          key={images[active].url}
          src={images[active].url}
          alt={images[active].alt || `${name} — view ${active + 1}`}
          className="max-h-full max-w-full object-contain animate-[scale-in_280ms_cubic-bezier(0.22,1,0.36,1)_both]"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onChange(active - 1)}
              aria-label="Previous image"
              className="glass-soft absolute left-3 grid h-12 w-12 place-items-center rounded-full text-bone sm:left-6"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => onChange(active + 1)}
              aria-label="Next image"
              className="glass-soft absolute right-3 grid h-12 w-12 place-items-center rounded-full text-bone sm:right-6"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
