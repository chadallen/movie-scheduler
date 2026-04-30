// Rate limit: max movie suggestions per user per week
export const WEEKLY_MOVIE_LIMIT = 200;

// Tester credentials for auth bypass (never commit real values)
export const TESTER_PHONE = process.env.TESTER_PHONE ?? "";
export const TESTER_OTP = process.env.TESTER_OTP ?? "";

// When TEST_MODE=true, TESTER_PHONE skips SMS and accepts TESTER_OTP instead.
// Set TEST_MODE=false (or unset) to restore normal SMS OTP for that number.
export const TEST_MODE = process.env.TEST_MODE === "true";

// Returns true if the given phone number has admin privileges.
// The primary admin is ADMIN_PHONE; TESTER_PHONE also gets admin access
// so the test account can exercise admin flows.
export function isAdminPhone(phone: string): boolean {
  const adminPhone = process.env.ADMIN_PHONE;
  return !!adminPhone && (phone === adminPhone || (!!TESTER_PHONE && phone === TESTER_PHONE));
}
