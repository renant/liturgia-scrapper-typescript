import * as cheerio from "cheerio";
import { CivilDate, isoDate } from "./dates.js";

const MONTH_BY_LABEL: Record<string, number> = {
  jan: 1,
  janeiro: 1,
  fev: 2,
  fevereiro: 2,
  feb: 2,
  mar: 3,
  marco: 3,
  abr: 4,
  abril: 4,
  apr: 4,
  mai: 5,
  maio: 5,
  may: 5,
  jun: 6,
  junho: 6,
  jul: 7,
  julho: 7,
  ago: 8,
  agosto: 8,
  aug: 8,
  set: 9,
  setembro: 9,
  sep: 9,
  sept: 9,
  out: 10,
  outubro: 10,
  oct: 10,
  nov: 11,
  novembro: 11,
  dez: 12,
  dezembro: 12,
  dec: 12,
};

export type CalendarLink = {
  date: CivilDate;
  href: string;
  slug: string;
};

export function monthFromLabel(label: string): number | null {
  const normalized = label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return MONTH_BY_LABEL[normalized] ?? null;
}

export function liturgySlug(url: string): string | null {
  try {
    const parsed = new URL(url, "https://liturgia.cancaonova.com");
    const match = parsed.pathname.match(/\/liturgia\/([^/]+)\/?$/i);
    if (!match?.[1]) return null;
    return decodeURIComponent(match[1]).toLowerCase();
  } catch {
    return null;
  }
}

export function dateFromLiturgyHref(href: string): CivilDate | null {
  try {
    const parsed = new URL(href, "https://liturgia.cancaonova.com");
    const day = Number(parsed.searchParams.get("sDia"));
    const month = Number(parsed.searchParams.get("sMes"));
    const year = Number(parsed.searchParams.get("sAno"));
    if (
      !Number.isInteger(day) ||
      !Number.isInteger(month) ||
      !Number.isInteger(year)
    ) {
      return null;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1990) {
      return null;
    }
    return { year, month, day };
  } catch {
    return null;
  }
}

/**
 * Links from the Canção Nova month calendar. Days rendered without an
 * anchor are omitted — those liturgies are not published yet.
 */
export function parseCalendarLinks(html: string): CalendarLink[] {
  const $ = cheerio.load(html);
  const byDate = new Map<string, CalendarLink>();
  $("#wp-calendar a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const date = dateFromLiturgyHref(href);
    const slug = liturgySlug(href);
    if (!date || !slug) return;
    const textDay = Number($(el).text().replace(/\s+/g, ""));
    if (Number.isInteger(textDay) && textDay > 0 && textDay !== date.day) {
      return;
    }
    byDate.set(isoDate(date), { date, href, slug });
  });
  return [...byDate.values()];
}

export function readDisplayedLiturgyDate(html: string): CivilDate | null {
  const $ = cheerio.load(html);
  const day = Number($("#dia-calendar").first().text().trim());
  const month = monthFromLabel($("#mes-calendar").first().text());
  const year = Number($("#ano-calendar").first().text().trim());
  if (!Number.isInteger(day) || !month || !Number.isInteger(year)) return null;
  if (day < 1 || day > 31 || year < 1990) return null;
  return { year, month, day };
}
