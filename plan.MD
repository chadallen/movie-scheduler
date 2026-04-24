# Movie Scheduler — Plan

**Task tracking:** Task tracking is via bd. Run `bd ready` for next tasks.
**Active epic:** movie-scheduler-xc2 — Foundation (5 tasks) · movie-scheduler-5vb — Movie Search (3 tasks) · movie-scheduler-6lp — Scheduling (3 tasks) · movie-scheduler-e11 — Upcoming Schedule (3 tasks) · movie-scheduler-yes — Polish and Deploy (3 tasks) · movie-scheduler-9ic — Tester authentication bypass (3 tasks) · movie-scheduler-6rs — Environment and service setup (7 tasks)

---

## Overall Plan

1. **Foundation** (`xc2`) — Next.js scaffold, Supabase schema, Clerk phone auth, allowlist enforcement, env config
2. **Movie Search** (`5vb`) — TMDB client, search UI, movie detail + suggest button
3. **Scheduling** (`6lp`) — Rate limit, suggest server action, confirmation UI
4. **Upcoming Schedule** (`e11`) — Schedule page, ICS generation, add-to-calendar UI
5. **Polish and Deploy** (`yes`) — Mobile layout, design polish, Vercel deployment

---

## Current Status

### 2026-04-23

Closed `movie-scheduler-9ic.3` (custom SignInForm with tester bypass). Discovery: the existing code was already correct — it uses Clerk v7's "Future" API (`signIn.phoneCode.sendCode`, `signIn.ticket`, `signIn.finalize`) which differs from the v3/v4 API the task notes assumed. TypeScript compiles clean. Full 9ic epic closed. All code work is complete — remaining tasks are manual service setup (6rs) and Vercel deploy (yes.3).

**Next session:** Complete `movie-scheduler-6rs` setup tasks (Clerk, Supabase, TMDB, .env.local, seed data) — user action required. Then `movie-scheduler-yes.3` (Vercel deploy).

---

## Known Issues / Blockers

- `movie-scheduler-yes.3` (Vercel deploy): requires user to set env vars in Vercel dashboard — cannot be automated. Blocked until 6rs is done.
- `movie-scheduler-6rs.*` (all 7): manual setup tasks — Clerk project, Supabase project, schema, RPC, TMDB key, .env.local, seed data. User must complete these before the app works end-to-end.

---

## Build Notes

