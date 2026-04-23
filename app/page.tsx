import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase-server";

interface ScheduledMovie {
  id: string;
  slot_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  runtime_minutes: number | null;
  ics_uid: string | null;
  created_at: string;
  starts_at: string;
}

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function Home() {
  const supabase = createServerSupabaseClient();

  const now = new Date().toISOString();

  const { data: movies, error } = await supabase
    .from("scheduled_movies")
    .select(
      "id, slot_id, tmdb_id, title, poster_path, runtime_minutes, ics_uid, created_at, available_slots!inner(starts_at)"
    );

  // Flatten the join result so starts_at is at the top level
  const allMapped: ScheduledMovie[] = (movies ?? []).map(
    (row: Record<string, unknown>) => {
      const slot = row.available_slots as { starts_at: string } | null;
      return {
        id: row.id as string,
        slot_id: row.slot_id as string,
        tmdb_id: row.tmdb_id as number,
        title: row.title as string,
        poster_path: row.poster_path as string | null,
        runtime_minutes: row.runtime_minutes as number | null,
        ics_uid: row.ics_uid as string | null,
        created_at: row.created_at as string,
        starts_at: slot?.starts_at ?? "",
      };
    }
  );

  // PostgREST does not filter on joined columns — apply filter and sort in JS
  const scheduledMovies = allMapped
    .filter((m) => m.starts_at > now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  if (error) {
    console.error("Failed to load scheduled movies:", error.message);
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div className="border-2 border-wire-border bg-wire-white rounded-sm px-5 py-5">
          <h1 className="text-3xl font-bold text-wire-text mb-1">
            Movie Night
          </h1>
          <p className="text-wire-text-muted text-base">
            Upcoming scheduled movies
          </p>
        </div>

        {/* Movie list or empty state */}
        {scheduledMovies.length === 0 ? (
          <div className="border-2 border-wire-border bg-wire-surface rounded-sm px-5 py-8 text-center">
            <p className="text-wire-text text-lg font-bold mb-1">
              Nothing scheduled yet.
            </p>
            <p className="text-wire-text-muted text-base">
              Check back soon!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {scheduledMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {/* Suggest link */}
        <div className="text-center">
          <Link
            href="/suggest"
            className="
              inline-block
              border-2 border-wire-border
              bg-wire-white
              rounded-sm
              px-5 py-2
              text-wire-text
              text-base
              font-bold
              hover:bg-wire-surface
              transition-colors
            "
          >
            Suggest a movie →
          </Link>
        </div>
      </div>
    </main>
  );
}

function MovieCard({ movie }: { movie: ScheduledMovie }) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
    : null;

  const runtime =
    movie.runtime_minutes != null
      ? `${movie.runtime_minutes} min`
      : "Runtime unknown";

  const dateLabel = movie.starts_at ? formatDateTime(movie.starts_at) : "TBD";

  return (
    <div className="border-2 border-wire-border bg-wire-white rounded-sm flex flex-row overflow-hidden">
      {/* Poster */}
      <div className="flex-shrink-0 w-16 bg-wire-surface border-r-2 border-wire-border flex items-center justify-center">
        {posterUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            width={92}
            height={138}
            className="w-full h-auto object-cover"
          />
        ) : (
          <span className="text-wire-text-muted text-xs text-center px-1">
            No poster
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center px-4 py-3 gap-1 min-w-0">
        <p className="text-wire-text font-bold text-base leading-tight truncate">
          {movie.title}
        </p>
        <p className="text-wire-text-muted text-sm">{runtime}</p>
        <p className="text-wire-text text-sm">{dateLabel}</p>
        <a
          href={`/api/ics/${movie.id}`}
          download
          className="
            mt-1
            inline-block
            self-start
            border border-wire-border
            bg-wire-surface
            rounded-sm
            px-2 py-0.5
            text-wire-text-muted
            text-xs
            hover:bg-wire-white
            transition-colors
          "
        >
          Add to Calendar
        </a>
      </div>
    </div>
  );
}
