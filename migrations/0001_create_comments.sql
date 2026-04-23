create table if not exists comments (
    id bigint generated always as identity primary key,
    climb bigint not null references climbs(id) on delete cascade,
    author uuid not null references auth.users(id) on delete cascade,
    author_name text,
    author_avatar text,
    body text not null check (char_length(body) > 0 and char_length(body) <= 2000),
    created_at timestamptz not null default now()
);

create index if not exists comments_climb_idx on comments(climb, created_at desc);

alter table comments enable row level security;

create policy "comments_select_all"
    on comments for select
    using (true);

create policy "comments_insert_own"
    on comments for insert
    with check (auth.uid() = author);

create policy "comments_delete_own"
    on comments for delete
    using (auth.uid() = author);
