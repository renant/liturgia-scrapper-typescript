import axios, { type AxiosRequestConfig } from "axios";
import * as cheerio from "cheerio";
import { CivilDate, civilEqual } from "./dates.js";
import { liturgySlug, readDisplayedLiturgyDate } from "./liturgyCalendar.js";

export type LiturgiaData = {
  title: string;
  liturgies: string[];
};

const REQUEST_HEADERS = {
  "User-Agent": "LiturgiaNewsBot/1.0 (+https://www.liturgianews.site)",
  Accept: "text/html,application/xhtml+xml",
};

export async function fetchText(
  url: string,
  config?: AxiosRequestConfig
): Promise<string> {
  const response = await axios.request({
    url,
    timeout: 30_000,
    responseType: "text",
    ...config,
    headers: {
      ...REQUEST_HEADERS,
      ...config?.headers,
    },
  });
  return typeof response.data === "string" ? response.data : "";
}

/**
 * Returns the liturgy only when the page badge matches `date` and the
 * canonical slug matches the calendar link. Query params alone are not
 * trusted: the badge echoes them, so a redirected or substituted page
 * (different slug, or today's badge) is skipped.
 */
export function extractLiturgyFromHtml(
  html: string,
  requested: { date: CivilDate; slug: string }
): LiturgiaData | null {
  const $ = cheerio.load(html);
  const displayed = readDisplayedLiturgyDate(html);
  if (!displayed || !civilEqual(displayed, requested.date)) return null;

  const canonical = $('link[rel="canonical"]').attr("href") ?? "";
  const slug = liturgySlug(canonical);
  if (!slug || slug !== requested.slug.toLowerCase()) return null;

  const entryTitle = $(".entry-title").html() ?? "";
  const liturgies: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const liturgyDiv = $(`#liturgia-${i}`);
    if (liturgyDiv.length === 0) continue;
    liturgyDiv.find(".embeds-audio").remove();
    const liturgy = liturgyDiv.html();
    if (liturgy) liturgies.push(liturgy);
  }

  if (!entryTitle && liturgies.length === 0) return null;
  return { title: entryTitle, liturgies };
}
