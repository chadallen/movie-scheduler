"use server";
import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "../supabase-server";
import { INVITE_CODE } from "../config";

// ---------------------------------------------------------------------------
// registerWithInvite
// ---------------------------------------------------------------------------

/**
 * Registers a new user via invite code. Validates the invite code, validates
 * E.164 phone format, checks the phone isn't already in the allowlist, inserts
 * into the Supabase allowlist, and creates a matching Clerk user.
 *
 * Rolls back the Supabase insert if Clerk user creation fails.
 */
export async function registerWithInvite(
  phone: string,
  inviteCode: string
): Promise<{ success: true } | { error: string }> {
  // Validate invite code.
  if (!INVITE_CODE || inviteCode !== INVITE_CODE) {
    return { error: "Invalid invite code" };
  }

  // Validate E.164 format.
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
    return { error: "Phone must be in E.164 format (e.g. +15555551234)" };
  }

  const supabase = createServerSupabaseClient();

  // Check if phone is already in the allowlist.
  const { data: existing, error: lookupError } = await supabase
    .from("allowlist")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (lookupError) {
    console.error("[registerWithInvite] Supabase lookup error:", lookupError.message);
    return { error: "Registration failed, please try again" };
  }

  if (existing) {
    return { error: "This number is already registered — just sign in!" };
  }

  // Insert into Supabase allowlist first.
  const { data: row, error: insertError } = await supabase
    .from("allowlist")
    .insert({ phone })
    .select("id")
    .single();

  if (insertError) {
    console.error("[registerWithInvite] Supabase insert error:", insertError.message);
    return { error: "Registration failed, please try again" };
  }

  // Create Clerk user.
  try {
    const client = await clerkClient();
    await client.users.createUser({ phoneNumber: [phone] });
  } catch (err) {
    // Roll back the Supabase insert to keep systems in sync.
    await supabase.from("allowlist").delete().eq("id", row.id);
    console.error("[registerWithInvite] Clerk createUser error:", err);
    return { error: "Registration failed, please try again" };
  }

  return { success: true };
}
