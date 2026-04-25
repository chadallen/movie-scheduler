# ADR-0002: Balsamiq Wireframe Visual Aesthetic

**Date:** 2026-04-23
**Status:** Superseded by ADR-0004

## Context

The app is a personal tool for movie nights with friends. It needed a visual design direction. The initial PRD called for "bright, fun colors" but the owner wanted something more distinctive and intentionally lo-fi.

## Decision

Style the app to look like a Balsamiq wireframe brought to life: Balsamiq Sans font (Google Fonts), off-white and gray backgrounds, black borders on all interactive elements, no bright colors, no gradients, no drop shadows. The aesthetic should feel like a hand-sketched prototype that someone accidentally shipped.

## Alternatives Considered

**Bright/fun color palette** — The original PRD direction. Rejected in favor of something more distinctive and personality-driven.

**Standard modern UI (shadcn/ui, Tailwind defaults)** — Clean but generic. The wireframe look is more memorable for a personal app used by a small friend group.

## Consequences

- Distinctive visual identity that's immediately recognizable.
- Balsamiq Sans is available from Google Fonts — no licensing cost.
- All UI tasks must apply the wireframe aesthetic consistently; it's documented in CLAUDE.md and task descriptions to prevent drift.
- The lo-fi look means no pressure to polish animations, hover states, or transitions — which keeps implementation simple.
