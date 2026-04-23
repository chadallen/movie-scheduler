# Task Proposal — All Features

---

## Epic 1: Foundation

**Title:** Foundation
**Description:** Bootstrap the full project skeleton so every subsequent epic has something to build on. Covers: Next.js app scaffold with Tailwind, environment config, Supabase client + schema, Clerk phone auth, and allowlist enforcement. When this epic is done, a user can hit the site, authenticate with phone OTP, and be either admitted or rejected based on the allowlist. No movie features yet — just the infrastructure.

### 1.1 Scaffold Next.js app

**Description:** Run `pnpm create next-app` with TypeScript, Tailwind CSS, and App Router. Configure Tailwind for the Balsamiq wireframe aesthetic: Comic Sans (or `Balsamiq Sans` from Google Fonts as a web-safe fallback), off-white/gray background tones, and black borders. Set up folder structure: `app/`, `lib/`, `components/`. Add a minimal root layout and placeholder home page so the dev server runs cleanly.
**Design:** The visual target is a hand-drawn wireframe look — think gray graph paper, rough black rectangles, Comic Sans everywhere. `Balsamiq Sans` is available on Google Fonts and is the closest web font to the actual Balsamiq tool aesthetic.
**Acceptance:** `pnpm dev` starts without errors. `/` renders a placeholder page. Tailwind config includes the wireframe design tokens (font, grays, border style).
**Depends on:** None

### 1.2 Environment config and Supabase client

**Description:** Create `.env.example` with placeholder values for all required environment variables: Clerk publishable/secret keys, Supabase URL + anon key + service role key, and TMDB API key. Create `lib/supabase.ts` exporting two clients: a browser client (anon key) and a server client (service role key, server-only). Install `@supabase/supabase-js`. Create `lib/config.ts` exporting `WEEKLY_MOVIE_LIMIT = 1`.
**Design:** The service role client must only be imported in server components or API routes. Phone numbers from Clerk are in E.164 format — use that as the canonical format everywhere.
**Acceptance:** `.env.example` exists with all keys stubbed. `lib/supabase.ts` exports both clients. `lib/config.ts` exports `WEEKLY_MOVIE_LIMIT`. No secrets committed.
**Depends on:** 1.1

### 1.3 Supabase schema

**Description:** Write SQL migration to create three tables: `allowlist` (id, phone text unique, created_at), `available_slots` (id, starts_at timestamptz, is_taken bool default false), `scheduled_movies` (id, slot_id FK → available_slots, title text, tmdb_id int, runtime_minutes int, poster_path text, suggested_by_phone text, ics_uid uuid default gen_random_uuid(), created_at). Add a `docs/schema.sql` file so it's in version control.
**Design:** The app only writes to `available_slots` (flipping `is_taken`) and inserts into `scheduled_movies`. Admin populates `allowlist` and `available_slots` directly via Supabase table editor. Add an index on `available_slots(starts_at)` where `is_taken = false` for the slot-finding query.
**Acceptance:** `docs/schema.sql` runs against a fresh Supabase project without errors. All three tables created with correct columns, constraints, and index.
**Depends on:** 1.2

### 1.4 Clerk phone auth

**Description:** Install `@clerk/nextjs`. Add `ClerkProvider` to the root layout. Create a sign-in page at `app/sign-in/page.tsx` using Clerk's `<SignIn>` component configured for phone OTP only (no email/social). Add Clerk middleware (`middleware.ts`) to protect all routes except `/` (upcoming schedule) and `/sign-in`.
**Design:** Clerk handles all OTP delivery and verification — no custom SMS code. Use `clerkMiddleware` from `@clerk/nextjs/server`. The upcoming schedule `/` must remain publicly accessible without login.
**Acceptance:** Unauthenticated users hitting a protected route are redirected to `/sign-in`. A user can complete the phone OTP flow and land on an authenticated page. `/` is accessible without login.
**Depends on:** 1.1, 1.2

### 1.5 Allowlist enforcement

**Description:** After Clerk authentication, check the signed-in user's phone number against the Supabase `allowlist` table using the server client. If the phone is not found, show a friendly "you're not on the list" page and sign them out of Clerk. If found, allow through to the app. Implement as a server-side check in the post-auth flow.
**Acceptance:** A phone number on the allowlist can authenticate and reach the app. A phone number not on the allowlist sees a friendly rejection page and cannot access protected routes.
**Depends on:** 1.3, 1.4

