-- Banco de hooks validados (Flor, 25/11): outliers de referentes y propios, para modelar hooks.
-- Lo lee el auditor (función «auditor») y la solapa Contenido › Hooks validados. Lo actualiza la tarea del domingo.
create table if not exists public.hooks_validados (
  id bigint generated always as identity primary key,
  cuenta text not null,
  hook text not null,
  formato text,
  metrica text,
  veces numeric,
  link text unique,
  fecha date,
  fuente text default 'apify',
  creado timestamptz default now()
);
alter table public.hooks_validados enable row level security;
create policy "hooks_validados admin lee" on public.hooks_validados for select using (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'admin'));
