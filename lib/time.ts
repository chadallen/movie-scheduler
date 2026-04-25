/**
 * Returns the date portion of a Date as a YYYY-MM-DD string in Pacific time
 * (America/Los_Angeles), which observes daylight saving automatically.
 * en-CA locale produces YYYY-MM-DD format, which sorts lexicographically.
 */
export function toPTDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

/**
 * Returns today's date as a YYYY-MM-DD string in Pacific time.
 */
export function todayPT(): string {
  return toPTDateString(new Date());
}
