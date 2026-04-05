-- Migration: persist Google OAuth provider_token in profiles
-- Run in: Supabase Dashboard → SQL Editor
alter table profiles
  add column if not exists google_access_token   text,
  add column if not exists google_token_saved_at timestamptz;
