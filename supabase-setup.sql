-- ============================================================
-- SubAI — Supabase setup script (idempotent — safe to re-run)
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Enable UUID generation
create extension if not exists "uuid-ossp";

-- 2. Jobs table ─────────────────────────────────────────────
create table if not exists public.jobs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  language      text not null default 'hinglish',
  duration      text default '—',
  status        text not null default 'processing',
  storage_key   text,
  ai_description text,
  thumb_color   text default '#facc15',
  created_at    timestamptz not null default now()
);

create index if not exists idx_jobs_user_id on public.jobs(user_id);

-- 3. Row-Level Security (RLS) on jobs ────────────────────────
alter table public.jobs enable row level security;

drop policy if exists "Users read own jobs"    on public.jobs;
drop policy if exists "Users insert own jobs"  on public.jobs;
drop policy if exists "Users update own jobs"  on public.jobs;
drop policy if exists "Users delete own jobs"  on public.jobs;

create policy "Users read own jobs"   on public.jobs for select using (auth.uid() = user_id);
create policy "Users insert own jobs" on public.jobs for insert with check (auth.uid() = user_id);
create policy "Users update own jobs" on public.jobs for update using (auth.uid() = user_id);
create policy "Users delete own jobs" on public.jobs for delete using (auth.uid() = user_id);

-- 4. Storage bucket ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own videos" on storage.objects;
drop policy if exists "Users read own videos"   on storage.objects;

create policy "Users upload own videos"
  on storage.objects for insert
  with check (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own videos"
  on storage.objects for select
  using (
    bucket_id = 'videos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 5. Subtitles table ─────────────────────────────────────────
create table if not exists public.subtitles (
  id          uuid primary key default uuid_generate_v4(),
  job_id      uuid not null references public.jobs(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  start_sec   float not null,
  end_sec     float not null,
  text        text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_subtitles_job_id on public.subtitles(job_id);

alter table public.subtitles enable row level security;

drop policy if exists "Users read own subtitles"   on public.subtitles;
drop policy if exists "Users insert own subtitles" on public.subtitles;
drop policy if exists "Users update own subtitles" on public.subtitles;
drop policy if exists "Users delete own subtitles" on public.subtitles;

create policy "Users read own subtitles"   on public.subtitles for select using (auth.uid() = user_id);
create policy "Users insert own subtitles" on public.subtitles for insert with check (auth.uid() = user_id);
create policy "Users update own subtitles" on public.subtitles for update using (auth.uid() = user_id);
create policy "Users delete own subtitles" on public.subtitles for delete using (auth.uid() = user_id);
