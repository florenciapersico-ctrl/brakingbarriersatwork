-- Migración 15 (13/11/2026, pedido de Flor): botón OK de cada clase en su panel.
-- hecho      = la clase ya se dio (lo marca Flor con OK, o la tarea "🎓 Clases del día" al encontrar la grabación).
-- ok_en      = cuándo tocó OK Flor.
-- enviado_en = cuándo salió el mail "Resumen de tu clase" a la alumna (con eso el botón queda verde y fijo).
-- estado     = una línea para Flor si algo no salió (ej.: "No encontré la grabación en Wispr").
alter table public.hoy_flor add column if not exists ok_en timestamptz;
alter table public.hoy_flor add column if not exists enviado_en timestamptz;
alter table public.hoy_flor add column if not exists estado text;
