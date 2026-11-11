-- AT WORK · migración 10: resúmenes de clase
-- Los "Resumen de tu clase · …" que Flor manda por mail entran solos a la app (Apps Script → flor-ai modo gmail_enviado).
-- La alumna ve el último en su inicio y Flor AI los usa para saber qué trabajaron en clase.

create table if not exists public.resumenes (
  id bigint generated always as identity primary key,
  alumna_id uuid not null references public.perfiles(id) on delete cascade,
  fecha date,                         -- día de la clase (sale del asunto)
  asunto text default '',
  texto text not null,
  origen text unique,                 -- gmail:<id del mail>, para no duplicar
  creado timestamptz default now()
);
create index if not exists resumenes_alumna on public.resumenes(alumna_id, fecha desc);
alter table public.resumenes enable row level security;
drop policy if exists p_resumenes_leer on public.resumenes;
create policy p_resumenes_leer on public.resumenes for select using (alumna_id = auth.uid() or public.es_admin());
drop policy if exists p_resumenes_admin on public.resumenes;
create policy p_resumenes_admin on public.resumenes for all using (public.es_admin()) with check (public.es_admin());
