# Movie Scheduler — Plan

**Task tracking:** Task tracking is via bd. Run `bd ready` for next tasks.
**Active epic:** none — `movie-scheduler-ohk` (claim_slot RPC fix, needs manual Supabase SQL run) is the only remaining open task

---

## Overall Plan

1. **Foundation** (`xc2`) — Next.js scaffold, Supabase schema, Clerk phone auth, allowlist enforcement, env config
2. **Movie Search** (`5vb`) — TMDB client, search UI, movie detail + suggest button
3. **Scheduling** (`6lp`) — Rate limit, suggest server action, confirmation UI
4. **Upcoming Schedule** (`e11`) — Schedule page, ICS generation, add-to-calendar UI
5. **Polish and Deploy** (`yes`) — Mobile layout, design polish, Vercel deployment

---

## Current Status

### 2026-04-30

Full end-to-end UAT against production passed. Fixed tester OTP bypass: `signIn.ticket()` doesn't set `createdSessionId` in Clerk v7 — replaced with `signIn.create({ strategy: 'ticket', ticket })`. Also: updated `TESTER_PHONE` to `+19175758974` in Vercel (same as `ADMIN_PHONE`), added `TEST_MODE` toggle, added `scripts/deploy.sh` for API-triggered Vercel rebuilds. UAT confirmed: sign-in bypass, movie suggest, /preferences, admin user create/delete, admin movie delete — all working in production.

**Next session:** Run SQL for `movie-scheduler-ohk` in Supabase SQL editor — SQL is in the comment block at the top of `lib/actions/suggestMovie.ts`. That is the only remaining open task.

### 2026-04-26

Shipped the complete theme switcher epic (`3uj`): CSS wireframe tokens, ThemeContext/ThemeProvider, `/preferences` page with Cinema Dark / Classic radio picker, and a gear icon in the header. Also shipped SVG gear icon replacing the Unicode ⚙ (`j5a`), removed preference subtitles (`2e3`), and designed a movie camera favicon in gold on dark (`plc`). Tagged `pre-theme-picker` rollback point. All changes deployed to production via `production` branch.

---

## Known Issues / Blockers

- `movie-scheduler-ohk` (claim_slot RPC): requires manual SQL run in Supabase SQL editor — SQL is in `lib/actions/suggestMovie.ts` comment. Until done, users can suggest movies into past slots.
- `WEEKLY_MOVIE_LIMIT` is currently 200 in `lib/config.ts` — lower before production deploy.
- April 24 Dune row (`efc3bd82`) still in `scheduled_movies` with a past slot — harmless, can be deleted from Supabase directly.

---

## Testing

UAT test plan: [`docs/uat.md`](docs/uat.md)
Production URL: `https://movies.fork.pizza`
Tester flow: enter `TESTER_PHONE` + `TESTER_OTP` (bypass active when `TEST_MODE=true` in Vercel)

---

## Build Notes

