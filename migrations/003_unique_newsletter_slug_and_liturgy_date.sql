-- Unique constraints on public.newsletter.slug and public.newsletter.liturgy_date.
-- Run migrations/002 first.
--
-- This file does NOT delete anything. If the check below raises, preview and
-- dedupe manually, then run this file again.
--
-- Rows with a null liturgy_date or a null slug are allowed (PostgreSQL unique
-- treats nulls as distinct). Empty-string slugs are not.
--
-- Preview liturgy_date duplicates (rn > 1 would be deleted):
-- select id, slug, liturgy_date, "pagina-gerada", created_at
-- from (
--   select id, slug, liturgy_date, "pagina-gerada", created_at,
--          row_number() over (
--            partition by liturgy_date
--            order by "pagina-gerada" desc nulls last, id desc
--          ) as rn
--   from public.newsletter
--   where liturgy_date is not null
-- ) ranked
-- where rn > 1
-- order by liturgy_date, id;
--
-- Dedupe liturgy_date. Keeps the row whose page was already generated,
-- otherwise the newest id:
-- delete from public.newsletter
-- where id in (
--   select id from (
--     select id,
--            row_number() over (
--              partition by liturgy_date
--              order by "pagina-gerada" desc nulls last, id desc
--            ) as rn
--     from public.newsletter
--     where liturgy_date is not null
--   ) ranked
--   where rn > 1
-- );
--
-- Preview slug duplicates:
-- select id, slug, liturgy_date, "pagina-gerada", created_at
-- from (
--   select id, slug, liturgy_date, "pagina-gerada", created_at,
--          row_number() over (
--            partition by slug
--            order by "pagina-gerada" desc nulls last, id desc
--          ) as rn
--   from public.newsletter
--   where slug is not null
-- ) ranked
-- where rn > 1
-- order by slug, id;
--
-- Dedupe slug, with the same keep rule:
-- delete from public.newsletter
-- where id in (
--   select id from (
--     select id,
--            row_number() over (
--              partition by slug
--              order by "pagina-gerada" desc nulls last, id desc
--            ) as rn
--     from public.newsletter
--     where slug is not null
--   ) ranked
--   where rn > 1
-- );

begin;

do $$
declare
  date_dups text;
  slug_dups text;
begin
  select string_agg(liturgy_date::text || ' x' || cnt, ', ' order by liturgy_date::text)
    into date_dups
  from (
    select liturgy_date, count(*) as cnt
    from public.newsletter
    where liturgy_date is not null
    group by liturgy_date
    having count(*) > 1
    order by liturgy_date
    limit 20
  ) d;

  select string_agg(slug || ' x' || cnt, ', ' order by slug)
    into slug_dups
  from (
    select slug, count(*) as cnt
    from public.newsletter
    where slug is not null
    group by slug
    having count(*) > 1
    order by slug
    limit 20
  ) d;

  if date_dups is not null or slug_dups is not null then
    raise exception '%',
      'Refusing to add unique constraints. Duplicate liturgy_date: '
      || coalesce(date_dups, 'none')
      || '. Duplicate slug: '
      || coalesce(slug_dups, 'none')
      || '. Run the dedupe SQL at the top of migrations/003_unique_newsletter_slug_and_liturgy_date.sql, then run this file again.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'newsletter_liturgy_date_key'
      and conrelid = 'public.newsletter'::regclass
  ) then
    execute 'alter table public.newsletter add constraint newsletter_liturgy_date_key unique (liturgy_date)';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'newsletter_slug_key'
      and conrelid = 'public.newsletter'::regclass
  ) then
    execute 'alter table public.newsletter add constraint newsletter_slug_key unique (slug)';
  end if;
end $$;

commit;
