-- AT WORK · migración 13: asistencia y notas internas de Flor por clase (solo las ve Flor)
create table if not exists public.clase_notas (
  email text not null,                 -- mail de la alumna, en minúsculas
  fecha date not null,                 -- día de la clase
  vino boolean,                        -- true vino · false no vino · null sin marcar
  recuperar text,                      -- 'ofrecida' | 'no' | null
  nota text default '',                -- nota interna de Flor
  actualizado timestamptz default now(),
  primary key (email, fecha)
);
alter table public.clase_notas enable row level security;
drop policy if exists p_clase_notas on public.clase_notas;
create policy p_clase_notas on public.clase_notas for all using (public.es_admin()) with check (public.es_admin());
