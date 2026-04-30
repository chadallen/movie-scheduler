# UAT Test Plan — Theater With a View

**Environment:** Production (`fork.pizza`)  
**Auth:** TESTER_PHONE (has user + admin privileges via `isAdminPhone()`)  
**Data policy:** Suggestions created during testing are real prod data; test users are created then deleted as cleanup.

---

## Phase 1 — Unauthenticated (public pages)

| # | Step | Expected |
|---|------|----------|
| 1.1 | Load `fork.pizza` | Home page renders: title, gear icon, "Suggest a movie" CTA, upcoming movie list with posters/dates |
| 1.2 | Scroll movie list | All scheduled movies visible with runtime, date, "Add to Your Calendar" button |
| 1.3 | Click "Add to Your Calendar" on any film | New tab opens Google Calendar pre-filled with correct title, start (7:00 PM PT), and end (start + runtime) |
| 1.4 | Click "Suggest a movie" | Redirects to `/sign-in?redirect_url=/suggest` |
| 1.5 | Click gear icon | Redirects to `/sign-in?redirect_url=/preferences` |
| 1.6 | Sign-in form | Renders with phone input, "Send code" button; cinema dark theme |

---

## Phase 2 — Authentication

| # | Step | Expected |
|---|------|----------|
| 2.1 | Enter TESTER_PHONE on sign-in page | "Send code" button activates; submitting moves to OTP step (tester bypass path) |
| 2.2 | Enter TESTER_OTP | Session created; redirected to `/suggest` |
| 2.3 | Reload home page authenticated | "Suggest a movie" CTA still visible; gear icon links to `/preferences` |

---

## Phase 3 — User flows (authenticated)

| # | Step | Expected |
|---|------|----------|
| 3.1 | Navigate to `/suggest` | Movie search form renders |
| 3.2 | Search for a movie (e.g. "Ran") | TMDB results appear with posters and year |
| 3.3 | Click a search result | `/suggest/[tmdbId]` page loads with full movie details and "Suggest this movie" button |
| 3.4 | Submit the suggestion | Success: movie scheduled into the next available slot; confirmation shown |
| 3.5 | Verify on home page | Suggested movie appears in upcoming list with correct date |
| 3.6 | Navigate to `/preferences` | Preferences page loads; theme options visible |
| 3.7 | Navigate to `/sign-out` | Session ends; redirected away; gear icon links back to sign-in |

---

## Phase 4 — Admin flows (authenticated as tester/admin)

| # | Step | Expected |
|---|------|----------|
| 4.1 | Sign in again as TESTER_PHONE | Authenticated |
| 4.2 | Navigate to `/admin` | Admin page loads (not redirected to `/not-authorized`); "User Management" and "Scheduled Movies" sections visible |
| 4.3 | Inspect user list | Existing allowlist users shown |
| 4.4 | Create new user `+19175758973` | User appears in list with phone number |
| 4.5 | Delete the test user `+19175758973` | User removed from list |
| 4.6 | Inspect scheduled movies list | Movie suggested in Phase 3 (step 3.4) appears |
| 4.7 | Delete the suggested movie | Movie removed from scheduled list; slot restored |
| 4.8 | Verify home page cleanup | Deleted movie no longer appears in upcoming list |

---

## Pass criteria

All steps pass with no JS console errors beyond the expected Clerk domain warning on localhost. Production has no such warning.

## Known non-issues

- Clerk production key warning only appears on localhost (domain mismatch), not on fork.pizza.
