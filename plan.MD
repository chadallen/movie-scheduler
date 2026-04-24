# Movie Scheduler — Plan

**Task tracking:** Task tracking is via bd. Run `bd ready` for next tasks.
**Active epic:** movie-scheduler-xc2 — Foundation (5 tasks) · movie-scheduler-5vb — Movie Search (3 tasks) · movie-scheduler-6lp — Scheduling (3 tasks) · movie-scheduler-e11 — Upcoming Schedule (3 tasks) · movie-scheduler-yes — Polish and Deploy (3 tasks) · movie-scheduler-9ic — Tester authentication bypass (3 tasks) · movie-scheduler-6rs — Environment and service setup (7 tasks) · movie-scheduler-48z — UI Polish (9 tasks) · movie-scheduler-999 — Admin user management (3 tasks)

---

## Overall Plan

1. **Foundation** (`xc2`) — Next.js scaffold, Supabase schema, Clerk phone auth, allowlist enforcement, env config
2. **Movie Search** (`5vb`) — TMDB client, search UI, movie detail + suggest button
3. **Scheduling** (`6lp`) — Rate limit, suggest server action, confirmation UI
4. **Upcoming Schedule** (`e11`) — Schedule page, ICS generation, add-to-calendar UI
5. **Polish and Deploy** (`yes`) — Mobile layout, design polish, Vercel deployment

---

## Current Status

### 2026-04-24

Completed full environment setup (6rs all 7 closed): Clerk project configured, Supabase schema + `claim_slot` RPC applied, TMDB key obtained, `.env.local` populated, allowlist seeded, available_slots seeded (every Friday at 7pm PT through end of 2026 using `make_timestamptz`). Fixed two bugs discovered during setup: `claim_slot` ambiguous `starts_at` column reference, and timezone display requiring explicit `timeZone: 'America/Los_Angeles'`. App is running end-to-end locally — Dune successfully suggested and scheduled. Created and completed UI Polish epic (48z): Comic Sans font, sign-out button removed, search dropdown thumbnails removed, suggest page redesigned (title above smaller poster, clickable), home page layout redesigned (suggest button first), post-sign-in redirect to /suggest, header title enlarged, hidden /sign-out page at `/sign-out` for tester use, success message shows time + Add to Your Calendar link.

**Next session:** `movie-scheduler-yes.3` (Vercel deployment) — create Vercel project, set env vars, deploy and smoke-test.

---

## Known Issues / Blockers

- `movie-scheduler-yes.3` (Vercel deploy): requires user to create Vercel project and set env vars in dashboard — cannot be automated. Ready to proceed (6rs complete).
- `WEEKLY_MOVIE_LIMIT` is currently 200 in `lib/config.ts` — lower before production deploy.

---

## Build Notes

