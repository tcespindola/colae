create table if not exists quotes (
  id text primary key,
  input jsonb not null,
  quote jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists quotes_created_at_idx on quotes (created_at desc);
