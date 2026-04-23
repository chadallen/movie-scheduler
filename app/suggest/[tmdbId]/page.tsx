import { redirect } from "next/navigation";
import Link from "next/link";
import { checkAllowlist } from "@/lib/checkAllowlist";
import { getMovieDetails } from "@/lib/tmdb";
import SuggestButton from "./SuggestButton";

interface MovieDetailPageProps {
  params: Promise<{ tmdbId: string }>;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { allowed } = await checkAllowlist();
  if (!allowed) {
    redirect("/not-authorized");
  }

  const { tmdbId: tmdbIdStr } = await params;
  const tmdbId = parseInt(tmdbIdStr, 10);

  if (isNaN(tmdbId)) {
    redirect("/suggest");
  }

  let movie;
  try {
    movie = await getMovieDetails(tmdbId);
  } catch {
    // TMDB 404 or network error — fall through to not-found UI
    movie = null;
  }

  if (!movie) {
    return (
      <main className="flex flex-1 flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          <Link
            href="/suggest"
            className="
              inline-block
              mb-6
              text-wire-text
              underline
              text-base
            "
          >
            ← Back to search
          </Link>
          <p className="text-wire-text text-lg text-center border-2 border-wire-border bg-wire-surface rounded-sm px-4 py-6">
            Movie not found.
          </p>
        </div>
      </main>
    );
  }

  const runtime =
    movie.runtime_minutes != null
      ? `${movie.runtime_minutes} min`
      : "Runtime unknown";

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Back link */}
        <Link
          href="/suggest"
          className="
            inline-block
            text-wire-text
            underline
            text-base
          "
        >
          ← Back to search
        </Link>

        {/* Poster */}
        <div className="flex justify-center">
          {posterUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              width={342}
              height={513}
              className="border-2 border-wire-border rounded-sm object-cover"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <div
              className="
                border-2 border-wire-border
                bg-wire-surface
                rounded-sm
                flex items-center justify-center
                text-wire-text-muted
                text-lg
              "
              style={{ width: 342, height: 513, maxWidth: "100%" }}
            >
              No poster
            </div>
          )}
        </div>

        {/* Movie info */}
        <div className="border-2 border-wire-border bg-wire-white rounded-sm px-4 py-4 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-wire-text leading-tight">
            {movie.title}
          </h1>
          <p className="text-wire-text-muted text-base">
            {movie.year ? `${movie.year} · ` : ""}{runtime}
          </p>
        </div>

        {/* Suggest button */}
        <SuggestButton
          movie={{
            tmdbId: movie.tmdb_id,
            title: movie.title,
            posterPath: movie.poster_path,
            runtimeMinutes: movie.runtime_minutes,
          }}
        />
      </div>
    </main>
  );
}
