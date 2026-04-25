"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { suggestMovie, type MovieInput } from "@/lib/actions/suggestMovie";

interface ClickableSuggestAreaProps {
  movie: MovieInput;
  posterUrl: string | null;
  runtimeDisplay: string;
  year?: string;
}

type State = "idle" | "success" | "error" | "rate_limited" | "no_slots";

export default function ClickableSuggestArea({
  movie,
  posterUrl,
  runtimeDisplay,
  year,
}: ClickableSuggestAreaProps) {
  const [state, setState] = useState<State>("idle");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [movieId, setMovieId] = useState<string | null>(null);
  const [nextEligibleAt, setNextEligibleAt] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSuggest() {
    if (state !== "idle" && state !== "error") return;
    startTransition(async () => {
      try {
        const result = await suggestMovie(movie);
        if (result.success) {
          setScheduledAt(result.scheduledAt);
          setMovieId(result.movieId);
          setState("success");
        } else if (result.error === "rate_limited") {
          setNextEligibleAt(result.nextEligibleAt);
          setState("rate_limited");
        } else if (result.error === "no_slots") {
          setState("no_slots");
        } else {
          setState("error");
        }
      } catch {
        setState("error");
      }
    });
  }

  const isClickable = state === "idle" || state === "error";
  const clickableClass = isClickable
    ? "cursor-pointer hover:opacity-80 active:opacity-60 transition-opacity"
    : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Title — clickable when idle/error */}
      <h1
        onClick={isClickable ? handleSuggest : undefined}
        className={`text-2xl font-bold text-wire-text leading-tight text-center ${clickableClass}`}
        title={isClickable ? "Click to suggest this movie" : undefined}
      >
        {movie.title}
      </h1>

      {/* Poster — clickable when idle/error */}
      <div
        className={`flex justify-center ${clickableClass}`}
        onClick={isClickable ? handleSuggest : undefined}
        title={isClickable ? "Click to suggest this movie" : undefined}
      >
        {posterUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            width={185}
            height={278}
            className="border-2 border-wire-border rounded-sm object-cover"
            style={{ maxWidth: "185px", height: "auto" }}
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
            style={{ width: 185, height: 278 }}
          >
            No poster
          </div>
        )}
      </div>

      {/* Year / runtime */}
      <p className="text-wire-text-muted text-base text-center">
        {year ? `${year} · ` : ""}
        {runtimeDisplay}
      </p>

      {/* Status / button area */}
      {state === "success" && scheduledAt && (
        <div
          className="
            border-2 border-wire-border
            bg-wire-surface
            rounded-sm
            px-4 py-5
            text-wire-text
            text-center
            text-base
            font-bold
          "
        >
          {movie.title} has been scheduled!
          <br />
          <span className="font-normal">
            Screening on{" "}
            {new Date(scheduledAt).toLocaleString("en-US", {
              timeZone: "America/Los_Angeles",
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
            .
          </span>
          {movieId && (
            <div className="mt-3">
              <a
                href={`/api/ics/${movieId}`}
                download
                className="
                  inline-flex items-center
                  border border-wire-border
                  bg-wire-white
                  rounded-sm
                  px-3 py-1.5
                  text-wire-text-muted
                  text-xs
                  font-normal
                  hover:bg-wire-surface
                  transition-colors
                "
              >
                Add to Your Calendar
              </a>
            </div>
          )}
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/suggest"
              className="text-sm text-wire-accent font-normal hover:opacity-80"
            >
              ← Suggest another movie
            </Link>
            <Link
              href="/"
              className="text-sm text-wire-accent font-normal hover:opacity-80"
            >
              See the schedule →
            </Link>
          </div>
        </div>
      )}

      {state === "rate_limited" && nextEligibleAt && (
        <div
          className="
            border-2 border-wire-border
            bg-wire-surface
            rounded-sm
            px-4 py-5
            text-wire-text
            text-center
            text-base
          "
        >
          You&apos;ve already suggested a movie this week.
          <br />
          <span className="font-normal">
            You can suggest again on{" "}
            {new Date(nextEligibleAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            .
          </span>
        </div>
      )}

      {state === "no_slots" && (
        <div
          className="
            border-2 border-wire-border
            bg-wire-surface
            rounded-sm
            px-4 py-5
            text-wire-text
            text-center
            text-base
          "
        >
          No screening slots are available right now.
          <br />
          <span className="font-normal">Check back later!</span>
        </div>
      )}

      {state === "error" && (
        <div
          className="
            border-2 border-wire-border
            bg-wire-surface
            rounded-sm
            px-4 py-4
            text-wire-text
            text-center
            text-base
          "
        >
          Something went wrong — please try again.
        </div>
      )}

      {(state === "idle" || state === "error") && (
        <button
          type="button"
          onClick={handleSuggest}
          disabled={isPending}
          className="
            w-full
            border-2 border-wire-border
            bg-wire-white
            hover:bg-wire-surface
            active:bg-wire-surface-2
            disabled:opacity-50
            disabled:cursor-not-allowed
            text-wire-text
            text-lg font-bold
            rounded-sm
            px-4 py-3
            cursor-pointer
            transition-colors
          "
        >
          {isPending ? "Submitting…" : "Suggest this movie"}
        </button>
      )}
    </div>
  );
}
