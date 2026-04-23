-- Free-form tagging system for climbs.
-- Tags are stored once in `tags` (case-insensitive unique name) and joined
-- to climbs via `climb_tags`.

create table if not exists tags (
    id bigserial primary key,
    name text not null,
    created_at timestamptz not null default now()
);

create unique index if not exists tags_name_lower_idx on tags (lower(name));

create table if not exists climb_tags (
    climb bigint not null references climbs(id) on delete cascade,
    tag bigint not null references tags(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (climb, tag)
);

create index if not exists climb_tags_tag_idx on climb_tags (tag);
create index if not exists climb_tags_climb_idx on climb_tags (climb);
