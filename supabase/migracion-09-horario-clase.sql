-- Migración 09: el día, horario y link de la clase en vivo de cada alumna (lo ve en su inicio).
alter table public.perfiles add column if not exists horario_clase text default '';
alter table public.perfiles add column if not exists link_clase text default '';
