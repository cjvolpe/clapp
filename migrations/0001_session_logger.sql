-- Session logger: groups completed climbs into a dated session with duration and notes.
--
-- Tables:
--   sessions             - one row per session owned by a user
--   session_climbs       - join row linking a completed_climbs entry to a session
--
-- Run order: apply this file in Supabase SQL editor (or via `supabase db push`)
-- against the same schema that hosts `climbs` and `completed_climbs`.

create table if not exists sessions (
    id              bigserial primary key,
    climber         uuid not null,
    session_date    date not null,
    duration_min    integer,
    notes           text,
    created_at      timestamptz not null default now()
);

create index if not exists sessions_climber_idx on sessions (climber);
create index if not exists sessions_climber_date_idx on sessions (climber, session_date desc);

create table if not exists session_climbs (
    id                   bigserial primary key,
    session_id           bigint not null references sessions(id) on delete cascade,
    completed_climb_id   bigint not null,
    created_at           timestamptz not null default now(),
    unique (session_id, completed_climb_id)
);

create index if not exists session_climbs_session_idx on session_climbs (session_id);
create index if not exists session_climbs_completed_idx on session_climbs (completed_climb_id);
