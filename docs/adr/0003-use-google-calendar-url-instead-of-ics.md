# ADR-0003: Use Google Calendar URL Instead of ICS for Add-to-Calendar

**Date:** 2026-04-25
**Status:** Accepted

## Context

After a movie is scheduled, users are shown an "Add to Your Calendar" link. The app needs to let users save the event to their calendar with minimal friction. All users of this app are known to be Google Calendar users — there is no requirement to support other calendar applications.

## Decision

Replace the server-side ICS file endpoint (`/api/ics/[id]`) with a direct Google Calendar URL (`https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=START/END`). The link opens Google Calendar in a new tab with the event pre-filled; the user clicks Save once.

## Alternatives Considered

**ICS file download:** Generates a `.ics` file served from a Next.js route handler. Works across any calendar application (Apple Calendar, Outlook, Google, etc.), but requires a server round-trip, triggers a file download, and hands off to whatever the user's default calendar app is — which may not be Google Calendar. More general-purpose than this app needs.

## Consequences

- One-click flow: no file download, no "open with" dialog, no server round-trip after initial page load.
- Only works for Google Calendar. Any user not on Google Calendar gets a broken experience — accepted because the audience is known.
- The ICS route handler and `ics_uid` column are removed; recovering ICS support later would require adding them back.
