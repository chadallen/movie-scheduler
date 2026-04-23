import 'server-only';
import { createServerClient } from '@supabase/ssr';

// Server-only — do not import in client components.
// The service role key gives full database access.
export function createServerSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}
