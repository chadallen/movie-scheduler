-- =============================================================================
-- Movie Scheduler — Supabase Schema
-- =============================================================================
-- Three tables:
--   allowlist        — phone numbers the admin has authorized to suggest movies
--   available_slots  — future screening times the admin has opened up
--   scheduled_movies — movies that have been suggested and auto-scheduled
--
-- The app only:
--   • reads allowlist to check authorization
--   • reads available_slots to find the next open slot, then flips is_taken
--   • inserts into scheduled_movies
--
-- Admin populates allowlist and available_slots directly via Supabase table editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- allowlist
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS allowlist (
    id         uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    phone      text        NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- available_slots
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS available_slots (
    id        uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    starts_at timestamptz NOT NULL,
    is_taken  boolean     NOT NULL DEFAULT false
);

-- Partial index for the slot-finding query: next available slot ordered by date.
-- Only indexes rows where is_taken = false, keeping the index small.
CREATE INDEX IF NOT EXISTS idx_available_slots_starts_at_open
    ON available_slots (starts_at)
    WHERE is_taken = false;

-- ---------------------------------------------------------------------------
-- scheduled_movies
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheduled_movies (
    id                 uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    slot_id            uuid        NOT NULL REFERENCES available_slots (id) ON DELETE RESTRICT,
    title              text        NOT NULL,
    tmdb_id            integer,
    runtime_minutes    integer,
    poster_path        text,
    suggested_by_phone text        NOT NULL,
    ics_uid            uuid        NOT NULL DEFAULT gen_random_uuid(),
    created_at         timestamptz NOT NULL DEFAULT now()
);
