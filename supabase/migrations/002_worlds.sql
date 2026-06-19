create type world_status as enum ('PRIMARY', 'SECONDARY', 'MAINTENANCE', 'PAUSED', 'COMPLETED');

create table public.worlds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  name text not null,
  purpose text not null default '',
  color text not null,
  icon text not null default 'star',
  status world_status not null default 'SECONDARY',
  weekly_target_minutes integer not null default 0,
  preferred_cadence text not null default 'weekly',
  demand_type text not null default 'ADMINISTRATIVE',
  importance integer not null default 3,
  health integer not null default 100,
  sort_order integer not null default 0,
  pause_reason text,
  resume_review_at timestamptz,
  resume_condition text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.worlds enable row level security;
create policy "Users manage own worlds" on public.worlds for all using (auth.uid() = user_id);
create index idx_worlds_user_status on public.worlds(user_id, status);
