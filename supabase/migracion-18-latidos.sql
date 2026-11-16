-- Migración 18 (16/11/2026, aplicada): el semáforo del panel de Flor. Cada tarea automática deja su "latido" al terminar.
create table if not exists public.latidos (clave text primary key, nombre text not null, ok boolean not null default true, mensaje text default '', cuando timestamptz not null default now());
alter table public.latidos enable row level security;
drop policy if exists p_latidos on public.latidos;
create policy p_latidos on public.latidos for all using (public.es_admin()) with check (public.es_admin());
