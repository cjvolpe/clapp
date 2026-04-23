-- Ensures completed_climbs has a created_at timestamp so the leaderboard
-- endpoint can filter rows logged within the past 30 days. Idempotent so it
-- is safe to apply against existing databases that already have the column.

ALTER TABLE completed_climbs
    ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS completed_climbs_created_at_idx
    ON completed_climbs (created_at DESC);

CREATE INDEX IF NOT EXISTS completed_climbs_climber_created_at_idx
    ON completed_climbs (climber, created_at DESC);
