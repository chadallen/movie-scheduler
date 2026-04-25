# ADR-0004: Cinema Dark Theme

**Date:** 2026-04-25
**Status:** Accepted
**Supersedes:** ADR-0002

## Context

The app launched with a Balsamiq wireframe aesthetic (Comic Sans font, off-white backgrounds, black borders). While intentionally lo-fi and distinctive, the wireframe look was harder to read in low-light environments — the primary setting for a movie night app. The friend group uses the app on phones, often in a darkened room before or during a movie.

## Decision

Replace the Balsamiq wireframe aesthetic with a cinema dark theme. Token names (wire-*) are preserved so no component files need to change. New values: near-black backgrounds (#111111, #1c1c1c, #252525), warm white text (#ede9e0, #f0ece4), a dark border (#333333), and a gold accent (#c9a84c) for interactive elements. Replace Comic Sans with DM Sans (400 and 700 weights) from Google Fonts via next/font/google.

## Alternatives Considered

**Keep the wireframe aesthetic** — Distinctive but poor contrast in dark rooms. The novelty wears off; usability matters more for a real tool.

**Generic dark mode (shadcn/ui dark defaults)** — Clean but impersonal. The cinema-specific warm palette (gold accent, warm whites) gives the app character without the readability downsides of Comic Sans.

**System light/dark preference** — CLAUDE.md rules out light/dark mode; the dark theme is the single intended experience.

## Consequences

- Better legibility in low-light / movie-watching environments.
- DM Sans is a clean, readable sans-serif; no licensing cost via Google Fonts.
- wire-* token names are unchanged — all component files continue to work without modification.
- The gold accent token (--color-wire-accent) is new and available for interactive element styling.
- The lo-fi "prototype" feel is gone; the app now looks intentionally designed rather than unfinished.
