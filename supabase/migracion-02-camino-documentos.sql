-- AT WORK · migración 02: camino de 5 meses, compromisos, documentos y archivos.
-- Ya está aplicada en el proyecto at-work-app. Se puede volver a correr sin problema.

alter table public.perfiles add column if not exists fecha_inicio date;
alter table public.perfiles add column if not exists camino_hecho text[] default '{}';
alter table public.perfiles add column if not exists compromisos int[] default '{}';
alter table public.pedidos add column if not exists archivo text default '';
alter table public.pedidos add column if not exists archivo_nombre text default '';

-- La alumna guarda su checklist de onboarding, sus compromisos y las tareas tildadas del camino.
drop function if exists public.guardar_mi_perfil(text, text, int[]);
create or replace function public.guardar_mi_perfil(
  p_nombre text default null, p_objetivo text default null, p_onboarding int[] default null,
  p_camino text[] default null, p_compromisos int[] default null)
returns void language sql security definer set search_path = public as $$
  update public.perfiles
     set nombre = coalesce(p_nombre, nombre),
         objetivo = coalesce(p_objetivo, objetivo),
         onboarding = coalesce(p_onboarding, onboarding),
         camino_hecho = coalesce(p_camino, camino_hecho),
         compromisos = coalesce(p_compromisos, compromisos)
   where id = auth.uid();
$$;
grant execute on function public.guardar_mi_perfil(text, text, int[], text[], int[]) to authenticated;

-- Documentos de cada alumna (acuerdo de trabajo firmado, Starting Point, etc.)
create table if not exists public.documentos (
  id bigint generated always as identity primary key,
  alumna_id uuid not null references public.perfiles(id) on delete cascade,
  nombre text not null,
  tipo text default 'otro',          -- acuerdo, starting_point, plan, otro
  path text not null,                -- ruta en Storage (bucket atwork)
  subido_por uuid default auth.uid(),
  creado timestamptz default now()
);
create index if not exists documentos_alumna on public.documentos(alumna_id, creado desc);
alter table public.documentos enable row level security;
drop policy if exists p_docs_leer on public.documentos;
create policy p_docs_leer on public.documentos for select using (alumna_id = auth.uid() or public.es_admin());
drop policy if exists p_docs_crear on public.documentos;
create policy p_docs_crear on public.documentos for insert with check (alumna_id = auth.uid() or public.es_admin());
drop policy if exists p_docs_borrar on public.documentos;
create policy p_docs_borrar on public.documentos for delete using (public.es_admin());

-- Archivos (privados): cada alumna en su carpeta {su id}/...
insert into storage.buckets (id, name, public, file_size_limit)
values ('atwork', 'atwork', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

drop policy if exists atw_leer on storage.objects;
create policy atw_leer on storage.objects for select to authenticated
  using (bucket_id = 'atwork' and ((storage.foldername(name))[1] = auth.uid()::text or public.es_admin()));
drop policy if exists atw_subir on storage.objects;
create policy atw_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'atwork' and ((storage.foldername(name))[1] = auth.uid()::text or public.es_admin()));
drop policy if exists atw_borrar on storage.objects;
create policy atw_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'atwork' and public.es_admin());
