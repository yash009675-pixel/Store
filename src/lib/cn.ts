/** Tiny class-name joiner. Keeps bundle lean — no clsx dependency needed. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
