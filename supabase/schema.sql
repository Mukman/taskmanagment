-- ============================================================
-- Taskline database schema
-- Run this in Supabase: Project -> SQL Editor -> New query -> Run
-- ============================================================

-- 1. Profiles table (extends Supabase's built-in auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('staff', 'manager', 'director')) default 'staff',
  manager_id uuid references profiles(id) on delete set null,
  is_admin boolean not null default false,
  created_at timestamptz default now()
);

-- 2. Tasks table
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  priority text not null check (priority in ('High', 'Med', 'Low')) default 'Med',
  start_date date not null default current_date,
  due_date date not null,
  status text not null check (status in ('To Do', 'In Progress', 'Done')) default 'To Do',
  source text not null check (source in ('assigned', 'self')) default 'self',
  owner uuid not null references profiles(id) on delete cascade,
  assigned_by uuid references profiles(id) on delete set null,
  completed_date date,
  attachment_url text,
  attachment_name text,
  created_at timestamptz default now()
);

-- 3. Auto-create a profile row whenever someone signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 4. Rate limit tracking for admin actions (create/edit/delete accounts).
-- No RLS policies are added on purpose — that means only the service role
-- (used server-side in app/api/admin/*) can read or write this table at all.
create table if not exists rate_limit_log (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz default now()
);
alter table rate_limit_log enable row level security;
create index if not exists idx_rate_limit_log_key_created on rate_limit_log (key, created_at);

-- ============================================================
-- Row Level Security: this is what keeps staff from seeing
-- each other's tasks, and lets managers see their own team only.
-- ============================================================

alter table profiles enable row level security;
alter table tasks enable row level security;

-- Everyone can see basic profile info (needed to show names, pick assignees)
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid());

-- Guard: even though the policy above lets someone update their own row
-- (e.g. to change their name), this trigger stops a non-admin from also
-- sneaking a role/manager/admin change into that same update. Only admins
-- (and the server-side admin API, which acts with no user context) can
-- change role, manager_id, or is_admin.
create or replace function prevent_profile_privilege_escalation()
returns trigger as $$
declare
  acting_is_admin boolean;
begin
  select is_admin into acting_is_admin from profiles where id = auth.uid();
  if coalesce(acting_is_admin, true) is false then
    new.role := old.role;
    new.is_admin := old.is_admin;
    new.manager_id := old.manager_id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_profile_update_guard on profiles;
create trigger on_profile_update_guard
  before update on profiles
  for each row execute procedure prevent_profile_privilege_escalation();

-- TASKS: select
-- A user can see a task if: they own it, OR they manage the owner,
-- OR they are a director (directors see everything).
create policy "View own tasks, or your team's, or all if director"
  on tasks for select
  to authenticated
  using (
    owner = auth.uid()
    or owner in (select id from profiles where manager_id = auth.uid())
    or (select role from profiles where id = auth.uid()) = 'director'
  );

-- TASKS: insert
-- A user can create a task for themself (self-initiated),
-- or a manager/director can create a task assigned to someone on their team.
create policy "Create own tasks or assign to your team"
  on tasks for insert
  to authenticated
  with check (
    owner = auth.uid()
    or (
      assigned_by = auth.uid()
      and (
        owner in (select id from profiles where manager_id = auth.uid())
        or (select role from profiles where id = auth.uid()) = 'director'
      )
    )
  );

-- TASKS: update
-- Owners can update their own tasks (e.g. change status).
-- Whoever assigned a task can also edit it.
create policy "Update own tasks or ones you assigned"
  on tasks for update
  to authenticated
  using (
    owner = auth.uid()
    or assigned_by = auth.uid()
    or (select role from profiles where id = auth.uid()) = 'director'
  );

-- TASKS: delete
create policy "Delete own tasks or ones you assigned"
  on tasks for delete
  to authenticated
  using (
    owner = auth.uid()
    or assigned_by = auth.uid()
  );
