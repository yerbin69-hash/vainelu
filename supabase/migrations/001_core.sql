-- Vainelú: esquema para un proyecto Supabase de TEST independiente.
create extension if not exists pgcrypto;
create table public.staff_members(user_id uuid primary key references auth.users(id), active boolean not null default true);
create function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from staff_members where user_id=auth.uid() and active)$$;
create table public.business_settings(id boolean primary key default true check(id), settings jsonb not null, real_sales_enabled boolean not null default false);
create table public.products(id uuid primary key default gen_random_uuid(),slug text unique not null,name text not null,description text not null default '',categories text[] not null default '{}',published boolean not null default false,food_verified boolean not null default false,image_path text,version int not null default 1);
create table public.product_variants(id uuid primary key default gen_random_uuid(),product_id uuid not null references products, label text not null,servings int not null check(servings>0),price_cents int not null check(price_cents>0),active boolean not null default true);
create table public.service_days(date date primary key,open boolean not null default true,capacity int not null check(capacity>=0));
create table public.fulfillment_slots(id uuid primary key default gen_random_uuid(),date date not null references service_days,start_at timestamptz not null,end_at timestamptz not null,check(end_at>start_at));
create table public.orders(id uuid primary key default gen_random_uuid(),reference text unique not null default encode(gen_random_bytes(6),'hex'),operation_key uuid unique not null,payload_hash text not null,guest_token_hash text not null,contact jsonb not null,date date not null references service_days,slot_id uuid not null references fulfillment_slots,total_cents int not null check(total_cents>0),currency text not null default 'eur' check(currency='eur'),mode text not null check(mode='test'),status text not null default 'pending' check(status in ('pending','confirmed','preparing','ready','delivered','cancelled','review')),payment_status text not null default 'pending' check(payment_status in ('pending','paid','refunded','partially_refunded')),version int not null default 1,created_at timestamptz not null default now());
create table public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references orders,snapshot jsonb not null);
create table public.capacity_reservations(order_id uuid primary key references orders,date date not null references service_days,servings int not null check(servings>0),state text not null default 'held' check(state in ('held','committed','released')),expires_at timestamptz not null);
create table public.payment_attempts(id uuid primary key default gen_random_uuid(),order_id uuid unique not null references orders,session_id text unique,total_cents int not null,currency text not null check(currency='eur'),mode text not null check(mode='test'),state text not null default 'creating' check(state in ('creating','open','paid','expired')),expires_at timestamptz);
create table public.payment_events(event_id text primary key,session_id text not null,applied_at timestamptz not null default now());
create table public.refunds(id uuid primary key default gen_random_uuid(),attempt_id uuid not null references payment_attempts,provider_id text unique,operation_key uuid unique not null,amount_cents int not null check(amount_cents>0),reason text not null,state text not null default 'requested');
create table public.quote_requests(id uuid primary key default gen_random_uuid(),contact jsonb not null,date date not null,servings int not null check(servings>0),description text not null check(length(description)<=1500),status text not null default 'pending',created_at timestamptz not null default now());
create table public.notification_outbox(id uuid primary key default gen_random_uuid(),order_id uuid not null references orders,deduplication_key text unique not null,mode text not null default 'log' check(mode='log'),processed_at timestamptz);
create table public.audit_log(id uuid primary key default gen_random_uuid(),actor uuid,action text not null,object_id uuid,details jsonb,created_at timestamptz not null default now());
-- Denegación por defecto; solo personal autorizado puede leer los datos privados.
do $$ declare t text; begin foreach t in array array['staff_members','business_settings','products','product_variants','service_days','fulfillment_slots','orders','order_items','capacity_reservations','payment_attempts','payment_events','refunds','quote_requests','notification_outbox','audit_log'] loop execute format('alter table public.%I enable row level security',t);execute format('create policy staff_read on public.%I for select to authenticated using(public.is_staff())',t); end loop; end $$;
create policy public_catalog on products for select to anon,authenticated using(published and food_verified);
create policy public_variants on product_variants for select to anon,authenticated using(active and exists(select 1 from products p where p.id=product_id and p.published and p.food_verified));
-- Las mutaciones privadas se ejecutan en servidor; no hay políticas de escritura para clientes.
create function public.create_reserved_order(p_operation uuid,p_token_hash text,p_lines jsonb,p_date date,p_slot uuid,p_contact jsonb,p_expected_total int) returns uuid language plpgsql security definer set search_path=public as $$
declare old orders; d service_days; s fulfillment_slots; l jsonb; v product_variants; p products; n int; total int:=0; portions int:=0; used int; oid uuid; snapshots jsonb:='[]'; fingerprint text; today date:=(now() at time zone 'Europe/Madrid')::date;
begin
 if jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines) not between 1 and 30 or p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid request'; end if;
 fingerprint:=encode(digest(jsonb_build_object('lines',p_lines,'date',p_date,'slot',p_slot,'contact',p_contact,'total',p_expected_total,'token',p_token_hash)::text,'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(p_operation::text,0));
 select * into old from orders where operation_key=p_operation;
 if found then if old.payload_hash<>fingerprint then raise exception 'idempotency conflict'; end if; return old.id;end if;
 select * into d from service_days where date=p_date for update;
 if not found or not d.open or p_date<today or p_date>today+29 then raise exception 'date unavailable';end if;
 select * into s from fulfillment_slots where id=p_slot and date=p_date;
 if not found or s.start_at<now()+interval '48 hours' then raise exception 'slot unavailable';end if;
 for l in select * from jsonb_array_elements(p_lines) loop
 if (l->>'quantity') !~ '^[1-9][0-9]?$' or coalesce(length(l->>'message'),0)>40 then raise exception 'invalid options';end if;
 n:=(l->>'quantity')::int; if n>10 then raise exception 'quantity limit';end if;
 select * into v from product_variants where id=(l->>'variantId')::uuid and active;
 if not found then raise exception 'variant unavailable';end if;
 select * into p from products where id=v.product_id and id=(l->>'productId')::uuid and published and food_verified;
 if not found then raise exception 'product unavailable';end if;
 total:=total+v.price_cents*n;portions:=portions+v.servings*n;
 snapshots:=snapshots||jsonb_build_array(jsonb_build_object('name',p.name,'variant',v.label,'unit_cents',v.price_cents,'quantity',n,'servings',v.servings,'message',coalesce(l->>'message',''),'product_version',p.version));
 end loop;
 if total<>p_expected_total then raise exception 'price changed: review required';end if;
 select coalesce(sum(servings),0) into used from capacity_reservations where date=p_date and state in ('held','committed');
 if used+portions>d.capacity then raise exception 'capacity full';end if;
 insert into orders(operation_key,payload_hash,guest_token_hash,contact,date,slot_id,total_cents,mode) values(p_operation,fingerprint,p_token_hash,p_contact,p_date,p_slot,total,'test') returning id into oid;
 insert into order_items(order_id,snapshot) select oid,value from jsonb_array_elements(snapshots);
 insert into capacity_reservations(order_id,date,servings,expires_at) values(oid,p_date,portions,now()+interval '30 minutes');
 insert into payment_attempts(order_id,total_cents,currency,mode) values(oid,total,'eur','test');
 return oid;
end $$;
-- El adaptador debe recuperar sesión desde Stripe antes de llamar. Firma verificada en HTTP.
create function public.apply_paid_session(p_event text,p_session text,p_order uuid,p_amount int,p_currency text,p_live boolean) returns void language plpgsql security definer set search_path=public as $$
declare a payment_attempts; o orders; r capacity_reservations;
begin
 select * into o from orders where id=p_order for update;if not found then raise exception 'unknown order';end if;
 select * into a from payment_attempts where order_id=p_order for update;
 if a.session_id is distinct from p_session or a.total_cents<>p_amount or a.currency<>p_currency or p_live or a.mode<>'test' then raise exception 'payment mismatch';end if;
 if exists(select 1 from payment_events where event_id=p_event) then return;end if;
 if a.state<>'paid' then
 select * into r from capacity_reservations where order_id=p_order for update;
 update orders set payment_status='paid',status=case when r.state='held' and o.status='pending' then 'confirmed' else 'review' end,version=version+1 where id=p_order;
 if r.state='held' and o.status='pending' then update capacity_reservations set state='committed' where order_id=p_order;end if;
 update payment_attempts set state='paid' where id=a.id;
 insert into notification_outbox(order_id,deduplication_key) values(p_order,'payment:'||a.id) on conflict do nothing;
 end if;
 insert into payment_events(event_id,session_id) values(p_event,p_session);
end $$;
-- Solo invocar tras recuperar y confirmar status=expired y payment_status=unpaid.
create function public.release_expired_session(p_session text) returns void language plpgsql security definer set search_path=public as $$
declare oid uuid;
begin
 select order_id into oid from payment_attempts where session_id=p_session;
 perform 1 from orders where id=oid for update;
 update payment_attempts set state='expired' where order_id=oid and state in ('creating','open');
 if found then update capacity_reservations set state='released' where order_id=oid and state='held';end if;
end $$;
revoke all on function public.create_reserved_order(uuid,text,jsonb,date,uuid,jsonb,int),public.apply_paid_session(text,text,uuid,int,text,boolean),public.release_expired_session(text) from public,anon,authenticated;
grant execute on function public.create_reserved_order(uuid,text,jsonb,date,uuid,jsonb,int),public.apply_paid_session(text,text,uuid,int,text,boolean),public.release_expired_session(text) to service_role;
-- Acceso privado por token: nunca por referencia visible. Solo API de servidor.
create function public.guest_order(p_id uuid,p_hash text) returns jsonb language sql security definer set search_path=public as $$select jsonb_build_object('id',o.id,'reference',o.reference,'date',o.date,'status',o.status,'payment_status',o.payment_status,'total_cents',o.total_cents,'items',(select jsonb_agg(snapshot) from order_items where order_id=o.id)) from orders o where o.id=p_id and o.guest_token_hash=p_hash$$;
revoke all on function public.guest_order(uuid,text) from public,anon,authenticated;
grant execute on function public.guest_order(uuid,text) to service_role;
-- Archivos de clientes siempre privados. Sin políticas públicas de subida o lectura.
insert into storage.buckets(id,name,public) values('quote-private','quote-private',false) on conflict do nothing;
