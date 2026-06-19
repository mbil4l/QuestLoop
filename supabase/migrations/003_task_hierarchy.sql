create type objective_stage as enum ('STARTING', 'MIDDLE', 'NEAR_COMPLETION', 'COMPLETE');

create table public.objectives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  world_id uuid not null references public.worlds(id) on delete cascade,
  title text not null,
  description text not null default '',
  success_criteria text not null default '',
  stage objective_stage not null default 'STARTING',
  progress_percent integer not null default 0,
  due_at timestamptz,
  importance integer not null default 3,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  objective_id uuid not null references public.objectives(id) on delete cascade,
  title text not null,
  description text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  world_id uuid not null references public.worlds(id) on delete cascade,
  objective_id uuid references public.objectives(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  title text not null,
  description text not null default '',
  next_move text,
  status text not null default 'active',
  due_at timestamptz,
  estimated_minutes integer,
  importance integer not null default 3,
  consequence text not null default '',
  demand_type text not null default 'ADMINISTRATIVE',
  difficulty integer not null default 2,
  priority_score numeric(5,2) not null default 0,
  priority_override numeric(5,2),
  reschedule_count integer not null default 0,
  waiting_for_id uuid,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  world_id uuid not null references public.worlds(id) on delete cascade,
  title text not null,
  cadence_rule text not null default 'daily',
  minimum_version text not null default '',
  target_version text not null default '',
  stretch_version text not null default '',
  estimated_minutes integer not null default 15,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.objectives enable row level security;
alter table public.campaigns enable row level security;
alter table public.quests enable row level security;
alter table public.rituals enable row level security;

create policy "Users manage own objectives" on public.objectives for all using (auth.uid() = user_id);
create policy "Users manage own campaigns" on public.campaigns for all using (auth.uid() = user_id);
create policy "Users manage own quests" on public.quests for all using (auth.uid() = user_id);
create policy "Users manage own rituals" on public.rituals for all using (auth.uid() = user_id);

create index idx_objectives_world on public.objectives(world_id);
create index idx_quests_world on public.quests(world_id);
create index idx_quests_campaign on public.quests(campaign_id);
create index idx_quests_user_completed on public.quests(user_id, is_completed);
