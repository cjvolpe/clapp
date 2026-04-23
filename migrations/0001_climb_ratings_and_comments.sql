-- Adds ratings and comments tables used by the climb detail page (GET /climbs/:id).
-- A climber may submit at most one rating per climb (1-5 stars).
-- Comments are free-form text, ordered chronologically.

create table if not exists climb_ratings (
    id bigserial primary key,
    climb bigint not null references climbs (id) on delete cascade,
    climber uuid not null references auth.users (id) on delete cascade,
    rating smallint not null check (rating between 1 and 5),
    created_at timestamptz not null default now(),
    unique (climb, climber)
);

create index if not exists climb_ratings_climb_idx on climb_ratings (climb);

create table if not exists climb_comments (
    id bigserial primary key,
    climb bigint not null references climbs (id) on delete cascade,
    climber uuid not null references auth.users (id) on delete cascade,
    body text not null check (char_length(body) between 1 and 2000),
    created_at timestamptz not null default now()
);

create index if not exists climb_comments_climb_idx on climb_comments (climb);
