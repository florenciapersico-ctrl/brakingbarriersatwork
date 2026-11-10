-- AT WORK · migración 04: alumnas pre-cargadas.
-- Claude carga en "importacion" los datos de cada alumna (sacados de Drive, Notion y el tracker).
-- Cuando Flor le crea la cuenta desde el panel (Alumnas › Crear cuentas), el perfil se completa solo:
-- formato, fecha de inicio, módulo, carpeta, ficha privada, tareas del camino y sus weeklies anteriores.

create table if not exists public.importacion (
  email text primary key,               -- en minúsculas
  nombre text not null,
  datos jsonb not null default '{}',    -- columnas de perfiles (formato, trabajo, objetivo, fecha_inicio, modulo_actual, drive_url, camino_hecho, onboarding…)
  ficha text default '',                -- lo que sabe Flor de ella (privado)
  weeklies jsonb default '[]',          -- [{semana, respuestas, enviado_en, respuesta_flor, respondido_en}]
  orden int default 0,
  aplicado timestamptz
);
alter table public.importacion enable row level security;
drop policy if exists p_import_admin on public.importacion;
create policy p_import_admin on public.importacion for all using (public.es_admin()) with check (public.es_admin());

create or replace function public.aplicar_importacion(p_id uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  im public.importacion;
  em text;
  w jsonb;
begin
  select lower(email) into em from public.perfiles where id = p_id;
  select * into im from public.importacion where email = em;
  if not found then return false; end if;
  update public.perfiles p set
    nombre         = coalesce(nullif(im.nombre, ''), p.nombre),
    formato        = coalesce(im.datos->>'formato', p.formato),
    trabajo        = coalesce(im.datos->>'trabajo', p.trabajo),
    objetivo       = coalesce(im.datos->>'objetivo', p.objetivo),
    fecha_inicio   = coalesce((im.datos->>'fecha_inicio')::date, p.fecha_inicio),
    modulo_actual  = coalesce((im.datos->>'modulo_actual')::int, p.modulo_actual),
    drive_url      = coalesce(im.datos->>'drive_url', p.drive_url),
    foco_titulo    = coalesce(im.datos->>'foco_titulo', p.foco_titulo),
    foco_texto     = coalesce(im.datos->>'foco_texto', p.foco_texto),
    camino_hecho   = coalesce((select array_agg(x) from jsonb_array_elements_text(im.datos->'camino_hecho') x), p.camino_hecho),
    onboarding     = coalesce((select array_agg(x::int) from jsonb_array_elements_text(im.datos->'onboarding') x), p.onboarding),
    confianza_inicio = coalesce((im.datos->>'confianza_inicio')::int, p.confianza_inicio)
  where p.id = p_id;
  if coalesce(im.ficha, '') <> '' then
    insert into public.fichas (alumna_id, texto) values (p_id, im.ficha)
    on conflict (alumna_id) do update set texto = excluded.texto, actualizado = now();
  end if;
  for w in select * from jsonb_array_elements(coalesce(im.weeklies, '[]'::jsonb)) loop
    insert into public.weekly (alumna_id, semana, respuestas, enviado_en, respuesta_flor, respondido_en)
    values (p_id, (w->>'semana')::date, coalesce(w->'respuestas', '{}'::jsonb),
            nullif(w->>'enviado_en', '')::timestamptz, nullif(w->>'respuesta_flor', ''), nullif(w->>'respondido_en', '')::timestamptz)
    on conflict (alumna_id, semana) do nothing;
  end loop;
  update public.importacion set aplicado = now() where email = em;
  return true;
end $$;

create or replace function public.tras_crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.aplicar_importacion(new.id);
  return new;
end $$;
drop trigger if exists al_crear_perfil_importar on public.perfiles;
create trigger al_crear_perfil_importar after insert on public.perfiles
  for each row execute function public.tras_crear_perfil();

-- Para volver a aplicar a mano (solo Flor): select public.reaplicar_importacion('mail@ejemplo.com');
create or replace function public.reaplicar_importacion(p_email text) returns boolean
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.es_admin() then raise exception 'Solo Flor'; end if;
  select id into uid from public.perfiles where lower(email) = lower(p_email);
  if uid is null then return false; end if;
  return public.aplicar_importacion(uid);
end $$;
grant execute on function public.reaplicar_importacion(text) to authenticated;
