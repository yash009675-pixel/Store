import { useId, useRef, useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/cn';

/* ==========================================================================
   ACCORDION (§68)
   Height is animated from the real measured content height, so there is no
   magic max-height guess that clips long text. Content stays in the DOM and
   is correctly hidden from AT when collapsed.
   ========================================================================== */

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const id = useId();

  return (
    <div className={cn('hairline-b', className)}>
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-trigger`}
          className="group flex w-full items-center justify-between gap-4 py-5 text-left"
        >
          <span className="text-sm font-medium tracking-wide text-bone transition-colors group-hover:text-white">
            {title}
          </span>
          <Plus
            size={16}
            aria-hidden="true"
            className={cn(
              'shrink-0 text-bone-dim transition-transform duration-[var(--motion-normal)] ease-premium',
              open && 'rotate-45',
            )}
          />
        </button>
      </h3>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        hidden={!open}
        className="grid transition-[grid-template-rows,opacity] duration-[var(--motion-normal)] ease-premium"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div ref={contentRef} className="t-body pb-6 pr-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('hairline-t', className)}>{children}</div>;
}
