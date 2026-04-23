"use client";

import { useState, useTransition } from "react";
import { suggestMovie } from "@/lib/actions/suggestMovie";

interface SuggestButtonProps {
  tmdbId: number;
}

type ButtonState = "idle" | "success" | "error";

export default function SuggestButton({ tmdbId }: SuggestButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSuggest() {
    startTransition(async () => {
      try {
        const result = await suggestMovie(tmdbId);
        setScheduledAt(result.scheduledAt);
        setButtonState("success");
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
        Your movie has been suggested!
        <br />
        <span className="font-normal">Scheduled for {formatted}.</span>
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
