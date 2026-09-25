create table if not exists products (
  id text primary key, name text not null, setup numeric(12,2) not null default 0,
  active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists materials (
  id text primary key, name text not null, price_per_m2 numeric(12,2) not null default 0,
  active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists finishes (
  id text primary key, name text not null, price_per_m2 numeric(12,2) not null default 0,
  active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists dies (
  id text primary key, name text not null, price numeric(12,2) not null default 0,
  active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists quantity_tiers (
  id text primary key, min_quantity integer not null, factor numeric(8,4) not null default 1,
  active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists customers (
  id text primary key, name text not null, email text, phone text, company text,
  created_at timestamptz not null default now()
);
create table if not exists quotes (
  id text primary key, customer_id text references customers(id) on delete set null,
  status text not null default 'draft', public_token text, input jsonb not null, quote jsonb not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table quotes add column if not exists customer_id text references customers(id) on delete set null;
alter table quotes add column if not exists status text not null default 'draft';
alter table quotes add column if not exists public_token text;
alter table quotes add column if not exists updated_at timestamptz not null default now();
create unique index if not exists quotes_public_token_idx on quotes (public_token) where public_token is not null;
create index if not exists quotes_created_at_idx on quotes (created_at desc);
create index if not exists quotes_status_idx on quotes (status);
create index if not exists quotes_customer_idx on quotes (customer_id);
