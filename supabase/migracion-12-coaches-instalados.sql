-- AT WORK · migración 12: la alumna avisa que ya instaló sus coaches (Flor AI lo usa para guiarla).
alter table public.perfiles add column if not exists coaches_instalados timestamptz;
alter table public.perfiles add column if not exists sentir_inicio text;
create or replace function public.marcar_coaches(p_instalados boolean)
returns void language sql security definer set search_path = public as $$
  update public.perfiles set coaches_instalados = case when p_instalados then now() else null end where id = auth.uid();
$$;
revoke all on function public.marcar_coaches(boolean) from public, anon;
grant execute on function public.marcar_coaches(boolean) to authenticated;
