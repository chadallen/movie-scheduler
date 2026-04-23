# Movie Scheduler — Product Requirements

## Vision

I host a lot of movie nights at my house. I want my friends to be able to suggest movies they would like me to show, and then have their suggested movie be automatically added to the next available calendar slot. That way there isn't a lot of back and forth about what to watch and when, and everyone has an easy way to get movies on the schedule.

## Goals

This is a personal app for my use only. It should be accessible via web browser and optimized for mobile. My friends should be able to access it, but it is invite-only: users authenticate via phone number + OTP, and only phone numbers on an admin-maintained allowlist can suggest movies. It's first come first serve — a suggested movie is immediately scheduled into the next available time slot. There is no approval workflow. A rate limit prevents any user from suggesting more than 1 movie per week (configurable constant). Users can add scheduled movies to their Google Calendar via ICS file. The upcoming schedule is publicly visible without login.

## Design Principles

Keep it simple. Admin features do not need to be in the app — the admin (just me) can manage data directly via the Supabase table editor. Don't build things from scratch that services already provide. Host on Vercel.

The app should have a clean, modern look. No light/dark mode needed. Use bright, fun colors.

## Tech Stack

- **Frontend/Backend:** Next.js (TypeScript) on Vercel
- **Database & Admin UI:** Supabase (Postgres)
- **Authentication:** Clerk (phone OTP)
- **Movie Search API:** TMDB (The Movie Database)

## User Personas

- **User:** A friend who suggests movies. Authenticates via phone OTP. Can only proceed if their phone number is on the allowlist.
- **Admin:** Me. Manages the allowlist of authorized phone numbers and the list of available time slots directly in Supabase.

## Features

### Authenticate

Before entering the search and suggest workflow, the user must enter their phone number and a numeric OTP sent to that phone via Clerk. If the phone number is not on the admin-maintained allowlist in Supabase, they cannot proceed.

### Search Movie

The user can search for movies by title using the TMDB API. Entering a title (e.g. "Dune") returns matching results so the user can select the specific movie they want to suggest.

### Suggest Movie

Once the user has found their movie, they can suggest it with a single tap. The movie is immediately scheduled into the next available time slot. If the user has already suggested a movie in the past 7 days, the request is rejected (rate limit: 1 movie/week, stored as a configurable constant).

### Upcoming Schedule

A publicly visible page listing all scheduled movies in chronological order. No login required to view. Each entry includes the movie title, date/time, and an option to add it to the user's Google Calendar via ICS file download.

### Add to Calendar

Scheduled movies can be added to Google Calendar via an ICS file linked from the upcoming schedule page. No Twilio or SMS integration needed for this.

### Maintain Available Slots (Admin)

The admin maintains a table of available time slots in Supabase (date + time). When a movie is scheduled, the app claims the earliest available slot and marks it as taken. The admin adds new slots directly via the Supabase table editor.

### Maintain Allowlist (Admin)

The admin maintains a table of authorized phone numbers in Supabase. New users are added directly via the Supabase table editor.

## Out of Scope

- Allowing users to select a specific date for their movie
- Allowing users to modify or cancel a previous suggestion
- Any admin UI inside the app (all admin work done in Supabase directly)
- SMS notifications or alerts
- Light/dark mode

## Future Versions

- Allow users to opt in to text message alerts when new movies are added or new slots become available
- Automatically adjust movie start time based on sunset time and runtime
