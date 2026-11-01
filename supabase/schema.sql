-- AT WORK · base de datos de la app de alumnas
-- Pegalo entero en Supabase › SQL Editor › New query › Run. Se puede correr más de una vez.

-- ============ Tablas ============

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nombre text default '',
  rol text not null default 'alumna' check (rol in ('alumna','admin')),
  formato text default 'LAB',                 -- LAB o 1:1
  trabajo text default '',                    -- a qué se dedica (lo usa Flor AI)
  objetivo text default '',                   -- objetivo a 5 meses
  foco_titulo text default '',                -- foco de la semana (lo elige Flor)
  foco_texto text default '',
  modulo_actual int default 0,                -- 0 a 4
  clases_asignadas text[] default '{}',
  confianza_inicio int,                       -- 1 a 10
  confianza_hoy int,
  audio_inicio date,
  drive_url text default '',
  onboarding int[] default '{}',              -- pasos del checklist hechos
  activa boolean default true,
  creado timestamptz default now()
);

create table if not exists public.tareas (
  id bigint generated always as identity primary key,
  alumna_id uuid not null references public.perfiles(id) on delete cascade,
  texto text not null,
  donde text default '',
  hecha boolean default false,
  orden int default 0,
  creado timestamptz default now()
);

create table if not exists public.weekly (
  id bigint generated always as identity primary key,
  alumna_id uuid not null references public.perfiles(id) on delete cascade,
  semana date not null,                       -- lunes de esa semana
  respuestas jsonb not null default '{}',
  enviado_en timestamptz,                     -- null = borrador
  respuesta_flor text,
  respondido_en timestamptz,
  unique (alumna_id, semana)
);

create table if not exists public.pedidos (
  id bigint generated always as identity primary key,
  alumna_id uuid not null references public.perfiles(id) on delete cascade,
  tipo text default 'tarea',                  -- tarea, audio, reunion, mail, otro
  titulo text default '',
  texto text default '',
  link text default '',
  estado text default 'pendiente' check (estado in ('pendiente','respondido')),
  respuesta text,
  correcciones jsonb default '[]',            -- [{"mal":"...","bien":"..."}]
  creado timestamptz default now(),
  respondido_en timestamptz
);

create table if not exists public.patrones (
  id bigint generated always as identity primary key,
  alumna_id uuid not null references public.perfiles(id) on delete cascade,
  patron text not null,
  tipo text default 'Fosilizado',             -- Fosilizado, Falta de base, Falso amigo
  estado text default 'Practicando',          -- Practicando, Resuelto
  creado timestamptz default now()
);

create table if not exists public.chats (
  id bigint generated always as identity primary key,
  alumna_id uuid not null references public.perfiles(id) on delete cascade,
  coach text not null default 'flor',
  titulo text default 'Nueva conversación',
  creado timestamptz default now()
);

create table if not exists public.mensajes (
  id bigint generated always as identity primary key,
  chat_id bigint not null references public.chats(id) on delete cascade,
  rol text not null check (rol in ('user','assistant')),
  contenido text not null,
  creado timestamptz default now()
);

-- Datos generales del programa (una sola fila, id = 1)
create table if not exists public.programa (
  id int primary key default 1 check (id = 1),
  proximo_lab jsonb default '{}',             -- {"fecha":"Sábado 7 de noviembre","horario":"18:00 Argentina · 15:00 México","tema":"...","link":"..."}
  links jsonb default '{}',                   -- {"plataforma":"...","reservar":"...","comunidad":"...","whatsapp_flor":"..."}
  fechas jsonb default '[]',                  -- [{"cuando":"Lun 9 nov","que":"Primer weekly"}]
  aviso text default ''
);
insert into public.programa (id) values (1) on conflict do nothing;

create index if not exists tareas_alumna on public.tareas(alumna_id);
create index if not exists weekly_alumna on public.weekly(alumna_id, semana desc);
create index if not exists pedidos_estado on public.pedidos(estado, creado desc);
create index if not exists chats_alumna on public.chats(alumna_id, creado desc);
create index if not exists mensajes_chat on public.mensajes(chat_id, id);

-- ============ Alta automática del perfil ============

create or replace function public.nuevo_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.nuevo_perfil();

-- ============ Permisos (RLS) ============

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

alter table public.perfiles enable row level security;
alter table public.tareas   enable row level security;
alter table public.weekly   enable row level security;
alter table public.pedidos  enable row level security;
alter table public.patrones enable row level security;
alter table public.chats    enable row level security;
alter table public.mensajes enable row level security;
alter table public.programa enable row level security;

