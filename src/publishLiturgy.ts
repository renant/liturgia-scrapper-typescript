import axios from "axios";
import {
  CivilDate,
  dateRange,
  daysBetween,
  isoDate,
  parseDaysAhead,
  parseScrapeDelayMs,
  todayInSaoPaulo,
  uniqueYearMonths,
} from "./dates.js";
import { CalendarLink, parseCalendarLinks } from "./liturgyCalendar.js";
import {
  NewsletterContent,
  shouldScrapeDate,
} from "./newsletterPlan.js";
import {
  listNewslettersInRange,
  upsertNewsletter,
} from "./newsletterRepository.js";
import { scrapeReflectionOfTheDay } from "./scrapeReflectionOfTheDay.js";
import { scrapeSaintOfTheDay } from "./scrapeSaintOfTheDay.js";
import {
  extractLiturgyFromHtml,
  fetchText,
  LiturgiaData,
} from "./scrapeLiturgiaWebsite.js";
import { scrapeVaticanNews } from "./scrapeVaticanNews.js";

const CALENDAR_AJAX = "https://liturgia.cancaonova.com/wp-admin/admin-ajax.php";

type TodayExtras = {
  reflection: Awaited<ReturnType<typeof scrapeReflectionOfTheDay>>;
  saint: Awaited<ReturnType<typeof scrapeSaintOfTheDay>>;
  vaticanNews: Awaited<ReturnType<typeof scrapeVaticanNews>>;
};

/**
 * Scrapes today through today+DAYS_AHEAD (America/Sao_Paulo) and upserts
 * `newsletter`. Does not send email. Future rows are inserted with
 * `"pagina-gerada" = false` so the n8n page job can publish them.
 */
export async function publishLiturgyAhead(now = new Date()): Promise<void> {
  const today = todayInSaoPaulo(now);
  const daysAhead = parseDaysAhead(process.env.DAYS_AHEAD);
  const delayMs = parseScrapeDelayMs(process.env.SCRAPE_DELAY_MS);
  const dates = dateRange(today, daysAhead);
  const existing = await listNewslettersInRange(dates[0], dates[dates.length - 1]);
  const datesToFetch = dates.filter((date) =>
    shouldScrapeDate(daysBetween(today, date), existing.has(isoDate(date)))
  );

  console.info(
    `Publishing liturgy from ${isoDate(today)} through ${isoDate(dates[dates.length - 1])}; ${datesToFetch.length} day(s) to fetch.`
  );
  if (datesToFetch.length === 0) return;

  const pace = createPacer(delayMs);
  const links = new Map<string, CalendarLink>();
  for (const month of uniqueYearMonths(datesToFetch)) {
    const label = `${month.year}-${String(month.month).padStart(2, "0")}`;
    try {
      const html = await pace(() => fetchCalendarMonth(month.year, month.month));
      if (!html.includes("wp-calendar")) {
        console.info(
          `Calendar for ${label} returned no calendar markup; its days will be skipped.`
        );
        continue;
      }
      const parsed = parseCalendarLinks(html);
      if (parsed.length === 0) {
        console.info(
          `No liturgy links for ${label}; days in that month are not published yet and will be skipped.`
        );
        continue;
      }
      for (const link of parsed) {
        links.set(isoDate(link.date), link);
      }
    } catch (error) {
      console.error(
        `Calendar request failed for ${label}; its days will be skipped.`,
        error
      );
    }
  }

  let extras: TodayExtras | null = null;

  for (const date of datesToFetch) {
    const key = isoDate(date);
    const link = links.get(key);
    if (!link) {
      console.info(`No calendar link for ${key}; skipping.`);
      continue;
    }
    let html: string;
    try {
      html = await pace(() => fetchText(link.href));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `HTTP error fetching liturgy for ${key}; skipping.`,
          error.message
        );
        continue;
      }
      throw error;
    }
    const liturgyData = extractLiturgyFromHtml(html, {
      date,
      slug: link.slug,
    });
    if (!liturgyData) {
      console.warn(
        `Liturgy page for ${key} did not match ${link.slug}; skipping.`
      );
      continue;
    }
    if (daysBetween(today, date) === 0) {
      extras = await scrapeTodayExtras();
    }
    const outcome = await upsertNewsletter(
      date,
      contentForDate(date, today, liturgyData, extras),
      existing.get(key) ?? null
    );
    if (outcome === "inserted") {
      console.info(`Inserted ${key} with pagina-gerada=false.`);
    } else if (outcome === "updated") {
      console.info(
        `Updated ${key} and set pagina-gerada=false because content changed.`
      );
    } else {
      console.info(`Left ${key} unchanged; pagina-gerada was not modified.`);
    }
  }
}

function contentForDate(
  date: CivilDate,
  today: CivilDate,
  liturgyData: LiturgiaData,
  extras: TodayExtras | null
): NewsletterContent {
  const content: NewsletterContent = { liturgyData };
  if (!extras || daysBetween(today, date) !== 0) return content;
  if (extras.reflection) content.reflection = extras.reflection;
  if (extras.saint) content.saintOfTheDayData = extras.saint;
  if (extras.vaticanNews) content.vaticanNewsData = extras.vaticanNews;
  return content;
}

/**
 * Paulus and the Vatican feed are not date-addressable. They are stored
 * only on today's row, and a null result does not overwrite a previous value.
 */
async function scrapeTodayExtras(): Promise<TodayExtras> {
  const [reflection, saint, vaticanNews] = await Promise.all([
    scrapeReflectionOfTheDay(),
    scrapeSaintOfTheDay(),
    scrapeVaticanNews(),
  ]);
  return { reflection, saint, vaticanNews };
}

async function fetchCalendarMonth(year: number, month: number): Promise<string> {
  const body = new URLSearchParams({
    action: "widget-ajax",
    sMes: String(month),
    sAno: String(year),
    title: "",
    type: "liturgia",
    ajax: "true",
  });
  return fetchText(CALENDAR_AJAX, {
    method: "POST",
    data: body.toString(),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

function createPacer(delayMs: number) {
  let lastFinishedAt = 0;
  return async function pace<T>(run: () => Promise<T>): Promise<T> {
    if (lastFinishedAt) {
      const wait = delayMs - (Date.now() - lastFinishedAt);
      if (wait > 0) await sleep(wait);
    }
    try {
      return await run();
    } finally {
      lastFinishedAt = Date.now();
    }
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
