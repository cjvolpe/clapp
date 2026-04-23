create table if not exists public.climb_ratings (
    id bigserial primary key,
    climb bigint not null references public.climbs (id) on delete cascade,
    climber uuid not null references auth.users (id) on delete cascade,
    rating smallint not null check (rating between 1 and 5),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (climb, climber)
);

create index if not exists climb_ratings_climb_idx on public.climb_ratings (climb);
create index if not exists climb_ratings_climber_idx on public.climb_ratings (climber);

create or replace view public.climb_rating_summary as
select
    climb,
    round(avg(rating)::numeric, 2) as average_rating,
    count(*)::int as rating_count
from public.climb_ratings
group by climb;

alter table public.climb_ratings enable row level security;

drop policy if exists "ratings are readable by everyone" on public.climb_ratings;
create policy "ratings are readable by everyone"
    on public.climb_ratings for select
    using (true);

drop policy if exists "users can insert their own rating" on public.climb_ratings;
create policy "users can insert their own rating"
    on public.climb_ratings for insert
    with check (auth.uid() = climber);

drop policy if exists "users can update their own rating" on public.climb_ratings;
create policy "users can update their own rating"
    on public.climb_ratings for update
    using (auth.uid() = climber)
    with check (auth.uid() = climber);

drop policy if exists "users can delete their own rating" on public.climb_ratings;
create policy "users can delete their own rating"
    on public.climb_ratings for delete
    using (auth.uid() = climber);
