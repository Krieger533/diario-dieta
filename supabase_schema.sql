-- Cole no Supabase > SQL Editor > New query > Run

create table if not exists dieta_dias (
  id          bigint generated always as identity primary key,
  user_id     text not null default 'eduardo',
  date_key    text not null,
  data        jsonb not null default '{}',
  updated_at  timestamptz default now(),
  unique (user_id, date_key)
);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger dieta_dias_updated_at
  before update on dieta_dias
  for each row execute procedure update_updated_at();

alter table dieta_dias enable row level security;

create policy "acesso livre" on dieta_dias
  for all using (true) with check (true);
