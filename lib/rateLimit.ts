import 'server-only';
import { createServerSupabaseClient } from './supabase-server';
import { WEEKLY_MOVIE_LIMIT } from './config';

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; nextEligibleAt: Date };

/**
 * Checks whether the given phone number has exceeded the weekly suggestion limit.
 *
 * Queries scheduled_movies for rows where suggested_by_phone matches and
 * created_at is within the last 7 days. If the count is at or above
 * WEEKLY_MOVIE_LIMIT, returns the next eligible date (oldest matching row's
 * created_at + 7 days). Otherwise returns { allowed: true }.
 */
export async function checkRateLimit(phone: string): Promise<RateLimitResult> {
  const supabase = createServerSupabaseClient();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('scheduled_movies')
    .select('created_at')
    .eq('suggested_by_phone', phone)
    .gt('created_at', sevenDaysAgo)
    .order('created_at', { ascending: true });

  if (error) {
    // Fail open: if we can't check, let the request through.
    // The scheduling step will catch any real issues.
    console.error('[checkRateLimit] Supabase error:', error.message);
    return { allowed: true };
  }

  if (!data || data.length < WEEKLY_MOVIE_LIMIT) {
    return { allowed: true };
  }

  // oldest matching row's created_at + 7 days
  const oldestCreatedAt = new Date(data[0].created_at);
  const nextEligibleAt = new Date(oldestCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  return { allowed: false, nextEligibleAt };
}
