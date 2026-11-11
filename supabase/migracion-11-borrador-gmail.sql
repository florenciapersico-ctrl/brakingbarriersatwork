-- AT WORK · migración 11: responder desde la app con borrador en Gmail
-- Flor toca "Armar borrador en Gmail" en la bandeja: el mail completo queda en sus Borradores.
-- Cuando lo manda, la sincronización Gmail → app lo marca respondido.

alter table public.pedidos add column if not exists mail_borrador timestamptz;  -- cuándo se armó el borrador en Gmail
alter table public.pedidos add column if not exists mail_asunto text;           -- asunto del borrador, para reconocerlo al enviarse
alter table public.weekly  add column if not exists mail_borrador timestamptz;
