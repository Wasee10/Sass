-- Development-only sample data for an existing local Supabase account.
-- Create/sign up demo@saas-core.local in local Supabase Auth before running.
do $$
declare
  seed_user_id uuid;
begin
  select id
    into seed_user_id
    from auth.users
    where email = 'demo@saas-core.local'
    limit 1;

  if seed_user_id is null then
    raise exception 'Create demo@saas-core.local in local Supabase Auth before running this seed.';
  end if;

  insert into public.profiles (id, full_name, company_name)
  values (seed_user_id, 'Demo Member', 'Example Workspace')
  on conflict (id) do update
    set full_name = excluded.full_name,
        company_name = excluded.company_name,
        updated_at = timezone('utc'::text, now());

  insert into public.subscriptions (user_id, plan_id, status, billing_interval)
  values (seed_user_id, 'free', 'active', 'month')
  on conflict (user_id) do update
    set plan_id = excluded.plan_id,
        status = excluded.status,
        billing_interval = excluded.billing_interval,
        updated_at = timezone('utc'::text, now());

  insert into public.invoices (user_id, invoice_number, amount, currency, status, created_at)
  select seed_user_id, 'DEV-2026-001', 0, 'USD', 'paid', timezone('utc'::text, now()) - interval '30 days'
  where not exists (
    select 1 from public.invoices
    where user_id = seed_user_id and invoice_number = 'DEV-2026-001'
  );

  insert into public.invoices (user_id, invoice_number, amount, currency, status, created_at)
  select seed_user_id, 'DEV-2026-002', 0, 'USD', 'paid', timezone('utc'::text, now())
  where not exists (
    select 1 from public.invoices
    where user_id = seed_user_id and invoice_number = 'DEV-2026-002'
  );
end;
$$;
