# ADR-0001: Use Clerk for Phone OTP Authentication

**Date:** 2026-04-23
**Status:** Accepted

## Context

The app requires phone number + OTP authentication so only allowlisted friends can suggest movies. We needed an auth solution that handles SMS delivery and OTP verification without building it from scratch.

## Decision

Use Clerk for authentication. Clerk provides a first-class Next.js SDK, built-in phone OTP support with no external SMS provider configuration required, and a generous free tier suitable for a personal app.

## Alternatives Considered

**Supabase phone auth** — Supabase is already in the stack for the database, so consolidating auth there was appealing. However, Supabase phone auth requires configuring a separate Twilio account for SMS delivery, adding setup overhead and an extra dependency. Clerk handles SMS internally on its free tier.

**Custom OTP (Twilio Verify directly)** — Would require building the full OTP flow (code generation, expiry, retry logic) ourselves. Unnecessary given off-the-shelf solutions exist.

## Consequences

- Phone OTP works out of the box with minimal configuration.
- Adds Clerk as a third service alongside Vercel and Supabase.
- User identity (phone number in E.164 format) flows from Clerk into all Supabase queries — the allowlist check must happen server-side after Clerk auth succeeds.
- Switching auth providers later would require updating middleware, session handling, and every place `currentUser()` is called.
