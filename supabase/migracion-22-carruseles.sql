-- Migración 22 · Carruseles dentro de la app (Flor, 25/11/2026)
-- «Que la app, en Contenido, tenga el estudio que te arma el contenido, con la estética que veníamos armando,
--  y que ahí mismo me dé la opción de subir fotos nuevas y de ir modificándolo».

-- 1) Cada pieza de contenido (fila 'pieza:%' de hoy_flor) puede traer su carrusel ya diseñado:
--    {"receta":"historia","formato":"carrusel","semilla":0,"placas":[{"forma":"portada_foto","titulo":"…","_foto":"campera.jpg"}, …]}
alter table public.hoy_flor add column if not exists carrusel jsonb;
-- Link del posteo ya publicado en Instagram (Flor, 25/11: «un lugar donde ir ordenando las publicaciones»).
alter table public.hoy_flor add column if not exists ig_link text;

-- 2) Las fotos nuevas que Flor sube desde la app (se suman a las de app/carruseles/fotos).
create table if not exists public.fotos_carrusel (
  archivo text primary key,                 -- nombre único, ej. 'subida-1764093000-cafe.jpg'
  url text not null,                        -- URL pública del bucket 'carruseles'
  tipo text not null default 'persona',     -- persona u objeto
  ancho int, alto int,
  excluir boolean not null default false,
  creado timestamptz default now()
);
alter table public.fotos_carrusel enable row level security;
drop policy if exists fotos_carrusel_admin on public.fotos_carrusel;
create policy fotos_carrusel_admin on public.fotos_carrusel for all using (public.es_admin()) with check (public.es_admin());

-- 3) Bucket público para esas fotos (son fotos de Flor para Instagram); solo la admin puede subir o borrar.
insert into storage.buckets (id, name, public) values ('carruseles', 'carruseles', true) on conflict (id) do nothing;
drop policy if exists carruseles_admin_insert on storage.objects;
create policy carruseles_admin_insert on storage.objects for insert with check (bucket_id = 'carruseles' and public.es_admin());
drop policy if exists carruseles_admin_update on storage.objects;
create policy carruseles_admin_update on storage.objects for update using (bucket_id = 'carruseles' and public.es_admin());
drop policy if exists carruseles_admin_delete on storage.objects;
create policy carruseles_admin_delete on storage.objects for delete using (bucket_id = 'carruseles' and public.es_admin());
