-- Migración 06: bandeja completa (alumnas con cuenta + las que siguen en importación),
-- intentos de corrección de las alumnas (método de Flor) y el tablero de Flor.

-- 1) Tablero de Flor: su objetivo, clases grabadas, contenido publicado, links de trabajo.
alter table public.programa add column if not exists flor jsonb default '{}'::jsonb;

-- 2) Intentos de la alumna en la tabla de corrección (encuentra el error, dice por qué).
create table if not exists public.intentos (
  alumna_id uuid not null references public.perfiles(id) on delete cascade,
  clave text not null,                 -- 'pedidos:12' o 'weekly:2026-11-09'
  respuestas jsonb not null default '[]'::jsonb,   -- [{"bien":"...","por_que":"..."}] en el orden de las correcciones
  revelado boolean not null default false,
  actualizado timestamptz not null default now(),
  primary key (alumna_id, clave)
);
alter table public.intentos enable row level security;
drop policy if exists p_intentos_propios on public.intentos;
create policy p_intentos_propios on public.intentos for all
  using (alumna_id = auth.uid() or public.es_admin()) with check (alumna_id = auth.uid());

-- 3) Flor responde desde la bandeja un weekly o una tarea de una alumna que todavía no creó su cuenta.
create or replace function public.admin_responder_weekly(p_email text, p_semana date, p_texto text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'Solo Flor'; end if;
  return public.sync_weekly(p_email, p_semana, '{}'::jsonb, null, p_texto, now());
end $$;

create or replace function public.admin_responder_pedido_imp(p_email text, p_origen text, p_respuesta text, p_correcciones jsonb)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'Solo Flor'; end if;
  update public.importacion set datos = jsonb_set(datos, '{pedidos}',
    (select coalesce(jsonb_agg(case when e->>'origen' = p_origen
       then e || jsonb_build_object('respuesta', p_respuesta, 'correcciones', coalesce(p_correcciones, '[]'::jsonb), 'respondido_en', now())
       else e end), '[]'::jsonb)
     from jsonb_array_elements(coalesce(datos->'pedidos', '[]'::jsonb)) e))
  where lower(email) = lower(p_email);
  return case when found then 'ok' else 'no_encontrada' end;
end $$;

revoke all on function public.admin_responder_weekly(text, date, text) from public, anon;
revoke all on function public.admin_responder_pedido_imp(text, text, text, jsonb) from public, anon;
grant execute on function public.admin_responder_weekly(text, date, text) to authenticated;
grant execute on function public.admin_responder_pedido_imp(text, text, text, jsonb) to authenticated;

-- 4) Valores iniciales del tablero de Flor (los edita desde "Mi progreso").
update public.programa set flor = coalesce(flor, '{}'::jsonb) || jsonb_build_object(
  'objetivo', coalesce(flor->>'objetivo', 'Terminar de grabar el programa y crear contenido todos los días'))
where id = 1;
