-- Exactly-once daily email claim, separate from public.newsletter.
-- Future liturgy rows do not get a row here and therefore cannot send mail.
--
-- RLS is intentionally NOT enabled on this table or on public.newsletter.
-- Both are currently reachable with the anon key because RLS is off, and n8n
-- reads newsletter the same way. Enabling RLS without policies would stop
-- page generation and this scraper. Add policies in a later change, then
-- point the scraper at the service role.
--
-- Claim states for one liturgy_date:
--   no row                         -> sending     (this run may send)
--   failed and broadcast_id null   -> sending     (same-day retry)
--   sending                        -> left as-is  (in progress, or crashed after claim)
--   sent                           -> left as-is
--   failed and broadcast_id set    -> left as-is  (a broadcast already exists)
--
-- A stuck sending row is not retried, so a crash after claim cannot send twice.
-- Repair by hand:
--   -- broadcast exists and the email went out:
--   update public.newsletter_send
--   set status = 'sent', sent_at = now(), error = null
--   where liturgy_date = DATE '2026-10-14' and broadcast_id is not null;
--
--   -- allow the next send run on that same Sao Paulo date to try again
--   -- (only when no broadcast was created, or you have discarded the draft):
--   update public.newsletter_send
--   set status = 'failed', broadcast_id = null, error = null
--   where liturgy_date = DATE '2026-10-14';

create table if not exists public.newsletter_send (
  liturgy_date date primary key,
  status text not null,
  broadcast_id text,
  claimed_at timestamptz,
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  constraint newsletter_send_status_check check (status in ('sending', 'sent', 'failed'))
);

comment on table public.newsletter_send is
  'Exactly-once email claim keyed by the America/Sao_Paulo liturgy date. Independent of public.newsletter, so future page rows never send mail.';

create or replace function public.claim_newsletter_send(p_date date)
returns setof public.newsletter_send
language plpgsql
security invoker
set search_path = public
as $$
begin
  return query
  insert into public.newsletter_send (liturgy_date, status, claimed_at)
  values (p_date, 'sending', now())
  on conflict (liturgy_date) do update
    set status = 'sending',
        claimed_at = now(),
        error = null
    where newsletter_send.status = 'failed'
      and newsletter_send.broadcast_id is null
  returning *;
end;
$$;

comment on function public.claim_newsletter_send(date) is
  'Atomically claims one liturgy date for sending. Returns no row when the date must not be sent again.';

grant select, insert, update on public.newsletter_send to anon, authenticated, service_role;
grant execute on function public.claim_newsletter_send(date) to anon, authenticated, service_role;
