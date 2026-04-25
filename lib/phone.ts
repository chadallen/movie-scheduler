/**
 * Normalizes a phone number to E.164 format, assuming +1 (US/Canada) if no
 * country code is provided.
 *
 * - Strips all non-digit characters except a leading +
 * - If already starts with +, returns as-is (after stripping whitespace/dashes)
 * - If 11 digits starting with 1, prepends +
 * - Otherwise prepends +1
 */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) {
    // Already has a country code — strip non-digits after the +
    return "+" + trimmed.slice(1).replace(/\D/g, "");
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return "+" + digits;
  }
  return "+1" + digits;
}
