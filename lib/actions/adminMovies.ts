"use server";
import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "../supabase-server";

// ---------------------------------------------------------------------------
// Admin guard
// ---------------------------------------------------------------------------

async function isAdmin(): Promise<void> {
  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) {
    throw new Error("ADMIN_PHONE is not configured");
  }

  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const phone = user.phoneNumbers?.[0]?.phoneNumber;
  if (!phone || phone !== adminPhone) {
    throw new Error("Not authorized");
  }
}

// ---------------------------------------------------------------------------
// deleteScheduledMovie
// ---------------------------------------------------------------------------

/**
 * Removes a scheduled movie by id, then restores the linked slot as available.
 *
 * Steps:
 * 1. Look up the scheduled_movies row to get its slot_id.
 * 2. Delete the scheduled_movies row.
 * 3. Set is_taken = false on the matching available_slots row.
 *
 * Throws a clear error if the row is not found, rather than silently
 * restoring a slot that may not exist.
 *
 * Admin-only.
 */
export async function deleteScheduledMovie(id: string): Promise<{ error: string } | null> {
  await isAdmin();

  const supabase = createServerSupabaseClient();

  // 1. Look up the row to get slot_id.
  const { data: row, error: fetchError } = await supabase
    .from("scheduled_movies")
    .select("id, slot_id")
    .eq("id", id)
    .single();

  if (fetchError || !row) {
    console.error("[deleteScheduledMovie] fetch error:", fetchError?.message);
    return { error: `Scheduled movie not found: ${id}` };
  }

  const slotId: string = row.slot_id;

  // 2. Delete the scheduled_movies row.
  const { error: deleteError } = await supabase
    .from("scheduled_movies")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("[deleteScheduledMovie] delete error:", deleteError.message);
    return { error: "Failed to delete scheduled movie" };
  }

  // 3. Restore the slot as available.
  const { error: updateError } = await supabase
    .from("available_slots")
    .update({ is_taken: false })
    .eq("id", slotId);

  if (updateError) {
    console.error("[deleteScheduledMovie] slot restore error:", updateError.message);
    return { error: "Movie deleted but failed to restore slot — fix in Supabase manually" };
  }

  return null;
}