---

## Epic 2: Movie Search

**Title:** Movie Search
**Description:** Integrate TMDB and build the search + selection UI. When this epic is done, an authenticated user can search for a movie by title, browse results with posters, and select a specific movie to suggest. The "suggest" action is wired up in the next epic.

### 2.1 TMDB API client

**Description:** Create `lib/tmdb.ts` with two functions: `searchMovies(query: string)` (calls TMDB `/search/movie`, returns title, year, poster_path, tmdb_id) and `getMovieDetails(tmdbId: number)` (calls `/movie/{id}`, additionally returns runtime). Use the TMDB API key from env. Define TypeScript types for the response shapes.
**Acceptance:** Both functions return typed results. TMDB API key is read from env. Module can be imported in a server component without errors.
**Depends on:** 1.2

### 2.2 Search page UI

**Description:** Build the search page at `app/suggest/page.tsx`. Include a text input that calls `searchMovies` as the user types (debounce ~300ms). Display results as a scrollable list of movie cards showing title and release year. Handle loading, empty, and error states.
**Design:** This is an authenticated route (covered by Clerk middleware). Keep the UI mobile-first — full-width cards, large tap targets. Use the brand color palette.
**Acceptance:** Typing "Dune" shows Dune movies. Selecting a movie navigates to the detail/confirm view (stub is fine for now). Empty query shows no results. Network error shows an error message.
**Depends on:** 2.1, 1.4

### 2.3 Movie detail and suggest button

**Description:** Add a movie detail view (can be a modal or a separate route at `app/suggest/[tmdbId]/page.tsx`) showing the movie poster, title, year, and runtime. Include a prominent "Suggest this movie" button. Tapping it calls the suggest server action (stub returning success for now) and shows a confirmation or error state.
**Acceptance:** Selecting a movie from search results shows its detail view with runtime. Tapping "Suggest this movie" calls the action and shows feedback. The back/cancel path returns to search.
**Depends on:** 2.2

---

## Epic 3: Scheduling

**Title:** Scheduling
**Description:** Implement the core scheduling logic. When this epic is done, tapping "Suggest this movie" actually schedules it: claims the next available slot, enforces the rate limit, and shows the user their confirmed date and time.

### 3.1 Suggest movie server action

**Description:** Implement `lib/actions/suggestMovie.ts` as a Next.js server action. It should: (1) verify the user is authenticated and on the allowlist, (2) check the rate limit (see task 3.2), (3) find the earliest `available_slots` row where `is_taken = false`, ordered by `starts_at`, (4) in a transaction, insert into `scheduled_movies` and set the slot's `is_taken = true`, (5) return the scheduled slot datetime on success. Use the Supabase server client.
**Design:** The slot claim must be atomic — use a Supabase RPC or a transaction to prevent double-booking if two users suggest at the same time. If no slots are available, return a clear error.
**Acceptance:** Calling the action schedules a movie and marks the slot as taken. Concurrent calls do not double-book the same slot. Returns the confirmed date/time on success, an error string on failure.
**Depends on:** 1.3, 1.5, 2.3

### 3.2 Rate limit enforcement

**Description:** Add a `checkRateLimit(phone: string)` function in `lib/rateLimit.ts`. Query `scheduled_movies` for rows where `suggested_by_phone = phone` and `created_at > now() - interval '7 days'`. If the count is >= `WEEKLY_MOVIE_LIMIT`, return `{ allowed: false }`. Called from the suggest server action before attempting to schedule.
**Acceptance:** A user who has suggested a movie in the past 7 days gets a rate-limit error. A user who has not (or whose previous suggestion was > 7 days ago) is allowed through.
**Depends on:** 1.3, 1.2

### 3.3 Suggestion confirmation UI

**Description:** Wire the suggest server action result into the movie detail view from task 2.3. On success, show a confirmation screen with the movie title and the scheduled date/time ("Your movie is on for Friday, May 9 at 8:00 PM"). On rate-limit error, show a friendly message explaining when they can suggest again. On no-slots error, show a message that no times are currently available.
**Acceptance:** Success shows the confirmed date/time. Rate-limit error shows a helpful message. No-slots error is handled gracefully. All three states are reachable in the UI.
**Depends on:** 3.1, 3.2

