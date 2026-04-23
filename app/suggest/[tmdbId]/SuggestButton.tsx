"use client";

import { useState, useTransition } from "react";
import { suggestMovie, type MovieInput } from "@/lib/actions/suggestMovie";

interface SuggestButtonProps {
  movie: MovieInput;
}

type ButtonState = "idle" | "success" | "error" | "rate_limited" | "no_slots";

export default function SuggestButton({ movie }: SuggestButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [nextEligibleAt, setNextEligibleAt] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSuggest() {
    startTransition(async () => {
      try {
        const result = await suggestMovie(movie);
        if (result.success) {
          setScheduledAt(result.scheduledAt);
          setButtonState("success");
        } else if (result.error === "rate_limited") {
          setNextEligibleAt(result.nextEligibleAt);
          setButtonState("rate_limited");
        } else if (result.error === "no_slots") {
          setButtonState("no_slots");
        } else {
          setButtonState("error");
        }
      } catch {
        setButtonState("error");
      }
    });
  }

  if (buttonState === "success" && scheduledAt) {
    const formatted = new Date(scheduledAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
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
        <span className="font-normal">Screening on {formatted}.</span>
      </div>
    );
  }

  if (buttonState === "rate_limited" && nextEligibleAt) {
    const formatted = new Date(nextEligibleAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
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
        <span className="font-normal">You can suggest again on {formatted}.</span>
      </div>
    );
  }

  if (buttonState === "no_slots") {
    return (
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
    );
  }

  if (buttonState === "error") {
    return (
      <div className="flex flex-col gap-3">
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
        <button
          type="button"
          onClick={() => setButtonState("idle")}
          className="
            w-full
            border-2 border-wire-border
            bg-wire-white
            hover:bg-wire-surface
            active:bg-wire-surface-2
            text-wire-text
            text-lg font-bold
            rounded-sm
            px-4 py-3
            cursor-pointer
            transition-colors
          "
        >
          Try again
        </button>
      </div>
    );
  }

  return (
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
  );
}
