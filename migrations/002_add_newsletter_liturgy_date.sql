-- Adds public.newsletter.liturgy_date (America/Sao_Paulo civil date).
-- Does not add the unique constraint; that is migrations/003, after duplicates
-- are checked. Safe to re-run: existing liturgy_date values are left as they are.
--
-- Slugs that do not match DD-mes-YYYY stay null and are reported with RAISE NOTICE.
-- Inspect them with:
--   select id, slug from public.newsletter where liturgy_date is null order by id;

alter table public.newsletter
  add column if not exists liturgy_date date;

comment on column public.newsletter.liturgy_date is
  'Civil liturgy date in America/Sao_Paulo. n8n page generation still keys off "pagina-gerada" = false for any date; this column is how the scraper and the daily email find one row per day.';

do $$
declare
  r record;
  m text[];
  y int;
  month_num int;
  d int;
  filled int := 0;
  skipped int := 0;
begin
  for r in
    select id, slug
    from public.newsletter
    where liturgy_date is null
      and slug is not null
  loop
    m := regexp_match(
      r.slug,
      '^([0-9]{2})-(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)-([0-9]{4})$'
    );
    if m is null then
      skipped := skipped + 1;
      raise notice 'Slug did not match DD-mes-YYYY: id % slug %', r.id, r.slug;
      continue;
    end if;

    d := m[1]::int;
    y := m[3]::int;
    month_num := case m[2]
      when 'janeiro' then 1
      when 'fevereiro' then 2
      when 'março' then 3
      when 'marco' then 3
      when 'abril' then 4
      when 'maio' then 5
      when 'junho' then 6
      when 'julho' then 7
      when 'agosto' then 8
      when 'setembro' then 9
      when 'outubro' then 10
      when 'novembro' then 11
      when 'dezembro' then 12
      else null
    end;

    begin
      update public.newsletter
      set liturgy_date = make_date(y, month_num, d)
      where id = r.id
        and liturgy_date is null;
      filled := filled + 1;
    exception
      when others then
        skipped := skipped + 1;
        raise notice 'Could not backfill newsletter id % slug %: %', r.id, r.slug, sqlerrm;
    end;
  end loop;

  raise notice 'liturgy_date backfill filled % row(s), skipped % row(s)', filled, skipped;
end $$;
