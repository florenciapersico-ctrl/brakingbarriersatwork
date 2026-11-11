-- Flor puede cargar un pedido de feedback en nombre de una alumna (ej.: un audio que le llegó por WhatsApp).
drop policy if exists p_pedidos_admin_crear on public.pedidos;
create policy p_pedidos_admin_crear on public.pedidos for insert with check (public.es_admin());
