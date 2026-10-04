import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/* ==========================================================================
   OVERLAY FAMILY — Modal (§98), Drawer (§99), BottomSheet (§67)
   All three share: backdrop fade + blur, focus trap, Escape, outside click,
   body scroll lock, and a mount/unmount animation that respects reduced
   motion via the global CSS switch.
   ========================================================================== */

interface OverlayBase {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
  className?: string;
}

function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 bg-ink-900/70 backdrop-blur-[3px] animate-[fade-in_280ms_ease-out_both]"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

export function Modal({ open, onClose, children, label, className }: OverlayBase) {
  const panelRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-modal grid place-items-center p-4 sm:p-6">
      <Backdrop onClose={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          'liquid-glass relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl',
          'animate-[scale-in_320ms_cubic-bezier(0.22,1,0.36,1)_both]',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${label}`}
          className="icon-btn absolute right-2 top-2 z-[3]"
        >
          <X size={18} />
        </button>
        <div className="relative z-[2] p-6 sm:p-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({
  open,
  onClose,
  children,
  label,
  className,
  side = 'right',
}: OverlayBase & { side?: 'right' | 'left' }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-drawer">
      <Backdrop onClose={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          'liquid-glass absolute inset-y-0 flex w-full max-w-[26rem] flex-col',
          side === 'right' ? 'right-0' : 'left-0',
          'animate-[drawer-in-right_380ms_cubic-bezier(0.22,1,0.36,1)_both]',
          className,
        )}
        style={
          side === 'left'
            ? { animationName: 'drawer-in-left' }
            : undefined
        }
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Mobile bottom sheet. Supports drag-to-dismiss with a real pointer handle
 * and respects the home-indicator safe area.
 */
export function BottomSheet({
  open,
  onClose,
  children,
  label,
  className,
}: OverlayBase) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  useBodyScrollLock(open);
  useFocusTrap(panelRef, open, onClose);

  if (!open) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null || !panelRef.current) return;
    const dy = Math.max(0, e.clientY - dragStart.current);
    panelRef.current.style.transform = `translate3d(0, ${dy}px, 0)`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null || !panelRef.current) return;
    const dy = e.clientY - dragStart.current;
    dragStart.current = null;
    panelRef.current.style.transform = '';
    if (dy > 110) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-drawer flex items-end">
      <Backdrop onClose={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          'liquid-glass relative flex max-h-[86vh] w-full flex-col rounded-t-2xl',
          'animate-[sheet-up_380ms_cubic-bezier(0.22,1,0.36,1)_both]',
          'transition-transform duration-200 ease-premium',
          className,
        )}
      >
        <div
          className="relative z-[2] flex shrink-0 cursor-grab touch-none justify-center py-3 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-hidden="true"
        >
          <span className="h-1 w-10 rounded-full bg-bone/25" />
        </div>
        <div className="relative z-[2] flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Picks the right container for the viewport: side drawer on desktop,
 * bottom sheet on phones (§99).
 */
export function ResponsiveOverlay(
  props: OverlayBase & { isDesktop: boolean },
) {
  const { isDesktop, ...rest } = props;
  return isDesktop ? <Drawer {...rest} /> : <BottomSheet {...rest} />;
}
