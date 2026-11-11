-- Migración 07: la alumna puede editar o borrar lo que mandó mientras Flor no lo respondió.
-- (Flor ya puede editar y borrar todo: políticas p_pedidos_admin y p_pedidos_borrar.)
drop policy if exists p_pedidos_editar_propio on public.pedidos;
create policy p_pedidos_editar_propio on public.pedidos for update
  using (alumna_id = auth.uid() and estado = 'pendiente')
  with check (alumna_id = auth.uid() and estado = 'pendiente' and respuesta is null);
drop policy if exists p_pedidos_borrar_propio on public.pedidos;
create policy p_pedidos_borrar_propio on public.pedidos for delete
  using (alumna_id = auth.uid() and estado = 'pendiente');
-- Flor también puede borrar un borrador viejo de la IA
drop policy if exists p_borradores_borrar on public.borradores;
create policy p_borradores_borrar on public.borradores for delete using (public.es_admin());
