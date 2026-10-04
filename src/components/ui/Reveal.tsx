import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type RevealKind = 'rise' | 'blur' | 'scale' | 'clip' | 'image' | 'fade';

interface RevealProps {
  children: ReactNode;
  kind?: RevealKind;
  /** Stagger index — converted to a capped delay. */
  index?: number;
  step?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * Declarative wrapper around the [data-reveal] system in index.css.
 * The actual triggering is done once, globally, by useScrollReveal (§20).
 */
export function Reveal({
  children,
  kind = 'rise',
  index = 0,
  step = 70,
  as,
  className,
  style,
}: RevealProps) {
  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag
      data-reveal={kind === 'fade' ? '' : kind}
      className={className}
      style={
        {
          ...style,
          '--reveal-delay': `${Math.min(index * step, 640)}ms`,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}

/**
 * Masked line reveal for editorial headings (§19, §95).
 * Each line is a block inside an overflow-hidden wrapper, so the text slides
 * up from behind its own baseline. Lines stay as real text for SEO (§84).
 */
export function LineReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  step = 110,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  step?: number;
}) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span className="line-mask" key={`${line}-${i}`}>
          <span
            className={lineClassName}
            style={{ animationDelay: `${delay + i * step}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Word-by-word fade-rise, used for short supporting lines. */
export function WordReveal({
  text,
  className,
  delay = 0,
  step = 42,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
}) {
  const words = text.split(' ');
  return (
    <span className={cn('inline', className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="anim-rise inline-block"
          style={{ animationDelay: `${delay + i * step}ms` }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}
