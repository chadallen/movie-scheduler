"use client";

import { useState, useTransition } from "react";
import { deleteScheduledMovie } from "@/lib/actions/adminMovies";

export interface ScheduledMovie {
  id: string;
  title: string;
  starts_at: string;
  suggested_by_phone: string;
}

interface Props {
  initialMovies: ScheduledMovie[];
}

export default function ScheduledMovies({ initialMovies }: Props) {
  const [movies, setMovies] = useState<ScheduledMovie[]>(initialMovies);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(movie: ScheduledMovie) {
    setDeletingId(movie.id);
    setDeleteError(null);

    startTransition(async () => {
      const result = await deleteScheduledMovie(movie.id);
      if (result && "error" in result) {
        setDeleteError(result.error);
      } else {
        setMovies((prev) => prev.filter((m) => m.id !== movie.id));
      }
      setDeletingId(null);
    });
  }

  function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Error banner */}
      {deleteError && (
        <div className="border border-red-800 bg-red-950 rounded-sm px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-red-400">{deleteError}</p>
          <button
            onClick={() => setDeleteError(null)}
            className="text-wire-text-muted text-xs underline hover:no-underline flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Movie list */}
      <section className="border-2 border-wire-border bg-wire-white rounded-sm overflow-hidden">
        <h2 className="text-lg font-bold text-wire-text px-6 py-4 border-b border-wire-border">
          Upcoming{" "}
          <span className="text-wire-text-muted font-normal text-sm">
            ({movies.length})
          </span>
        </h2>

        {movies.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-wire-text-muted text-base">No upcoming scheduled movies.</p>
          </div>
        ) : (
          <div className="divide-y divide-wire-border">
            {movies.map((movie) => {
              const isDeleting = deletingId === movie.id;

              return (
                <div
                  key={movie.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-wire-text text-base font-medium">
                        {movie.title}
                      </span>
                      <span className="text-wire-text-muted text-xs">
                        {formatDate(movie.starts_at)} &middot; suggested by {movie.suggested_by_phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDelete(movie)}
                      disabled={isDeleting || deletingId !== null}
                      className="
                        border border-red-800
                        bg-wire-surface
                        text-red-400
                        text-sm
                        rounded-sm
                        px-4
                        min-h-[36px]
                        hover:bg-red-950
                        transition-colors
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
