import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { checkAllowlist } from "@/lib/checkAllowlist";
import { getMovieDetails } from "@/lib/tmdb";
import ClickableSuggestArea from "./ClickableSuggestArea";

export const metadata: Metadata = {
  title: "Suggest a Movie",
};

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
              inline-flex items-center
              mb-6
              min-h-[44px]
              text-wire-accent
              text-sm
              hover:opacity-80
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

  const runtimeDisplay =
    movie.runtime_minutes != null
      ? `${movie.runtime_minutes} min`
      : "Runtime unknown";

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
    : null;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Back link */}
        <Link
          href="/suggest"
          className="
            inline-flex items-center
            min-h-[44px]
            text-wire-accent
            text-sm
            hover:opacity-80
          "
        >
          ← Back to search
        </Link>

        {/* Title, poster, and suggest action — all wired together */}
        <ClickableSuggestArea
          movie={{
            tmdbId: movie.tmdb_id,
            title: movie.title,
            posterPath: movie.poster_path,
            runtimeMinutes: movie.runtime_minutes,
          }}
          posterUrl={posterUrl}
          runtimeDisplay={runtimeDisplay}
          year={movie.year}
        />
      </div>
    </main>
  );
}
