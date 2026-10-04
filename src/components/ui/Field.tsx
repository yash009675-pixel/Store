import { useId, useState } from 'react';
import { cn } from '../../lib/cn';

/* ==========================================================================
   FORM FIELD (§43)
   Floating label, focus animation, inline validation with a real
   aria-describedby link, and an error state that doesn't rely on colour
   alone (§71) — the message is always written out.
   ========================================================================== */

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  multiline?: boolean;
  rows?: number;
  className?: string;
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  error,
  hint,
  required,
  autoComplete,
  inputMode,
  multiline,
  rows = 4,
  className,
}: FieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const shared = {
    id,
    value,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': describedBy,
    required,
    autoComplete,
    className: cn(
      'field peer w-full',
      multiline ? 'resize-y pt-6' : 'h-14 pb-1 pt-6',
      error && 'border-accent',
    ),
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        {multiline ? (
          <textarea {...shared} rows={rows} />
        ) : (
          <input {...shared} type={type} inputMode={inputMode} />
        )}

        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-4 origin-left transition-all duration-[var(--motion-fast)] ease-premium',
            floated
              ? 'top-2 text-[0.6875rem] tracking-wide text-bone-dim'
              : multiline
                ? 'top-4 text-sm text-bone-dim'
                : 'top-1/2 -translate-y-1/2 text-sm text-bone-dim',
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-accent">*</span>}
        </label>
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 animate-[fade-rise_200ms_ease-out_both] text-xs text-accent"
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-bone-dim">
          {hint}
        </p>
      )}
    </div>
  );
}
