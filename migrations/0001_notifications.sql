-- Notifications table: stores per-user in-app notifications surfaced in the bell menu.
create type notification_type as enum ('new_climb', 'climb_comment', 'climb_logged', 'system');

create table if not exists notifications (
    id bigserial primary key,
    recipient uuid not null references auth.users(id) on delete cascade,
    type notification_type not null default 'system',
    title text not null,
    body text,
    climb bigint references climbs(id) on delete cascade,
    actor uuid references auth.users(id) on delete set null,
    read boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_created_idx
    on notifications (recipient, created_at desc);

create index if not exists notifications_recipient_unread_idx
    on notifications (recipient)
    where read = false;

alter table notifications enable row level security;

create policy "Users can view their own notifications"
    on notifications for select
    using (auth.uid() = recipient);

create policy "Users can update their own notifications"
    on notifications for update
    using (auth.uid() = recipient);

create policy "Service role can insert notifications"
    on notifications for insert
    with check (true);
