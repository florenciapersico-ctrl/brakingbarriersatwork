-- AT WORK · migración 03: ficha privada de Flor por alumna y copia de archivos a Drive.
-- Se puede volver a correr sin problema.

-- Lo que Flor sabe de cada alumna (historia, contexto, cómo trabaja, qué le funciona).
-- Solo la ve Flor (panel) y Flor AI (la función la lee con permisos de servidor). La alumna NO la ve.
create table if not exists public.fichas (
  alumna_id uuid primary key references public.perfiles(id) on delete cascade,
  texto text default '',
  actualizado timestamptz default now()
);
alter table public.fichas enable row level security;
drop policy if exists p_fichas_admin on public.fichas;
create policy p_fichas_admin on public.fichas for all using (public.es_admin()) with check (public.es_admin());

-- Estado de la copia a Drive (vacío = sin copiar, 'ok' = copiado, otro texto = error)
alter table public.pedidos add column if not exists drive text default '';
alter table public.documentos add column if not exists drive text default '';