-- perfiles: la alumna lee el suyo; Flor lee y edita todos.
drop policy if exists p_perfiles_leer on public.perfiles;
create policy p_perfiles_leer on public.perfiles for select using (id = auth.uid() or public.es_admin());
drop policy if exists p_perfiles_admin on public.perfiles;
create policy p_perfiles_admin on public.perfiles for update using (public.es_admin());

-- La alumna solo puede tocar su checklist de onboarding, su nombre y su objetivo.
create or replace function public.guardar_mi_perfil(p_nombre text, p_objetivo text, p_onboarding int[])
returns void language sql security definer set search_path = public as $$
  update public.perfiles
     set nombre = coalesce(p_nombre, nombre),
         objetivo = coalesce(p_objetivo, objetivo),
         onboarding = coalesce(p_onboarding, onboarding)
   where id = auth.uid();
$$;

-- tareas: la alumna lee las suyas y marca hecha/no hecha; Flor hace todo.
drop policy if exists p_tareas_leer on public.tareas;
create policy p_tareas_leer on public.tareas for select using (alumna_id = auth.uid() or public.es_admin());
drop policy if exists p_tareas_admin on public.tareas;
create policy p_tareas_admin on public.tareas for all using (public.es_admin()) with check (public.es_admin());
create or replace function public.marcar_tarea(p_id bigint, p_hecha boolean)
returns void language sql security definer set search_path = public as $$
  update public.tareas set hecha = p_hecha where id = p_id and alumna_id = auth.uid();
$$;

-- weekly: la alumna crea y edita los suyos mientras no estén respondidos.
drop policy if exists p_weekly_leer on public.weekly;
create policy p_weekly_leer on public.weekly for select using (alumna_id = auth.uid() or public.es_admin());
drop policy if exists p_weekly_crear on public.weekly;
create policy p_weekly_crear on public.weekly for insert with check (alumna_id = auth.uid() and respuesta_flor is null);
drop policy if exists p_weekly_editar on public.weekly;
create policy p_weekly_editar on public.weekly for update
  using (alumna_id = auth.uid() and respuesta_flor is null)
  with check (alumna_id = auth.uid() and respuesta_flor is null);
drop policy if exists p_weekly_admin on public.weekly;
create policy p_weekly_admin on public.weekly for update using (public.es_admin());

-- pedidos de feedback: la alumna crea y lee los suyos; responde solo Flor.
drop policy if exists p_pedidos_leer on public.pedidos;
create policy p_pedidos_leer on public.pedidos for select using (alumna_id = auth.uid() or public.es_admin());
drop policy if exists p_pedidos_crear on public.pedidos;
create policy p_pedidos_crear on public.pedidos for insert
  with check (alumna_id = auth.uid() and estado = 'pendiente' and respuesta is null);
drop policy if exists p_pedidos_admin on public.pedidos;
create policy p_pedidos_admin on public.pedidos for update using (public.es_admin());
drop policy if exists p_pedidos_borrar on public.pedidos;
create policy p_pedidos_borrar on public.pedidos for delete using (public.es_admin());

-- patrones de error: los carga Flor.
drop policy if exists p_patrones_leer on public.patrones;
create policy p_patrones_leer on public.patrones for select using (alumna_id = auth.uid() or public.es_admin());
drop policy if exists p_patrones_admin on public.patrones;
create policy p_patrones_admin on public.patrones for all using (public.es_admin()) with check (public.es_admin());

-- chats y mensajes: privados de cada alumna. Flor no los lee desde la app.
drop policy if exists p_chats on public.chats;
create policy p_chats on public.chats for all using (alumna_id = auth.uid()) with check (alumna_id = auth.uid());
drop policy if exists p_mensajes on public.mensajes;
create policy p_mensajes on public.mensajes for all
  using (exists (select 1 from public.chats c where c.id = chat_id and c.alumna_id = auth.uid()))
  with check (exists (select 1 from public.chats c where c.id = chat_id and c.alumna_id = auth.uid()));

-- programa: todas leen; edita Flor.
drop policy if exists p_programa_leer on public.programa;
create policy p_programa_leer on public.programa for select using (auth.uid() is not null);
drop policy if exists p_programa_admin on public.programa;
create policy p_programa_admin on public.programa for update using (public.es_admin());

grant execute on function public.guardar_mi_perfil(text,text,int[]) to authenticated;
grant execute on function public.marcar_tarea(bigint,boolean) to authenticated;

-- ============ Hacete admin ============
-- Después de crear tu usuario (Authentication › Users › Add user), corré esto con tu mail:
-- update public.perfiles set rol = 'admin' where email = 'florenciapersico@breakingbarriers.site';
