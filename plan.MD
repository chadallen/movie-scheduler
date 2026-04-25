# Movie Scheduler — Plan

**Task tracking:** Task tracking is via bd. Run `bd ready` for next tasks.
**Active epic:** movie-scheduler-xc2 — Foundation (5 tasks) · movie-scheduler-5vb — Movie Search (3 tasks) · movie-scheduler-6lp — Scheduling (3 tasks) · movie-scheduler-e11 — Upcoming Schedule (3 tasks) · movie-scheduler-yes — Polish and Deploy (3 tasks) · movie-scheduler-9ic — Tester authentication bypass (3 tasks) · movie-scheduler-6rs — Environment and service setup (7 tasks) · movie-scheduler-48z — UI Polish (9 tasks) · movie-scheduler-999 — Admin user management (3 tasks, 999.1 closed) · movie-scheduler-h2f — UX improvements (4 tasks)

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

Created and built the full UX improvements epic (`h2f`): cinema dark theme (DM Sans, dark palette, ADR-0004), back-to-search nav link, success state nav links, gold accent on text links. Fixed two pre-existing bugs found during review: broken `pnpm lint` (migrated to ESLint flat config) and invisible sign-in button (`bg-wire-gray` → `bg-wire-surface-2`). Completed `c3e` (ICS → Google Calendar URL). Renamed app to "Theater With a View" everywhere. Added admin movie deletion tasks (`t7a`, `b6e`). Multiple deploys throughout — live at movies.fork.pizza.

**Next session:** Start with `movie-scheduler-999.2` (admin server actions for user management) which unblocks `999.3` (admin UI). Then `t7a` + `b6e` (delete scheduled movies). Or run `/build-tasks movie-scheduler-999 --auto`.

---

## Known Issues / Blockers

- `movie-scheduler-yes.3` (Vercel deploy): requires user to create Vercel project and set env vars in dashboard — cannot be automated. Ready to proceed (6rs complete).
- `WEEKLY_MOVIE_LIMIT` is currently 200 in `lib/config.ts` — lower before production deploy.
- `movie-scheduler-999.2` (admin server actions) must be built before `999.3` (admin UI) and before `b6e` (delete movie UI).

---

## Build Notes

