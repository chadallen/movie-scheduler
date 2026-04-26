# Movie Scheduler — Plan

**Task tracking:** Task tracking is via bd. Run `bd ready` for next tasks.
**Active epic:** movie-scheduler-999 — Admin user management (all closed) · movie-scheduler-3uj — Theme switcher (4 tasks) · movie-scheduler-ohk — claim_slot RPC past-slot fix · movie-scheduler-plc — Favicon

---

## Overall Plan

1. **Foundation** (`xc2`) — Next.js scaffold, Supabase schema, Clerk phone auth, allowlist enforcement, env config
2. **Movie Search** (`5vb`) — TMDB client, search UI, movie detail + suggest button
3. **Scheduling** (`6lp`) — Rate limit, suggest server action, confirmation UI
4. **Upcoming Schedule** (`e11`) — Schedule page, ICS generation, add-to-calendar UI
5. **Polish and Deploy** (`yes`) — Mobile layout, design polish, Vercel deployment

---

## Current Status

### 2026-04-26

Built and deployed the full admin stack (`999.2`, `999.3`, `t7a`, `b6e`): server actions for user management and movie deletion, `/admin` page with user table + inline edit + create form + scheduled movies delete section. Fixed numerous production bugs: server actions now return error objects instead of throwing (fixes Next.js error boundary issue), sign-in redirects to `redirect_url` param so admin lands on `/admin` when navigating there first, phone inputs auto-prepend `+1`, home page forced dynamic so new movies appear without redeployying, scheduled movie filter now uses Pacific date (today or later) instead of UTC timestamp. Created tasks for remaining work: `ohk` (claim_slot RPC past-slot fix — needs SQL run in Supabase), `plc` (favicon), `3uj` epic (theme switcher: Cinema Dark / Classic, 4 tasks).

**Next session:** Run SQL for `movie-scheduler-ohk` in Supabase SQL editor (already documented in `lib/actions/suggestMovie.ts`), then `/build-tasks movie-scheduler-3uj --auto` for the theme switcher epic, or tackle `plc` (favicon).

---

## Known Issues / Blockers

- `movie-scheduler-ohk` (claim_slot RPC): requires manual SQL run in Supabase SQL editor — SQL is in `lib/actions/suggestMovie.ts` comment. Until done, users can suggest movies into past slots.
- `WEEKLY_MOVIE_LIMIT` is currently 200 in `lib/config.ts` — lower before production deploy.
- `ADMIN_PHONE` must be set in Vercel environment variables (currently only in `.env.local`).
- April 24 Dune row (`efc3bd82`) still in `scheduled_movies` with a past slot — harmless but can be deleted from Supabase directly.

---

## Build Notes

