-- Migración 08: Muro de wins. Cuando una alumna manda su weekly, su win (01 · My wins) aparece para todas.
-- Solo el nombre de pila, la semana y el win. Si la alumna destilda "Compartir mi win", no aparece.
create or replace function public.wins_comunidad()
returns table(nombre text, semana date, wins text, formato text)
language sql stable security definer set search_path = public as $$
  select * from (
    select split_part(coalesce(p.nombre, ''), ' ', 1), w.semana, w.respuestas->>'wins', coalesce(p.formato, 'LAB')
    from public.weekly w join public.perfiles p on p.id = w.alumna_id
    where auth.uid() is not null and w.enviado_en is not null and p.rol is distinct from 'admin' and p.activa is not false
      and coalesce(trim(w.respuestas->>'wins'), '') <> '' and coalesce(w.respuestas->>'compartir_wins', 'si') <> 'no'
    union all
    select split_part(coalesce(i.nombre, ''), ' ', 1), (e->>'semana')::date, e->'respuestas'->>'wins', coalesce(i.datos->>'formato', 'LAB')
    from public.importacion i, jsonb_array_elements(coalesce(i.weeklies, '[]'::jsonb)) e
    where auth.uid() is not null
      and not exists (select 1 from public.perfiles p2 where lower(p2.email) = lower(i.email))
      and coalesce(trim(e->'respuestas'->>'wins'), '') <> ''
  ) t order by 2 desc limit 400;
$$;
revoke all on function public.wins_comunidad() from public, anon;
grant execute on function public.wins_comunidad() to authenticated;
