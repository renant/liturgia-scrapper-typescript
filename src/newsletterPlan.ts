import type { LiturgiaData } from "./scrapeLiturgiaWebsite.js";
import type { ReflectionOfTheDayData } from "./scrapeReflectionOfTheDay.js";
import type { SaintOfTheDayData } from "./scrapeSaintOfTheDay.js";
import type { FeedItem } from "./scrapeVaticanNews.js";

/**
 * Days from today that are fetched again even when a row already exists.
 * today..+3 picks up corrections; farther days are inserted once.
 */
export const NEAR_DAY_OFFSET = 3;

export type NewsletterContent = {
  liturgyData: LiturgiaData;
  saintOfTheDayData?: SaintOfTheDayData | null;
  reflection?: ReflectionOfTheDayData | null;
  vaticanNewsData?: FeedItem[] | null;
};

export type StoredNewsletterContent = {
  liturgyData: LiturgiaData | null;
  saintOfTheDayData?: SaintOfTheDayData | null;
  reflection?: ReflectionOfTheDayData | null;
  vaticanNewsData?: FeedItem[] | null;
};

/**
 * `insert` and `update` both write `"pagina-gerada" = false`.
 * `skip` does not write, so an already generated page stays generated.
 * Optional fields that are omitted from `next` are left untouched, which
 * keeps a failed Paulus/Vatican scrape from wiping today's extras.
 */
export function planNewsletterWrite(
  existing: StoredNewsletterContent | null,
  next: NewsletterContent
): "insert" | "update" | "skip" {
  if (!existing) return "insert";
  if (!sameJson(existing.liturgyData, next.liturgyData)) return "update";
  if (
    next.reflection !== undefined &&
    !sameJson(existing.reflection ?? null, next.reflection)
  ) {
    return "update";
  }
  if (
    next.saintOfTheDayData !== undefined &&
    !sameJson(existing.saintOfTheDayData ?? null, next.saintOfTheDayData)
  ) {
    return "update";
  }
  if (
    next.vaticanNewsData !== undefined &&
    !sameJson(existing.vaticanNewsData ?? null, next.vaticanNewsData)
  ) {
    return "update";
  }
  return "skip";
}

export function shouldScrapeDate(
  offsetFromToday: number,
  alreadyStored: boolean,
  nearDays = NEAR_DAY_OFFSET
): boolean {
  if (offsetFromToday < 0) return false;
  if (!alreadyStored) return true;
  return offsetFromToday <= nearDays;
}

export function hasSendableLiturgy(
  row: { liturgyData?: { liturgies?: string[] | null } | null } | null
): boolean {
  return (row?.liturgyData?.liturgies?.length ?? 0) > 0;
}

/** True when `claim_newsletter_send` returned the claimed row. */
export function wasSendClaimed(data: unknown): boolean {
  if (data == null) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === "object") return true;
  return false;
}

export function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalizeJson(a)) === JSON.stringify(normalizeJson(b));
}

function normalizeJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeJson);
  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      normalized[key] = normalizeJson(source[key]);
    }
    return normalized;
  }
  return value ?? null;
}
