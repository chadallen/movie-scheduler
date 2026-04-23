"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { TmdbMovie } from "@/lib/tmdb";

type SearchState = "idle" | "loading" | "done" | "error";

export default function SearchMovies() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [state, setState] = useState<SearchState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setState("idle");
      return;
    }

    setState("loading");

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data: TmdbMovie[] = await res.json();
        setResults(data);
        setState("done");
      } catch {
        setResults([]);
        setState("error");
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  return (
    <div className="w-full">
      {/* Search input */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a movie..."
        className="
          w-full
          border-2 border-wire-border
          bg-wire-white
          text-wire-text
          placeholder:text-wire-text-muted
          px-4
          text-lg
          rounded-sm
          outline-none
          focus:bg-wire-surface
          min-h-[44px]
        "
        autoComplete="off"
        autoFocus
      />

      {/* Status messages */}
      <div className="mt-4">
        {state === "loading" && (
          <p className="text-wire-text-muted text-center py-4">Searching...</p>
        )}

        {state === "error" && (
          <p className="text-wire-text text-center py-4 border-2 border-wire-border bg-wire-surface rounded-sm">
            Search failed — please try again.
          </p>
        )}

        {state === "done" && results.length === 0 && (
          <p className="text-wire-text-muted text-center py-4">
            No movies found for &ldquo;{query.trim()}&rdquo;.
          </p>
        )}

        {/* Results list */}
        {state === "done" && results.length > 0 && (
          <ul className="flex flex-col gap-2">
            {results.map((movie) => (
              <li key={movie.tmdb_id}>
                <Link
                  href={`/suggest/${movie.tmdb_id}`}
                  className="
                    flex items-center gap-3
                    border-2 border-wire-border
                    bg-wire-white
                    hover:bg-wire-surface
                    active:bg-wire-surface-2
                    rounded-sm
                    px-4
                    min-h-[56px]
                    transition-colors
                    no-underline
                  "
                >
                  {movie.poster_path && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt=""
                      width={36}
                      height={54}
                      className="border border-wire-border rounded-sm flex-shrink-0 object-cover"
                      style={{ width: 36, height: 54 }}
                    />
                  )}
                  {!movie.poster_path && (
                    <div
                      className="border border-wire-border bg-wire-surface rounded-sm flex-shrink-0 flex items-center justify-center text-wire-text-muted text-xs"
                      style={{ width: 36, height: 54 }}
                    >
                      ?
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-wire-text font-bold text-base leading-tight truncate">
                      {movie.title}
                    </span>
                    {movie.year && (
                      <span className="text-wire-text-muted text-sm">
                        {movie.year}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
