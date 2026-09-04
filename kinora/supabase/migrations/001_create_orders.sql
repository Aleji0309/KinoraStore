create extension if not exists pgcrypto;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  created_at timestamptz not null default now(),
  status text not null default 'pending',
  market text not null,
  currency text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  province text not null,
  canton text not null,
  district text not null,
  address text not null,
  delivery_reference text,
  subtotal integer not null,
  shipping_amount integer not null default 0,
  total integer not null,
  items jsonb not null,
  constraint orders_status_check check (status in ('pending', 'preparing', 'shipped', 'delivered', 'cancelled')),
  constraint orders_market_check check (market = 'CR'),
  constraint orders_currency_check check (currency = 'CRC'),
  constraint orders_customer_name_check check (char_length(customer_name) between 2 and 100),
  constraint orders_customer_email_check check (char_length(customer_email) between 3 and 254),
  constraint orders_customer_phone_check check (char_length(customer_phone) between 8 and 30),
  constraint orders_province_check check (province in ('San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón')),
  constraint orders_canton_check check (char_length(canton) between 2 and 100),
  constraint orders_district_check check (char_length(district) between 2 and 100),
  constraint orders_address_check check (char_length(address) between 5 and 500),
  constraint orders_delivery_reference_check check (delivery_reference is null or char_length(delivery_reference) <= 500),
  constraint orders_subtotal_check check (subtotal >= 0),
  constraint orders_shipping_amount_check check (shipping_amount = 0),
  constraint orders_total_check check (total = subtotal),
  constraint orders_items_check check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50)
);

alter table public.orders enable row level security;

revoke insert, update, delete on public.orders from anon, authenticated;
