-- User profiles (extends Supabase auth.users)
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  timezone text not null default 'UTC',
  weekly_capacity_minutes integer not null default 600,
  planning_mode text not null default 'BALANCED',
  level integer not null default 1,
  total_xp integer not null default 0,
  core_health integer not null default 100,
  game_terminology boolean not null default true,
  xp_enabled boolean not null default true,
  reduced_motion boolean not null default false,
  quiet_hours_start time,
  quiet_hours_end time,
  reminder_daily_cap integer not null default 8,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.avatar_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  base_body text not null default 'default',
  skin_tone text not null default '#E8B88A',
  hair_style text not null default 'short',
  hair_color text not null default '#2D1B00',
  outfit_palette text not null default 'cyber-blue',
  accessory text not null default 'none',
  unlocked_cosmetics jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table public.core_guide_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  animation text not null default 'idle',
  dialogue_enabled boolean not null default true,
  sound_enabled boolean not null default false,
  last_recommendation_at timestamptz,
  unique(user_id)
);

-- RLS
alter table public.user_profiles enable row level security;
alter table public.avatar_configs enable row level security;
alter table public.core_guide_states enable row level security;

create policy "Users can view own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.user_profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.user_profiles for insert with check (auth.uid() = id);

create policy "Users manage own avatar" on public.avatar_configs for all using (auth.uid() = user_id);
create policy "Users manage own guide" on public.core_guide_states for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  insert into public.avatar_configs (user_id) values (new.id);
  insert into public.core_guide_states (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