---

## Epic 4: Upcoming Schedule

**Title:** Upcoming Schedule
**Description:** Build the public-facing schedule page and the add-to-calendar feature. When this epic is done, anyone (no login required) can see the upcoming movie lineup and download an ICS file to add any movie to their Google Calendar.

### 4.1 Upcoming schedule page

**Description:** Build the public home page at `app/page.tsx`. Query `scheduled_movies` joined with `available_slots` for all movies where `starts_at > now()`, ordered by `starts_at` ascending. Display each movie as a card with: poster, title, runtime, and the scheduled date/time. If no movies are scheduled, show a friendly empty state.
**Design:** Publicly accessible — no auth required. Use the Supabase anon client (or server component with service client, but no user-specific data). Mobile-first layout.
**Acceptance:** The page shows all future scheduled movies in order. Past movies are not shown. Works without being logged in. Empty state renders without errors.
**Depends on:** 1.3

### 4.2 ICS file generation

**Description:** Create an API route at `app/api/ics/[id]/route.ts` that generates an ICS file for a scheduled movie. Look up the `scheduled_movies` row by id, get the `starts_at` from the joined slot, compute end time as `starts_at + runtime_minutes`. Return a valid ICS file with `Content-Type: text/calendar` and `Content-Disposition: attachment`. Use the `ics` npm package or generate the ICS string manually (it's simple enough).
**Design:** The `ics_uid` column on `scheduled_movies` is the UID for the ICS event — ensures the same event doesn't get duplicated if downloaded twice.
**Acceptance:** Hitting `/api/ics/<id>` returns a valid `.ics` file that can be imported into Google Calendar with correct title, start time, and end time.
**Depends on:** 4.1

### 4.3 Add to calendar UI

**Description:** Add an "Add to Calendar" button to each movie card on the upcoming schedule page. The button links to `/api/ics/[id]` which triggers the ICS download. Style it as a secondary action, clearly visible but not distracting from the movie info.
**Acceptance:** Tapping "Add to Calendar" on a movie card downloads the ICS file. Importing it into Google Calendar creates an event with the correct movie title, date, and duration.
**Depends on:** 4.2

---

## Epic 5: Polish and Deploy

**Title:** Polish and Deploy
**Description:** Finalize the UI, harden the mobile experience, and ship to Vercel. When this epic is done, the app is live and usable by friends.

### 5.1 Mobile-first layout and navigation

**Description:** Review all pages for mobile usability. Ensure tap targets are at least 44px, text is readable at mobile sizes, and no horizontal overflow. Add a simple header or nav with the app name and (when authenticated) a sign-out option. Ensure the suggest flow is smooth end-to-end on a phone-sized viewport.
**Acceptance:** The full user flow (sign in → search → suggest → confirmation) works smoothly on a 390px viewport. No horizontal scroll. Sign-out is accessible from the authenticated UI.
**Depends on:** 3.3, 4.3

### 5.2 Design polish

**Description:** Apply the Balsamiq wireframe aesthetic consistently across all pages: Comic Sans / Balsamiq Sans font throughout, off-white or light gray backgrounds, black borders on all cards and inputs, muted gray accent tones only. Buttons should look like hand-drawn rectangles. Add a favicon and descriptive `<title>` tags. Review typography scale and spacing for consistency. Fix any visual rough edges from mobile review.
**Design:** The goal is deliberate lo-fi — it should look like someone printed out a wireframe and is using it as the actual app. No drop shadows, no gradients, no bright colors.
**Acceptance:** All pages use the wireframe aesthetic. No default browser blue links or unstyled elements. App has a favicon. Pages have descriptive `<title>` tags.
**Depends on:** 5.1

### 5.3 Vercel deployment

**Description:** Create a Vercel project connected to the GitHub repo. Configure all production environment variables (Clerk, Supabase, TMDB). Add a `vercel.json` if any custom config is needed. Deploy and smoke-test the full user flow in production: sign in with a real phone number, search for a movie, suggest it, view the schedule, download an ICS.
**Design:** The Supabase production database should be separate from any dev/staging instance. Ensure the Clerk production instance is configured for the Vercel domain.
**Acceptance:** App is live at a Vercel URL. Full user flow works end-to-end in production. Environment variables are set and not exposed client-side.
**Depends on:** 5.2
