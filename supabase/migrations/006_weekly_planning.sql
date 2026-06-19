create table public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  week_start date not null,
  planning_mode text not null default 'BALANCED',
  available_minutes integer not null,
  planned_minutes integer not null default 0,
  reflection_notes text not null default '',
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, week_start)
);

create table public.world_allocations (
  id uuid primary key default gen_random_uuid(),
  weekly_plan_id uuid not null references public.weekly_plans(id) on delete cascade,
  world_id uuid not null references public.worlds(id) on delete cascade,
  target_minutes integer not null default 0,
  actual_minutes integer not null default 0,
  intentional_imbalance_reason text,
  unique(weekly_plan_id, world_id)
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  world_id uuid references public.worlds(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}',
  xp_earned integer not null default 0,
  occurred_at timestamptz not null default now()
);

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  world_id uuid references public.worlds(id) on delete set null,
  source_type text not null,
  source_id uuid,
  amount integer not null,
  reason text not null default '',
  occurred_at timestamptz not null default now()
);

alter table public.weekly_plans enable row level security;
alter table public.world_allocations enable row level security;
alter table public.activity_events enable row level security;
alter table public.xp_events enable row level security;

create policy "Users manage own plans" on public.weekly_plans for all using (auth.uid() = user_id);
create policy "Users manage own allocations" on public.world_allocations for all
  using (exists (
    select 1 from public.weekly_plans wp where wp.id = weekly_plan_id and wp.user_id = auth.uid()
  ));
create policy "Users manage own activity" on public.activity_events for all using (auth.uid() = user_id);
create policy "Users manage own xp" on public.xp_events for all using (auth.uid() = user_id);

create index idx_activity_events_user on public.activity_events(user_id, occurred_at desc);
create index idx_xp_events_user on public.xp_events(user_id, occurred_at desc);
