-- Drop unused social flags on public.newsletter.
-- They are not read by the page-generation flow. The only n8n consumer
-- selects rows where "pagina-gerada" = false, for any date.
--
-- RLS is not changed. It stays disabled, matching the current table.

alter table public.newsletter
  drop column if exists "liturgia-telegram",
  drop column if exists "liturgia-reddit",
  drop column if exists "twitter-send";
