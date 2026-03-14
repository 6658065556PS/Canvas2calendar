-- Canvas2Calendar — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query

-- ─────────────────────────────────────────────────────────────────────────────
-- PROFILES  (auto-created on Google sign-in via trigger below)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text,
  full_name     text,
  avatar_url    text,
  canvas_api_token text,
  settings      jsonb default '{
    "autoSync": true,
    "breakDownAssignments": true,
    "syncAnnouncements": false,
    "timeEstimation": "moderate",
    "workloadPreference": "balanced",
    "weekStartDay": "sunday"
  }'::jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table profiles enable row level security;
create policy "owner_select"  on profiles for select  using (auth.uid() = id);
create policy "owner_insert"  on profiles for insert  with check (auth.uid() = id);
create policy "owner_update"  on profiles for update  using (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- WAITLIST
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists waitlist (
  id         uuid default gen_random_uuid() primary key,
  email      text unique not null,
  created_at timestamptz default now()
);

alter table waitlist enable row level security;
create policy "anyone_insert" on waitlist for insert with check (true);
create policy "auth_select"   on waitlist for select  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────────
-- ASSIGNMENTS  (imported from Canvas)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists assignments (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade not null,
  canvas_id   text,
  title       text not null,
  course      text,
  due_date    text,
  description text,
  canvas_url  text,
  is_upcoming boolean default true,
  created_at  timestamptz default now()
);

alter table assignments enable row level security;
create policy "owner_select"  on assignments for select  using (auth.uid() = user_id);
create policy "owner_insert"  on assignments for insert  with check (auth.uid() = user_id);
create policy "owner_update"  on assignments for update  using (auth.uid() = user_id);
create policy "owner_delete"  on assignments for delete  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TASKS  (AI-decomposed micro-tasks)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists tasks (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references profiles(id) on delete cascade not null,
  assignment_id     uuid references assignments(id) on delete cascade,
  name              text not null,
  category          text check (category in ('reading','problemset','discussion','preclass','reflection')),
  estimated_time    text,
  suggested_date    text,
  difficulty        text check (difficulty in ('easy','medium','hard')),
  details           text,
  notes             text,
  completed         boolean default false,
  source_assignment text,
  google_event_id   text,
  position          integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table tasks enable row level security;
create policy "owner_select"  on tasks for select  using (auth.uid() = user_id);
create policy "owner_insert"  on tasks for insert  with check (auth.uid() = user_id);
create policy "owner_update"  on tasks for update  using (auth.uid() = user_id);
create policy "owner_delete"  on tasks for delete  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SCHEDULED TASKS  (tasks placed onto the weekly calendar)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists scheduled_tasks (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references profiles(id) on delete cascade not null,
  task_id         uuid references tasks(id) on delete cascade not null,
  day             text not null,   -- e.g. "Monday"
  time_slot       text not null,   -- e.g. "10:00 AM"
  week_start      date,            -- ISO date of the Sunday/Monday that starts the week
  google_event_id text,
  created_at      timestamptz default now(),
  unique (task_id, week_start)     -- one task per week slot (update replaces old position)
);

alter table scheduled_tasks enable row level security;
create policy "owner_select"  on scheduled_tasks for select  using (auth.uid() = user_id);
create policy "owner_insert"  on scheduled_tasks for insert  with check (auth.uid() = user_id);
create policy "owner_update"  on scheduled_tasks for update  using (auth.uid() = user_id);
create policy "owner_delete"  on scheduled_tasks for delete  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER — auto-create profile when a new user signs up via Google OAuth
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATED_AT trigger for tasks
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at
  before update on tasks
  for each row execute procedure public.set_updated_at();
