-- AT WORK · migración 14: nombre corto de cada alumna para el saludo de su inicio ("Buen día, Vir")
alter table public.perfiles add column if not exists apodo text;
