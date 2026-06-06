-- Wealth Quadrant Pro Access - Supabase Auth + Superadmin Schema

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'superadmin',
  approved boolean not null default false,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_profiles integer;
begin
  select count(*) into existing_profiles from public.profiles;

  insert into public.profiles (id, email, role, approved)
  values (
    new.id,
    new.email,
    'superadmin',
    case when existing_profiles = 0 then true else false end
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text unique not null,
  phone text,
  onboard_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.clients add column if not exists created_by uuid references auth.users(id);
alter table public.clients add column if not exists updated_at timestamptz default now();

create table if not exists public.client_modules (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  module_name text not null,
  module_data jsonb not null default '{}',
  updated_at timestamptz default now(),
  unique(client_id, module_name)
);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_modules enable row level security;

drop policy if exists "Approved superadmin can read profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Approved superadmin can manage clients" on public.clients;
create policy "Approved superadmin can manage clients"
on public.clients for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'
      and p.approved = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'
      and p.approved = true
  )
);

drop policy if exists "Approved superadmin can manage modules" on public.client_modules;
create policy "Approved superadmin can manage modules"
on public.client_modules for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'
      and p.approved = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'superadmin'
      and p.approved = true
  )
);
