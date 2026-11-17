-- AT WORK · migración 19: "Ritual de la mañana" de Flor (Inicio, panel de administradora)
-- 5 pilares durante 66 días: despertar consciente (6 AM sin excusa), gratitud, visualización,
-- compromiso de 3 acciones y declaración de identidad. Va en la misma fila del día de habitos_flor.
-- { despierta, gracias: [3], vision, acciones: [{ t, h }] x3, identidad, dicha, hecho, hecho_en }

alter table public.habitos_flor add column if not exists ritual jsonb;
