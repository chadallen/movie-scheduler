# Movie Scheduler — Plan

**Task tracking:** Task tracking is via bd. Run `bd ready` for next tasks.
**Active epic:** movie-scheduler-xc2 — Foundation (5 tasks) · movie-scheduler-5vb — Movie Search (3 tasks) · movie-scheduler-6lp — Scheduling (3 tasks) · movie-scheduler-e11 — Upcoming Schedule (3 tasks) · movie-scheduler-yes — Polish and Deploy (3 tasks) · movie-scheduler-9ic — Tester authentication bypass (3 tasks) · movie-scheduler-6rs — Environment and service setup (7 tasks) · movie-scheduler-48z — UI Polish (9 tasks) · movie-scheduler-999 — Admin user management (3 tasks, 999.1 closed)

---

## Overall Plan

1. **Foundation** (`xc2`) — Next.js scaffold, Supabase schema, Clerk phone auth, allowlist enforcement, env config
2. **Movie Search** (`5vb`) — TMDB client, search UI, movie detail + suggest button
3. **Scheduling** (`6lp`) — Rate limit, suggest server action, confirmation UI
4. **Upcoming Schedule** (`e11`) — Schedule page, ICS generation, add-to-calendar UI
5. **Polish and Deploy** (`yes`) — Mobile layout, design polish, Vercel deployment

---

## Current Status

### 2026-04-25

Thorough start-session (no end-session last time). Closed `movie-scheduler-999.1`: Clerk v7 uses `SignInFutureResource` (signals-based API) — all methods return `{ error: ClerkError | null }` instead of throwing. Fixed all 5 callsites (`create`, `sendCode`, `verifyCode`, `ticket`, `finalize`) to check error returns; this was likely the root cause of sign-in failures. Created `movie-scheduler-c3e` (replace ICS with Google Calendar URL link) and wrote ADR-0003 documenting that decision. Discussed UX improvements: dark cinema theme (replacing Comic Sans), back-to-search nav on detail page, success state navigation links, and gold accent polish pass — four tasks drafted but not yet created in bd (session ended mid-review).

**Next session:** Run `/create-tasks` to confirm the four pending UX tasks (cinema dark theme, back-to-search link, success state nav, gold accent polish), then start with `movie-scheduler-999.2` (admin server actions) or the cinema theme task.

---

## Known Issues / Blockers

- `movie-scheduler-yes.3` (Vercel deploy): requires user to create Vercel project and set env vars in dashboard — cannot be automated. Ready to proceed (6rs complete).
- `WEEKLY_MOVIE_LIMIT` is currently 200 in `lib/config.ts` — lower before production deploy.
- Four UX tasks discussed but not yet filed: cinema dark theme, back-to-search nav, success state nav links, gold accent polish. Run `/create-tasks` next session to create them.

---

## Build Notes

