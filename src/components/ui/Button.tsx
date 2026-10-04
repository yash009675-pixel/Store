import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useMagnetic } from '../../hooks/useMagnetic';

type Variant = 'primary' | 'outline' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  accent: 'btn-accent',
};
const SIZE: Record<Size, string> = { sm: 'btn-sm', md: '', lg: 'btn-lg' };

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

export interface ButtonProps
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', size = 'md', loading, block, className, children, disabled, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn('btn', VARIANT[variant], SIZE[size], block && 'btn-block', className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading && <Loader2 size={15} className="spin" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);

/** Same visual language, but renders a real <a>/<Link> for navigation. */
export function ButtonLink({
  to,
  href,
  variant = 'primary',
  size = 'md',
  block,
  className,
  children,
  ...rest
}: BaseProps & {
  to?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  'aria-label'?: string;
}) {
  const classes = cn(
    'btn',
    VARIANT[variant],
    SIZE[size],
    block && 'btn-block',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}

/**
 * Magnetic variant (§50) — the pull is applied to an inner wrapper so the
 * hit area itself never moves away from the cursor.
 */
export function MagneticButtonLink(
  props: Parameters<typeof ButtonLink>[0] & { to?: string },
) {
  const ref = useMagnetic<HTMLSpanElement>(0.2, 60);
  return (
    <span ref={ref} className="inline-flex will-change-transform">
      <ButtonLink {...props} />
    </span>
  );
}
