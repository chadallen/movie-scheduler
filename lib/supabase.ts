import { createBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr';

// Browser client — safe for client components (uses anon key)
export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-only — do not import in client components
export function createServerClient() {
  return createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op: service role client does not use cookies
        },
      },
    }
  );
}
