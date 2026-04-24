import 'server-only';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from './supabase-server';
import { TESTER_PHONE } from './config';

/**
 * Checks whether the currently authenticated Clerk user's phone number
 * is on the Supabase allowlist.
 *
 * Returns { allowed: true } if the phone is found.
 * Returns { allowed: false } if the user has no phone or the phone is not listed.
 *
 * Must be called from a server component or server action only.
 * Phone numbers from Clerk are in E.164 format (e.g. +15555551234).
 */
export async function checkAllowlist(): Promise<{ allowed: boolean }> {
  const user = await currentUser();

  if (!user) {
    return { allowed: false };
  }

  // Clerk stores phone numbers in the phoneNumbers array; primary phone is first.
  const phone = user.phoneNumbers?.[0]?.phoneNumber;

  if (!phone) {
    return { allowed: false };
  }

  // Tester bypass: skip DB lookup for the designated tester phone number.
  if (phone === TESTER_PHONE && TESTER_PHONE !== "") {
    return { allowed: true };
  }

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('allowlist')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (error) {
    // Fail closed: treat DB errors as not allowed.
    console.error('[checkAllowlist] Supabase error:', error.message);
    return { allowed: false };
  }

  return { allowed: data !== null };
}
