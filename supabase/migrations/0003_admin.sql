create or replace function public.admin_users()
returns table (id uuid, email text, created_at timestamptz, ai_used_total int, ai_used_today int, charts bigint)
language sql stable security definer set search_path = public as $$
  select p.id, p.email, p.created_at, p.ai_used_total,
    coalesce(u.count, 0),
    (select count(*) from charts c where c.user_id = p.id)
  from profiles p
  left join ai_usage u on u.user_id = p.id and u.day = (now() at time zone 'Asia/Ho_Chi_Minh')::date
  order by p.created_at desc;
$$;

revoke execute on function public.admin_users() from public, anon, authenticated;
grant execute on function public.admin_users() to service_role;
