create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  world_id uuid not null references public.worlds(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete set null,
  mission_block_id uuid,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  planned_minutes integer not null default 25,
  actual_minutes integer,
  focus_quality integer,
  interruption_count integer not null default 0,
  notes text not null default '',
  xp_earned integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.save_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  world_id uuid not null references public.worlds(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete set null,
  focus_session_id uuid references public.focus_sessions(id) on delete set null,
  completed_summary text not null default '',
  stopping_point text not null default '',
  next_action text not null default '',
  blocker text,
  resources text,
  intended_resume_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.mission_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  world_id uuid not null references public.worlds(id) on delete cascade,
  name text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  demand_type text not null default 'ADMINISTRATIVE',
  source text not null default 'USER',
  explanation text,
  created_at timestamptz not null default now()
);

alter table public.focus_sessions enable row level security;
alter table public.save_points enable row level security;
alter table public.mission_blocks enable row level security;

create policy "Users manage own sessions" on public.focus_sessions for all using (auth.uid() = user_id);
create policy "Users manage own saves" on public.save_points for all using (auth.uid() = user_id);
create policy "Users manage own blocks" on public.mission_blocks for all using (auth.uid() = user_id);

create index idx_focus_sessions_user on public.focus_sessions(user_id, started_at desc);
create index idx_save_points_world on public.save_points(world_id, created_at desc);
