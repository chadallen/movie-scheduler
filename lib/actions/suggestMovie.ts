"use server";

/**
 * Stub server action for suggesting a movie.
 * The real scheduling logic will be implemented in the Scheduling epic.
 */
export async function suggestMovie(
  tmdbId: number
): Promise<{ success: true; scheduledAt: string }> {
  // Suppress unused variable warning until real implementation is added.
  void tmdbId;
  return { success: true, scheduledAt: new Date().toISOString() };
}
