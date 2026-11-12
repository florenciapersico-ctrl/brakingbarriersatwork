-- AT WORK · migración 12: "Mi día" de Flor (panel de administradora)
-- Una fila por día con lo que tildó. Los hábitos semanales se guardan en la fila del lunes de esa semana.
-- Solo Flor la ve y la escribe. Notion ("Mis hábitos") es el respaldo: lo copia la tarea de la noche.

create table if not exists public.habitos_flor (
  fecha date primary key,
  hechos jsonb not null default '{}'::jsonb,   -- { "escritorio": true, "w:amiga": true, ... }
  minima boolean not null default false,       -- día difícil: hizo la versión mínima (cuenta igual)
  actualizado timestamptz default now(),
  en_notion timestamptz                        -- última vez que se copió a Notion
);
alter table public.habitos_flor enable row level security;
drop policy if exists p_habitos_flor on public.habitos_flor;
create policy p_habitos_flor on public.habitos_flor for all using (public.es_admin()) with check (public.es_admin());
