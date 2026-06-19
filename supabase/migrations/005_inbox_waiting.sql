create table public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  raw_content text not null,
  capture_type text not null default 'text',
  captured_at timestamptz not null default now(),
  processed_at timestamptz,
  target_world_id uuid references public.worlds(id) on delete set null
);

create table public.waiting_for_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  world_id uuid references public.worlds(id) on delete set null,
  related_quest_id uuid references public.quests(id) on delete set null,
  description text not null,
  person_or_organization text not null,
  awaited_item text not null,
  requested_at timestamptz not null default now(),
  expected_at timestamptz,
  follow_up_at timestamptz,
  consequence text not null default '',
  next_action_after_response text not null default '',
  status text not null default 'waiting',
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete set null,
  world_id uuid references public.worlds(id) on delete set null,
  message text not null,
  trigger_at timestamptz not null,
  intensity text not null default 'LIGHT',
  is_dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.inbox_items enable row level security;
alter table public.waiting_for_items enable row level security;
alter table public.reminders enable row level security;

create policy "Users manage own inbox" on public.inbox_items for all using (auth.uid() = user_id);
create policy "Users manage own waiting" on public.waiting_for_items for all using (auth.uid() = user_id);
create policy "Users manage own reminders" on public.reminders for all using (auth.uid() = user_id);

create index idx_inbox_user on public.inbox_items(user_id, processed_at nulls first);
create index idx_reminders_user on public.reminders(user_id, trigger_at);
