import type { SupabaseClient } from '@supabase/supabase-js';

/* ==========================================================================
   BACKEND CONNECTION
   Credentials come from the environment only — never hard-coded (§102).
   Only the publishable anon key belongs in a browser bundle; a service-role
   key must never be referenced here.

   The client library is imported dynamically so its ~220 kB never lands in
   the initial bundle — storefronts with no backend configured pay nothing
   for it, and configured ones load it alongside the first data call (§75).
   ========================================================================== */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isBackendConfigured = Boolean(
  url && anonKey && /^https?:\/\//.test(url),
);

let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> | null {
  if (!isBackendConfigured) return null;

  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url as string, anonKey as string, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }),
    );
  }
  return clientPromise;
}
