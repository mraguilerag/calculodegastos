-- Mis Gastos — esquema de base de datos para Supabase
-- Copia y pega este archivo completo en Supabase > SQL Editor > New query, y dale "Run".
-- Es seguro correrlo tantas veces como haga falta (en un proyecto nuevo o para
-- aplicar cambios sobre uno existente): todas las tablas, columnas y politicas
-- se crean con IF NOT EXISTS / DROP...IF EXISTS antes de recrearse.

-- ---------------------------------------------------------------------------
-- Tabla de categorias (por usuario)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null,
  color text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own" on public.categories
  for select using (auth.uid() = user_id);
drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own" on public.categories
  for insert with check (auth.uid() = user_id);
drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own" on public.categories
  for update using (auth.uid() = user_id);
drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own" on public.categories
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Tabla de gastos (por usuario)
-- ---------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  description text not null default '',
  expense_date date not null,
  created_at timestamptz not null default now(),
  currency text
);

-- Por si la tabla ya existia de una corrida anterior sin esta columna.
alter table public.expenses add column if not exists currency text;

alter table public.expenses enable row level security;

drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);
drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own" on public.expenses
  for insert with check (auth.uid() = user_id);
drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own" on public.expenses
  for update using (auth.uid() = user_id);
drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own" on public.expenses
  for delete using (auth.uid() = user_id);

create index if not exists expenses_user_date_idx on public.expenses (user_id, expense_date);

-- ---------------------------------------------------------------------------
-- Perfil por usuario: presupuesto mensual + preferencias
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_limit numeric(12, 2),
  monthly_limit_currency text,
  theme text not null default 'light',
  sound_enabled boolean not null default true,
  currency text not null default 'USD',
  name text,
  updated_at timestamptz not null default now()
);

-- Por si la tabla ya existia de una corrida anterior sin estas columnas.
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists monthly_limit_currency text;

update public.profiles
set monthly_limit_currency = currency
where monthly_limit is not null and monthly_limit_currency is null;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Conversion real de moneda: cada gasto guarda en que moneda fue registrado.
-- Los gastos que ya existian (de antes de esta columna) se asumen registrados
-- en la moneda que la cuenta tiene configurada hoy, por no haber otra forma
-- de saberlo con certeza. Va despues de crear "profiles" porque depende de ella.
-- ---------------------------------------------------------------------------
update public.expenses e
set currency = coalesce(
  e.currency,
  (select p.currency from public.profiles p where p.user_id = e.user_id),
  'USD'
)
where e.currency is null;

alter table public.expenses alter column currency set default 'USD';
alter table public.expenses alter column currency set not null;

-- ---------------------------------------------------------------------------
-- Al registrarse un usuario nuevo: crea su perfil y sus categorias por defecto
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id);

  insert into public.categories (user_id, name, icon, color, is_default) values
    (new.id, 'Comida', '🍙', '#ff9eb5', true),
    (new.id, 'Transporte', '🚗', '#b7a3f0', true),
    (new.id, 'Ocio', '🎬', '#f3c766', true),
    (new.id, 'Salud', '💊', '#8fd6c8', true),
    (new.id, 'Hogar', '🏠', '#f0a8d0', true),
    (new.id, 'Otros', '🏷️', '#c9b8a8', true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Relleno para cuentas que ya existian en auth.users antes de correr este
-- script (el trigger de arriba solo aplica a registros nuevos): les crea el
-- perfil y las categorias por defecto si todavia no las tienen.
-- ---------------------------------------------------------------------------
insert into public.profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

insert into public.categories (user_id, name, icon, color, is_default)
select u.id, v.name, v.icon, v.color, true
from auth.users u
cross join (values
  ('Comida', '🍙', '#ff9eb5'),
  ('Transporte', '🚗', '#b7a3f0'),
  ('Ocio', '🎬', '#f3c766'),
  ('Salud', '💊', '#8fd6c8'),
  ('Hogar', '🏠', '#f0a8d0'),
  ('Otros', '🏷️', '#c9b8a8')
) as v(name, icon, color)
where not exists (
  select 1 from public.categories c where c.user_id = u.id
);
