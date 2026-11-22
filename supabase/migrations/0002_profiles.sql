create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  ai_used_total int not null default 0
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, created_at) values (new.id, new.email, new.created_at)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email, created_at, ai_used_total)
select u.id, u.email, u.created_at, coalesce((select sum(count) from public.ai_usage a where a.user_id = u.id), 0)
from auth.users u
on conflict (id) do nothing;

create or replace function public.consume_ai_credit(p_user uuid, p_limit int)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into ai_usage (user_id, day, count)
  values (p_user, (now() at time zone 'Asia/Ho_Chi_Minh')::date, 1)
  on conflict (user_id, day) do update set count = ai_usage.count + 1
  where ai_usage.count < p_limit
  returning count into n;
  if n is not null then
    update profiles set ai_used_total = ai_used_total + 1 where id = p_user;
  end if;
  return n;
end;
$$;

create or replace function public.refund_ai_credit(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update ai_usage set count = greatest(count - 1, 0)
  where user_id = p_user and day = (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  update profiles set ai_used_total = greatest(ai_used_total - 1, 0) where id = p_user;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.consume_ai_credit(uuid, int) from public, anon, authenticated;
revoke execute on function public.refund_ai_credit(uuid) from public, anon, authenticated;
grant execute on function public.consume_ai_credit(uuid, int) to service_role;
grant execute on function public.refund_ai_credit(uuid) to service_role;
