-- Migración 17 (14/11/2026, aplicada): las funciones de trigger y la de reaplicar no se pueden llamar desde afuera.
-- (Los triggers siguen funcionando: Postgres no chequea EXECUTE al dispararlos.)
revoke execute on function public.aplicar_pedidos_importados() from public, anon, authenticated;
revoke execute on function public.tras_crear_perfil() from public, anon, authenticated;
revoke execute on function public.reaplicar_importacion(text) from public, anon;
