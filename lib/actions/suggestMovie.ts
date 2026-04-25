"use server";

/*
 * =============================================================================
 * SUPABASE RPC — claim_slot
 * =============================================================================
 * Run this SQL in the Supabase SQL editor once before deploying this action.
 * The function atomically claims the earliest open slot and inserts the movie,
 * preventing double-booking under concurrent requests.
 *
 * CREATE OR REPLACE FUNCTION claim_slot(
 *   p_tmdb_id            integer,
 *   p_title              text,
 *   p_poster_path        text,
 *   p_runtime_minutes    integer,
 *   p_suggested_by_phone text
 * )
 * RETURNS TABLE (slot_id uuid, starts_at timestamptz)
 * LANGUAGE plpgsql
 * AS $$
 * DECLARE
 *   v_slot_id   uuid;
 *   v_starts_at timestamptz;
 * BEGIN
 *   -- Lock and claim the earliest available future slot atomically.
 *   -- Only consider slots whose date in Pacific time is today or later.
 *   SELECT id, available_slots.starts_at
 *     INTO v_slot_id, v_starts_at
 *     FROM available_slots
 *    WHERE is_taken = false
 *      AND starts_at >= date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE 'America/Los_Angeles')
 *                                   AT TIME ZONE 'America/Los_Angeles'
 *    ORDER BY available_slots.starts_at ASC
 *    LIMIT 1
 *      FOR UPDATE SKIP LOCKED;
 *
 *   IF v_slot_id IS NULL THEN
 *     -- No slots available; return empty result set.
 *     RETURN;
 *   END IF;
 *
 *   -- Mark slot as taken.
 *   UPDATE available_slots
 *      SET is_taken = true
 *    WHERE id = v_slot_id;
 *
 *   -- Record the scheduled movie.
 *   INSERT INTO scheduled_movies (
 *     slot_id, tmdb_id, title, poster_path,
 *     runtime_minutes, suggested_by_phone
 *   ) VALUES (
 *     v_slot_id, p_tmdb_id, p_title, p_poster_path,
 *     p_runtime_minutes, p_suggested_by_phone
 *   );
 *
 *   RETURN QUERY SELECT v_slot_id, v_starts_at;
 * END;
 * $$;
 * =============================================================================
 */

import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { checkAllowlist } from "../checkAllowlist";
import { checkRateLimit } from "../rateLimit";
import { createServerSupabaseClient } from "../supabase-server";

export type SuggestResult =
  | { success: true; scheduledAt: string; movieId: string }
  | { success: false; error: "rate_limited"; nextEligibleAt: string }
  | { success: false; error: "no_slots" }
  | { success: false; error: "not_authorized" }
  | { success: false; error: "unknown" };

export interface MovieInput {
  tmdbId: number;
  title: string;
  posterPath?: string | null;
  runtimeMinutes?: number | null;
}

/**
 * Server action: suggest a movie for scheduling.
 *
 * 1. Verifies the user is authenticated and on the allowlist.
 * 2. Checks the weekly rate limit for the user's phone number.
 * 3. Atomically claims the earliest available slot via the `claim_slot` RPC
 *    (see SQL comment above) and inserts into scheduled_movies.
 * 4. Returns the confirmed ISO datetime on success, or a typed error string.
 *
 * Concurrency: the claim_slot RPC uses SELECT … FOR UPDATE SKIP LOCKED, so
 * two simultaneous requests will never book the same slot.
 */
export async function suggestMovie(movie: MovieInput): Promise<SuggestResult> {
  // ── 1. Authentication & allowlist ────────────────────────────────────────
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "not_authorized" };
  }

  const { allowed } = await checkAllowlist();
  if (!allowed) {
    return { success: false, error: "not_authorized" };
  }

  const phone = user.phoneNumbers?.[0]?.phoneNumber;
  if (!phone) {
    return { success: false, error: "not_authorized" };
  }

  // ── 2. Rate limit ─────────────────────────────────────────────────────────
  const rateLimitResult = await checkRateLimit(phone);
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: "rate_limited",
      nextEligibleAt: rateLimitResult.nextEligibleAt.toISOString(),
    };
  }

  // ── 3 & 4. Atomic slot claim via RPC ─────────────────────────────────────
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc("claim_slot", {
    p_tmdb_id: movie.tmdbId,
    p_title: movie.title,
    p_poster_path: movie.posterPath ?? null,
    p_runtime_minutes: movie.runtimeMinutes ?? null,
    p_suggested_by_phone: phone,
  });

  if (error) {
    console.error("[suggestMovie] claim_slot RPC error:", error.message);
    return { success: false, error: "unknown" };
  }

  // The RPC returns an empty array when no slots are available.
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return { success: false, error: "no_slots" };
  }

  // ── 5. Return confirmed datetime and movie ID ─────────────────────────────
  const row = Array.isArray(data) ? data[0] : data;
  const scheduledAt: string =
    typeof row.starts_at === "string"
      ? row.starts_at
      : new Date(row.starts_at).toISOString();

  const { data: movieRow } = await supabase
    .from("scheduled_movies")
    .select("id")
    .eq("slot_id", row.slot_id)
    .single();

  return { success: true, scheduledAt, movieId: movieRow?.id ?? "" };
}
