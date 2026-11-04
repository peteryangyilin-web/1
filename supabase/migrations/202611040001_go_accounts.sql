-- GO accounts: run in the SQL Editor of a dedicated Supabase project.
-- No service-role key belongs in the web application.
begin;
create schema if not exists go_private;
revoke all on schema go_private from public, anon, authenticated;

create table if not exists go_private.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table if not exists go_private.admin_access_log (
 id bigint generated always as identity primary key,
 actor_id uuid not null references auth.users(id) on delete cascade,
 action text not null check(action in ('list_users','view_user')),
 target_id uuid,
 created_at timestamptz not null default now()
);
revoke all on go_private.admin_users,go_private.admin_access_log from public,anon,authenticated;

create table if not exists public.go_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{"version":2,"profile":{},"records":{}}'::jsonb,
 revision bigint not null default 0 check(revision>=0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint go_workspace_shape check (
  jsonb_typeof(data) is not distinct from 'object' and (data->'version') is not distinct from '2'::jsonb
  and jsonb_typeof(data->'profile') is not distinct from 'object' and jsonb_typeof(data->'records') is not distinct from 'object'
  and octet_length(data::text)<=8388608
 )
);
alter table public.go_workspaces enable row level security;
alter table public.go_workspaces force row level security;
revoke all on public.go_workspaces from public,anon,authenticated;
grant select,insert on public.go_workspaces to authenticated;
drop policy if exists go_own_workspace_read on public.go_workspaces;
create policy go_own_workspace_read on public.go_workspaces for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists go_own_workspace_create on public.go_workspaces;
create policy go_own_workspace_create on public.go_workspaces for insert to authenticated with check(user_id=(select auth.uid()) and revision=0);
-- No direct update/delete grant. Writes use the identity-checked, revision-checked RPC below.

create or replace function public.go_is_admin() returns boolean
language sql stable security definer set search_path=''
as $$ select exists(select 1 from go_private.admin_users a where a.user_id=(select auth.uid())); $$;
revoke all on function public.go_is_admin() from public,anon;
grant execute on function public.go_is_admin() to authenticated;

create or replace function public.go_save_workspace(p_data jsonb,p_expected_revision bigint,p_user_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare r public.go_workspaces;
begin
 if auth.uid() is null or auth.uid()<>p_user_id then
  raise exception 'Account does not match the active session' using errcode='42501';
 end if;
 if p_data is null or jsonb_typeof(p_data)<>'object' or p_data->'version' is distinct from '2'::jsonb
  or jsonb_typeof(p_data->'profile') is distinct from 'object'
  or jsonb_typeof(p_data->'records') is distinct from 'object'
  or octet_length(p_data::text)>8388608 then
  raise exception 'Invalid workspace data' using errcode='22023';
 end if;
 update public.go_workspaces set data=p_data,revision=revision+1,updated_at=now()
  where user_id=p_user_id and revision=p_expected_revision returning * into r;
 if not found then raise exception 'Workspace revision conflict' using errcode='40001';end if;
 return jsonb_build_object('revision',r.revision,'updated_at',r.updated_at);
end $$;
revoke all on function public.go_save_workspace(jsonb,bigint,uuid) from public,anon;
grant execute on function public.go_save_workspace(jsonb,bigint,uuid) to authenticated;

create or replace function public.go_admin_list_users(p_query text default '',p_offset integer default 0,p_limit integer default 25)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare result jsonb; total bigint; stats jsonb; query text:=left(trim(coalesce(p_query,'')),120);
 page_size integer:=least(greatest(coalesce(p_limit,25),1),100);
 page_offset integer:=greatest(coalesce(p_offset,0),0);
begin
 if not public.go_is_admin() then raise exception 'Administrator access required' using errcode='42501';end if;
 insert into go_private.admin_access_log(actor_id,action) values(auth.uid(),'list_users');
 select jsonb_build_object('registered',count(*),'verified',count(*) filter(where email_confirmed_at is not null or phone_confirmed_at is not null),'active_7_days',count(*) filter(where last_sign_in_at>=now()-interval '7 days')) into stats from auth.users;
 select count(*) into total from auth.users u left join public.go_workspaces w on w.user_id=u.id
 where query='' or coalesce(nullif(w.data->'profile'->>'name',''),u.raw_user_meta_data->>'full_name','') ilike '%'||query||'%'
 or coalesce(u.email,'') ilike '%'||query||'%' or coalesce(u.phone,'') ilike '%'||query||'%';
 select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into result from (
  select u.id,coalesce(nullif(w.data->'profile'->>'name',''),u.raw_user_meta_data->>'full_name','') as name,
   u.email,u.phone,u.email_confirmed_at is not null as email_verified,u.phone_confirmed_at is not null as phone_verified,
   (u.email_confirmed_at is not null or u.phone_confirmed_at is not null) as verified,
   w.data->'profile'->>'goal' as goal,u.created_at,u.last_sign_in_at,w.updated_at
  from auth.users u left join public.go_workspaces w on w.user_id=u.id
  where query='' or coalesce(nullif(w.data->'profile'->>'name',''),u.raw_user_meta_data->>'full_name','') ilike '%'||query||'%'
   or coalesce(u.email,'') ilike '%'||query||'%' or coalesce(u.phone,'') ilike '%'||query||'%'
  order by u.created_at desc,u.id limit page_size offset page_offset
 ) t;
 return jsonb_build_object('users',result,'total',total,'stats',stats,'offset',page_offset,'limit',page_size);
end $$;
revoke all on function public.go_admin_list_users(text,integer,integer) from public,anon;
grant execute on function public.go_admin_list_users(text,integer,integer) to authenticated;

create or replace function public.go_admin_user_detail(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare result jsonb;
begin
 if not public.go_is_admin() then raise exception 'Administrator access required' using errcode='42501';end if;
 insert into go_private.admin_access_log(actor_id,action,target_id) values(auth.uid(),'view_user',p_user_id);
 select jsonb_build_object('id',u.id,'name',coalesce(nullif(w.data->'profile'->>'name',''),u.raw_user_meta_data->>'full_name',''),
  'email',u.email,'phone',u.phone,'email_verified',u.email_confirmed_at is not null,'phone_verified',u.phone_confirmed_at is not null,
  'created_at',u.created_at,'last_sign_in_at',u.last_sign_in_at,'updated_at',w.updated_at,
  'profile',coalesce(w.data->'profile','{}'::jsonb),'records',coalesce(w.data->'records','{}'::jsonb)) into result
  from auth.users u left join public.go_workspaces w on w.user_id=u.id where u.id=p_user_id;
 if result is null then raise exception 'Account not found' using errcode='P0002';end if;
 return result;
end $$;
revoke all on function public.go_admin_user_detail(uuid) from public,anon;
grant execute on function public.go_admin_user_detail(uuid) to authenticated;
commit;
