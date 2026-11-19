-- AT WORK · migración 20: «My Day» de las alumnas (pedido de Gisela, 17/11; Flor, 19/11: «me parece fundamental»).
-- Un planner diario en inglés: ritual de la mañana, el momento en inglés del día, 3 prioridades y el cierre del día.
-- Una fila por alumna y por día. Es privado de cada alumna (como sus chats con Flor AI): Flor no lo lee desde la app.
-- datos = { energia, quien, gracias: [3], momento, frase, prioridades: [{ t, h }] x3, identidad, dicha,
--           hecho, minima, hecho_en, win, ingles, manana }

create table if not exists public.mi_dia (
  alumna_id uuid not null references public.perfiles(id) on delete cascade,
  fecha date not null,
  datos jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now(),
  primary key (alumna_id, fecha)
);

alter table public.mi_dia enable row level security;

drop policy if exists p_mi_dia_propio on public.mi_dia;
create policy p_mi_dia_propio on public.mi_dia for all
  using (alumna_id = (select auth.uid()))
  with check (alumna_id = (select auth.uid()));

grant select, insert, update, delete on public.mi_dia to authenticated;
revoke all on public.mi_dia from anon;
