-- ==============================================================================
-- SAAS STARTER POSTGRESQL SCHEMA FOR SUPABASE
-- Run this script in the Supabase SQL Editor to set up tables and RLS
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  company_name text,
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. SUBSCRIPTIONS TABLE
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  plan_id text not null default 'free', -- 'free', 'pro-monthly', 'pro-yearly', 'enterprise'
  status text not null default 'active', -- 'active', 'trialing', 'past_due', 'canceled', 'incomplete'
  billing_interval text not null default 'month', -- 'month', 'year'
  current_period_start timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_end timestamp with time zone default timezone('utc'::text, now() + interval '30 days') not null,
  cancel_at_period_end boolean default false not null,
  customer_id text, -- e.g. Stripe customer id
  subscription_id text, -- e.g. Stripe subscription id
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_subscription unique (user_id)
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policies for subscriptions
create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Only service role can modify subscriptions directly (e.g. webhooks)
create policy "Service role manages subscriptions"
  on public.subscriptions for all
  using (auth.jwt() ->> 'role' = 'service_role');

-- 3. INVOICES TABLE
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  invoice_number text not null,
  amount numeric(10, 2) not null,
  currency text default 'USD' not null,
  status text default 'paid' not null, -- 'paid', 'open', 'void', 'uncollectible'
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.invoices enable row level security;

create policy "Users can view their own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

-- 4. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  insert into public.subscriptions (user_id, plan_id, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
