create extension if not exists pgcrypto;
create type public.property_status as enum ('active', 'inactive', 'sold');

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  title text not null,
  description text not null,
  price numeric(14,2) not null check (price > 0),
  city text not null,
  neighborhood text not null,
  address text,
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  parking_spaces integer not null default 0 check (parking_spaces >= 0),
  area_m2 numeric(10,2) not null check (area_m2 > 0),
  status public.property_status not null default 'inactive',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null unique,
  public_url text,
  alt_text text not null default '',
  position integer not null check (position >= 0),
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index property_images_property_position_idx on public.property_images(property_id, position);
create index properties_public_lookup_idx on public.properties(status, slug);

alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.admin_users enable row level security;

create policy "Public reads active properties" on public.properties for select using (status = 'active');
create policy "Public reads active property images" on public.property_images for select using (
  exists (select 1 from public.properties p where p.id = property_images.property_id and p.status = 'active')
);
create policy "Admins manage properties" on public.properties for all to authenticated using (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "Admins manage images" on public.property_images for all to authenticated using (
  exists (select 1 from public.admin_users a where a.user_id = auth.uid())
) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
create policy "Admins view membership" on public.admin_users for select to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public) values ('property-drafts', 'property-drafts', false), ('property-images', 'property-images', true)
on conflict (id) do update set public = excluded.public;

create policy "Admins upload property drafts" on storage.objects for all to authenticated
using (bucket_id = 'property-drafts' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (bucket_id = 'property-drafts' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
