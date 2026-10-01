-- Campos extras para os destaques do imóvel: posição solar, taxa de condomínio e faixa de andares.
alter table public.properties
  add column if not exists sun_position text,
  add column if not exists condo_fee numeric(12,2) check (condo_fee is null or condo_fee >= 0),
  add column if not exists floor_range text;
