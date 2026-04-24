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

Massive build session. Completed Foundation (xc2), Movie Search (5vb), Scheduling (6lp), Upcoming Schedule (e11), and Polish (yes.1, yes.2) epics autonomously. Full app is functionally complete: phone OTP sign-in, TMDB movie search, atomic slot claiming, ICS calendar export, mobile layout, favicon, header with sign-out. Also created tester auth bypass epic (9ic): 9ic.1 (env config + allowlist bypass) and 9ic.2 (server actions with timing-safe comparison) closed. 9ic.3 (custom SignInForm) is in_progress — file created but uses wrong Clerk SDK methods (see task notes). Created 6rs epic with 7 manual setup tasks for user to complete (Clerk, Supabase, TMDB, env, seed data). yes.3 (Vercel deploy) remains open pending manual setup.

**Next session:** Fix `movie-scheduler-9ic.3` — rewrite SignInForm.tsx using correct Clerk SDK API (prepareFirstFactor, attemptFirstFactor, setActive). Then complete `movie-scheduler-6rs` setup tasks (user action required).

---

## Known Issues / Blockers

- `movie-scheduler-9ic.3` in_progress: SignInForm.tsx created but uses wrong Clerk JS SDK methods. Fix list in task notes. Key issues: use `prepareFirstFactor`/`attemptFirstFactor`/`setActive` instead of non-existent `signIn.phoneCode.*` and `signIn.finalize()` methods.
- `movie-scheduler-yes.3` (Vercel deploy): requires user to set env vars in Vercel dashboard — cannot be automated.
- `movie-scheduler-6rs.*` (all 7): manual setup tasks — Clerk project, Supabase project, schema, RPC, TMDB key, .env.local, seed data. User must complete these before the app works end-to-end.

---

## Build Notes

