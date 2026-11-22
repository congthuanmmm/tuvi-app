-- Charts saved per user, AI messages, and daily AI usage (3/day, Vietnam time).

create table if not exists public.charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  label text,
  birth jsonb not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists charts_user_idx on public.charts (user_id, created_at desc);
alter table public.charts enable row level security;
create policy "charts_select_own" on public.charts for select using (auth.uid() = user_id);
create policy "charts_insert_own" on public.charts for insert with check (auth.uid() = user_id);
create policy "charts_delete_own" on public.charts for delete using (auth.uid() = user_id);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  chart_id uuid not null references public.charts on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_chart_idx on public.messages (chart_id, id);
alter table public.messages enable row level security;
create policy "messages_select_own" on public.messages for select using (auth.uid() = user_id);

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
create policy "ai_usage_select_own" on public.ai_usage for select using (auth.uid() = user_id);

-- Atomically takes one credit; returns the new count, or null when the limit is reached.
create or replace function public.consume_ai_credit(p_user uuid, p_limit int)
returns int language sql security definer set search_path = public as $$
  insert into ai_usage (user_id, day, count)
  values (p_user, (now() at time zone 'Asia/Ho_Chi_Minh')::date, 1)
  on conflict (user_id, day) do update set count = ai_usage.count + 1
  where ai_usage.count < p_limit
  returning count;
$$;

create or replace function public.refund_ai_credit(p_user uuid)
returns void language sql security definer set search_path = public as $$
  update ai_usage set count = greatest(count - 1, 0)
  where user_id = p_user and day = (now() at time zone 'Asia/Ho_Chi_Minh')::date;
$$;

revoke execute on function public.consume_ai_credit(uuid, int) from public, anon, authenticated;
revoke execute on function public.refund_ai_credit(uuid) from public, anon, authenticated;
grant execute on function public.consume_ai_credit(uuid, int) to service_role;
grant execute on function public.refund_ai_credit(uuid) to service_role;
