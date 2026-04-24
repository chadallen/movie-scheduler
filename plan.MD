# Movie Scheduler — Plan

**Task tracking:** Task tracking is via bd. Run `bd ready` for next tasks.
**Active epic:** movie-scheduler-xc2 — Foundation (5 tasks) · movie-scheduler-5vb — Movie Search (3 tasks) · movie-scheduler-6lp — Scheduling (3 tasks) · movie-scheduler-e11 — Upcoming Schedule (3 tasks) · movie-scheduler-yes — Polish and Deploy (3 tasks) · movie-scheduler-9ic — Tester authentication bypass (3 tasks)

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

Setup and planning session. Finalized PRD (Next.js/TypeScript, Supabase, Clerk for phone OTP, TMDB for movie search, pnpm). Design direction set to deliberate Balsamiq wireframe aesthetic (Balsamiq Sans, gray tones, black borders — intentionally lo-fi). Created GitHub repo (`chadallen/movie-scheduler`, private). Initialized project workflow: CLAUDE.md, plan.MD, beads task tracking, Claude Code hooks. Created 5 epics and 17 tasks covering all PRD features with full dependency chains. All pushed to remote.

**Next session:** Start with `movie-scheduler-xc2.1` (Scaffold Next.js app) — the only unblocked task. Run `/build-tasks movie-scheduler-xc2` to build the Foundation epic autonomously.

---

## Known Issues / Blockers

None yet.

---

## Build Notes

