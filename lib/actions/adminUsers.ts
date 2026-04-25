"use server";
import "server-only";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "../supabase-server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminUser {
  supabaseId: string;
  phone: string;
  createdAt: string;
  clerkId: string | null;
}

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
// listUsers
// ---------------------------------------------------------------------------

/**
 * Returns all allowlist rows joined with Clerk user data (matched by phone).
 * Admin-only.
 */
export async function listUsers(): Promise<AdminUser[]> {
  await isAdmin();

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("allowlist")
    .select("id, phone, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[listUsers] Supabase error:", error.message);
    throw new Error("Failed to fetch users");
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch all Clerk users matching the phones in the allowlist.
  const phones = data.map((row) => row.phone);
  const client = await clerkClient();
  const clerkResult = await client.users.getUserList({ phoneNumber: phones, limit: 500 });

  // Build a phone → clerkId lookup map.
  const phoneToClerkId = new Map<string, string>();
  for (const clerkUser of clerkResult.data) {
    for (const pn of clerkUser.phoneNumbers) {
      phoneToClerkId.set(pn.phoneNumber, clerkUser.id);
    }
  }

  return data.map((row) => ({
    supabaseId: row.id,
    phone: row.phone,
    createdAt: row.created_at,
    clerkId: phoneToClerkId.get(row.phone) ?? null,
  }));
}

// ---------------------------------------------------------------------------
// createUser
// ---------------------------------------------------------------------------

/**
 * Adds a phone number to the Supabase allowlist and creates a matching Clerk
 * user. Phone must be in E.164 format (e.g. +15555551234).
 * Admin-only.
 */
export async function createUser(phone: string): Promise<AdminUser | { error: string }> {
  await isAdmin();

  // Validate E.164 format.
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
    return { error: "Phone must be in E.164 format (e.g. +15555551234)" };
  }

  const supabase = createServerSupabaseClient();

  // Insert into Supabase allowlist first.
  const { data: row, error: insertError } = await supabase
    .from("allowlist")
    .insert({ phone })
    .select("id, phone, created_at")
    .single();

  if (insertError) {
    console.error("[createUser] Supabase insert error:", insertError.message);
    return { error: "Failed to add user to allowlist" };
  }

  // Create Clerk user.
  let clerkId: string | null = null;
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.createUser({ phoneNumber: [phone] });
    clerkId = clerkUser.id;
  } catch (err) {
    // Roll back the Supabase insert to keep systems in sync.
    await supabase.from("allowlist").delete().eq("id", row.id);
    console.error("[createUser] Clerk createUser error:", err);
    const clerkMessage =
      err instanceof Error ? err.message :
      (err as { errors?: { longMessage?: string; message?: string }[] })?.errors?.[0]?.longMessage ??
      (err as { errors?: { longMessage?: string; message?: string }[] })?.errors?.[0]?.message ??
      "Unknown Clerk error";
    return { error: `Clerk error: ${clerkMessage}` };
  }

  return {
    supabaseId: row.id,
    phone: row.phone,
    createdAt: row.created_at,
    clerkId,
  };
}

// ---------------------------------------------------------------------------
// deleteUser
// ---------------------------------------------------------------------------

/**
 * Removes a user from both the Supabase allowlist and Clerk.
 * Admin-only.
 */
export async function deleteUser(supabaseId: string, clerkId: string): Promise<{ error: string } | null> {
  await isAdmin();

  const supabase = createServerSupabaseClient();

  // Delete from Supabase first.
  const { error: deleteError } = await supabase
    .from("allowlist")
    .delete()
    .eq("id", supabaseId);

  if (deleteError) {
    console.error("[deleteUser] Supabase delete error:", deleteError.message);
    return { error: "Failed to remove user from allowlist" };
  }

  // Delete from Clerk.
  try {
    const client = await clerkClient();
    await client.users.deleteUser(clerkId);
  } catch (err) {
    console.error("[deleteUser] Clerk deleteUser error:", err);
    return { error: "User removed from allowlist but Clerk deletion failed — remove from Clerk manually" };
  }

  return null;
}

// ---------------------------------------------------------------------------
// updateUserPhone
// ---------------------------------------------------------------------------

/**
 * Updates a user's phone number in both the Supabase allowlist and Clerk.
 * The new phone must be in E.164 format.
 * Admin-only.
 */
export async function updateUserPhone(
  supabaseId: string,
  clerkId: string,
  newPhone: string
): Promise<AdminUser | { error: string }> {
  await isAdmin();

  // Validate E.164 format.
  if (!/^\+[1-9]\d{6,14}$/.test(newPhone)) {
    return { error: "Phone must be in E.164 format (e.g. +15555551234)" };
  }

  const supabase = createServerSupabaseClient();

  // Read the current row so we can roll back if Clerk fails.
  const { data: existing, error: fetchError } = await supabase
    .from("allowlist")
    .select("phone")
    .eq("id", supabaseId)
    .single();

  if (fetchError || !existing) {
    console.error("[updateUserPhone] Supabase fetch error:", fetchError?.message);
    return { error: "User not found in allowlist" };
  }

  // Update Supabase.
  const { data: updated, error: updateError } = await supabase
    .from("allowlist")
    .update({ phone: newPhone })
    .eq("id", supabaseId)
    .select("id, phone, created_at")
    .single();

  if (updateError || !updated) {
    console.error("[updateUserPhone] Supabase update error:", updateError?.message);
    return { error: "Failed to update phone in allowlist" };
  }

  // Update Clerk: add the new phone number then remove the old one.
  try {
    const client = await clerkClient();

    // Fetch the current Clerk user to find the existing phone number resource ID.
    const clerkUser = await client.users.getUser(clerkId);
    const oldPhoneResource = clerkUser.phoneNumbers.find(
      (pn) => pn.phoneNumber === existing.phone
    );

    // Add new phone number.
    const newPhoneResource = await client.phoneNumbers.createPhoneNumber({
      userId: clerkId,
      phoneNumber: newPhone,
      verified: true,
      primary: true,
    });

    // Remove old phone number if it exists.
    if (oldPhoneResource) {
      await client.phoneNumbers.deletePhoneNumber(oldPhoneResource.id);
    } else {
      // Edge case: old phone not found on Clerk user — delete the newly added
      // phone resource we just created to avoid orphans, then surface an error.
      await client.phoneNumbers.deletePhoneNumber(newPhoneResource.id);
      return { error: "Old phone number not found on Clerk user" };
    }
  } catch (err) {
    // Roll back the Supabase update.
    await supabase
      .from("allowlist")
      .update({ phone: existing.phone })
      .eq("id", supabaseId);
    console.error("[updateUserPhone] Clerk update error:", err);
    return { error: "Failed to update phone in Clerk; allowlist update rolled back" };
  }

  return {
    supabaseId: updated.id,
    phone: updated.phone,
    createdAt: updated.created_at,
    clerkId,
  };
}
