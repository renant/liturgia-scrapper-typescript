import { CivilDate, isoDate, slugFromDate } from "./dates.js";
import {
  NewsletterContent,
  planNewsletterWrite,
} from "./newsletterPlan.js";
import type { LiturgiaData } from "./scrapeLiturgiaWebsite.js";
import type { ReflectionOfTheDayData } from "./scrapeReflectionOfTheDay.js";
import type { SaintOfTheDayData } from "./scrapeSaintOfTheDay.js";
import type { FeedItem } from "./scrapeVaticanNews.js";
import { getSupabase } from "./supabaseClient.js";

export type NewsletterRow = {
  id: number;
  slug: string | null;
  liturgy_date: string | null;
  liturgyData: LiturgiaData | null;
  saintOfTheDayData: SaintOfTheDayData | null;
  reflection: ReflectionOfTheDayData | null;
  vaticanNewsData: FeedItem[] | null;
  "pagina-gerada": boolean | null;
};

const NEWSLETTER_COLUMNS =
  'id, slug, liturgy_date, liturgyData, saintOfTheDayData, reflection, vaticanNewsData, "pagina-gerada"';

export async function listNewslettersInRange(
  start: CivilDate,
  end: CivilDate
): Promise<Map<string, NewsletterRow>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("newsletter")
    .select(NEWSLETTER_COLUMNS)
    .gte("liturgy_date", isoDate(start))
    .lte("liturgy_date", isoDate(end));
  if (error) throw error;

  const rows = new Map<string, NewsletterRow>();
  for (const row of (data ?? []) as NewsletterRow[]) {
    if (!row.liturgy_date) continue;
    const current = rows.get(row.liturgy_date);
    if (current) {
      console.warn(
        `Duplicate newsletter rows for ${row.liturgy_date}; keeping the generated page, or else the newest id. Run migrations/003 dedupe SQL.`
      );
    }
    rows.set(row.liturgy_date, preferRow(current, row));
  }
  return rows;
}

export async function getNewsletterByDate(
  date: CivilDate
): Promise<NewsletterRow | null> {
  const supabase = getSupabase();
  const liturgyDate = isoDate(date);
  const { data, error } = await supabase
    .from("newsletter")
    .select(NEWSLETTER_COLUMNS)
    .eq("liturgy_date", liturgyDate)
    .maybeSingle();
  if (error) {
    if (error.code === "PGRST116") {
      throw new Error(
        `More than one newsletter row for ${liturgyDate}. Run the dedupe SQL in migrations/003_unique_newsletter_slug_and_liturgy_date.sql.`
      );
    }
    throw error;
  }
  return (data as NewsletterRow | null) ?? null;
}

/**
 * Inserts with `"pagina-gerada" = false` so n8n generates the page.
 * Updates an existing row, and clears that flag, only when content changed.
 * An unchanged row is not written, so a page n8n already generated stays generated.
 */
export async function upsertNewsletter(
  date: CivilDate,
  content: NewsletterContent,
  existing: NewsletterRow | null,
  attempt = 0
): Promise<"inserted" | "updated" | "skipped"> {
  const action = planNewsletterWrite(existing, content);
  if (action === "skip") return "skipped";

  const slug = slugFromDate(date);
  const liturgyDate = isoDate(date);
  const supabase = getSupabase();

  if (action === "insert") {
    const { error } = await supabase.from("newsletter").insert({
      liturgyData: content.liturgyData,
      saintOfTheDayData: content.saintOfTheDayData ?? null,
      reflection: content.reflection ?? null,
      vaticanNewsData: content.vaticanNewsData ?? null,
      slug,
      liturgy_date: liturgyDate,
      "pagina-gerada": false,
    });
    if (error && isUniqueViolation(error)) {
      if (attempt >= 1) throw error;
      const row = await getNewsletterByDate(date);
      if (!row) throw error;
      return upsertNewsletter(date, content, row, attempt + 1);
    }
    if (error) throw error;
    return "inserted";
  }

  if (!existing) {
    throw new Error(`Missing newsletter row for ${liturgyDate}`);
  }

  const patch: Record<string, unknown> = {
    liturgyData: content.liturgyData,
    slug,
    liturgy_date: liturgyDate,
    "pagina-gerada": false,
  };
  if (content.saintOfTheDayData !== undefined) {
    patch.saintOfTheDayData = content.saintOfTheDayData;
  }
  if (content.reflection !== undefined) {
    patch.reflection = content.reflection;
  }
  if (content.vaticanNewsData !== undefined) {
    patch.vaticanNewsData = content.vaticanNewsData;
  }

  const { error } = await supabase
    .from("newsletter")
    .update(patch)
    .eq("id", existing.id);
  if (error && isUniqueViolation(error)) {
    if (attempt >= 1) throw error;
    const row = await getNewsletterByDate(date);
    if (!row) throw error;
    return upsertNewsletter(date, content, row, attempt + 1);
  }
  if (error) throw error;
  return "updated";
}

function preferRow(
  current: NewsletterRow | undefined,
  next: NewsletterRow
): NewsletterRow {
  if (!current) return next;
  const currentGenerated = current["pagina-gerada"] === true;
  const nextGenerated = next["pagina-gerada"] === true;
  if (nextGenerated !== currentGenerated) {
    return nextGenerated ? next : current;
  }
  return next.id > current.id ? next : current;
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}
