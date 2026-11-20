-- AT WORK · migración 21 (19/11/2026): la alumna puede elegir ella misma en qué módulo está
-- y escribir «cómo me siento al empezar». Flor lo sigue pudiendo cambiar desde su panel.
-- Se agregan dos parámetros a guardar_mi_perfil (por eso se borra la versión vieja y se crea de nuevo).

drop function if exists public.guardar_mi_perfil(text, text, integer[], text[], integer[]);

create or replace function public.guardar_mi_perfil(
  p_nombre text default null,
  p_objetivo text default null,
  p_onboarding integer[] default null,
  p_camino text[] default null,
  p_compromisos integer[] default null,
  p_modulo integer default null,
  p_sentir text default null
) returns void
language sql
security definer
set search_path to 'public'
as $function$
  update public.perfiles
     set nombre = coalesce(p_nombre, nombre),
         objetivo = coalesce(p_objetivo, objetivo),
         onboarding = coalesce(p_onboarding, onboarding),
         camino_hecho = coalesce(p_camino, camino_hecho),
         compromisos = coalesce(p_compromisos, compromisos),
         modulo_actual = case when p_modulo between 0 and 5 then p_modulo else modulo_actual end,
         sentir_inicio = coalesce(left(p_sentir, 1000), sentir_inicio)
   where id = auth.uid();
$function$;

revoke all on function public.guardar_mi_perfil(text, text, integer[], text[], integer[], integer, text) from public, anon;
grant execute on function public.guardar_mi_perfil(text, text, integer[], text[], integer[], integer, text) to authenticated;
