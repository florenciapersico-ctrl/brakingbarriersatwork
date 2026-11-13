-- Migración 16 (13/11/2026): un solo resumen por alumna y por día.
-- Dos tareas pueden cargar el resumen de la misma clase (la de cada hora, desde Wispr, y la de la noche,
-- desde el mail enviado). Si ya hay uno de esa alumna en esa fecha, el segundo INSERT se ignora sin error.
create or replace function public.resumen_unico() returns trigger
language plpgsql set search_path = public as $$
begin
  if exists (select 1 from public.resumenes r where r.alumna_id = new.alumna_id and r.fecha = new.fecha) then
    return null;
  end if;
  return new;
end $$;
revoke all on function public.resumen_unico() from public, anon, authenticated;
drop trigger if exists t_resumen_unico on public.resumenes;
create trigger t_resumen_unico before insert on public.resumenes for each row execute function public.resumen_unico();
