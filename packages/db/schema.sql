create table if not exists products (
  id text primary key,
  name text not null,
  setup numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists materials (
  id text primary key,
  name text not null,
  price_per_m2 numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists finishes (
  id text primary key,
  name text not null,
  price_per_m2 numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists dies (
  id text primary key,
  name text not null,
  price numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists quantity_tiers (
  id text primary key,
  min_quantity integer not null,
  factor numeric(8,4) not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists quotes (
  id text primary key,
  input jsonb not null,
  quote jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists quotes_created_at_idx on quotes (created_at desc);
create index if not exists products_active_idx on products (active);
create index if not exists materials_active_idx on materials (active);
create index if not exists finishes_active_idx on finishes (active);
create index if not exists dies_active_idx on dies (active);
create index if not exists quantity_tiers_min_idx on quantity_tiers (min_quantity desc);

insert into products (id, name, setup) values
  ('label', 'Etiqueta adesiva', 25),
  ('sticker', 'Sticker personalizado', 35)
on conflict (id) do nothing;

insert into materials (id, name, price_per_m2) values
  ('bopp-white', 'BOPP branco', 180),
  ('paper-white', 'Papel branco', 120),
  ('paper-kraft', 'Papel kraft', 140)
on conflict (id) do nothing;

insert into finishes (id, name, price_per_m2) values
  ('none', 'Sem acabamento', 0),
  ('matte', 'Laminação fosca', 60),
  ('gloss', 'Laminação brilho', 70)
on conflict (id) do nothing;

insert into dies (id, name, price) values
  ('standard', 'Faca padrão', 0),
  ('custom', 'Faca especial', 45)
on conflict (id) do nothing;

insert into quantity_tiers (id, min_quantity, factor) values
  ('tier-5000', 5000, 0.88),
  ('tier-2500', 2500, 0.93),
  ('tier-1000', 1000, 0.97),
  ('tier-1', 1, 1)
on conflict (id) do nothing;