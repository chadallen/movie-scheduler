# Movie Scheduler — CLAUDE.md

## What This Is

A personal mobile-optimized web app for managing movie nights. Friends suggest movies via
a phone-OTP-authenticated interface; suggestions are auto-scheduled into the next available
time slot. The admin (the owner) manages authorized users and available slots directly in
Supabase. No approval workflow, no admin UI in the app.

## Stack

- Next.js (TypeScript) on Vercel
- Supabase (Postgres) — database and admin UI
- Clerk — phone OTP authentication
- TMDB API — movie search and metadata

## Commands

```bash
pnpm dev        # start dev server
pnpm build      # production build
pnpm lint       # lint
```

## Hard Rules

- IMPORTANT: Never commit `.env` or `.env.local`. Use `.env.example` with placeholder values.
- Never expose the Supabase service role key client-side — only use it in server-side routes.
- Clerk, Supabase, and TMDB credentials must only be accessed via environment variables.

## Conventions

- Rate limit constant lives in `lib/config.ts` as `WEEKLY_MOVIE_LIMIT` (currently 200 for testing; lower for production).
- Admin UI lives at `/admin` (phone-gated via `ADMIN_PHONE` env var). User management and schedule management are handled there; general Supabase access still used for slot seeding.
- No light/dark mode. Cinema dark theme: DM Sans font, near-black backgrounds (#111111), warm white text (#ede9e0), dark borders (#333333), gold accent (#c9a84c), dark card surfaces (#242424). wire-* token names unchanged in component files.
- Lint uses ESLint flat config (`eslint.config.mjs`) — `.eslintrc.json` was removed. `next lint` is gone in Next.js 16; run `pnpm lint` which invokes `eslint .` directly.
- `.env.local` must include `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-in` or Clerk redirects to its hosted Account Portal.
- Seed `available_slots` using `make_timestamptz(year, month, day, 19, 0, 0, 'America/Los_Angeles')` — `AT TIME ZONE` on generate_series dates runs backwards (converts UTC→LA instead of LA→UTC).
- Hidden `/sign-out` page exists for tester use — not linked in the UI.

## Task Tracking

Task tracking is via bd. Run `bd ready` for next tasks.
Commits include the task ID: `git commit -m "<message> (<task-id>)"`

Skills: /start-session, /end-session, /create-tasks, /build-tasks, /adr


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
