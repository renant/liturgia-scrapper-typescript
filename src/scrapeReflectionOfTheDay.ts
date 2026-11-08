import puppeteer from "puppeteer";
import { load } from "cheerio";

export type ReflectionOfTheDayData = {
  text: string;
};

export function extractReflectionText(html: string): string {
  const $ = load(html);
  const heading = $(".tittleinterno, .subtitulo-liturgia")
    .filter((_, element) => /^Reflexão\s*:?$/i.test($(element).text().trim()))
    .first();
  const paragraphs: string[] = [];

  // Reflection paragraphs are siblings of the heading; stop before other sections.
  let next = heading.next();
  while (next.length && next.is("p, br")) {
    if (next.is("p")) {
      const text = next.text().replace(/\s+/g, " ").trim();
      if (text && !/^Pistas? para reflex[aã]o\s*:?$/i.test(text)) {
        paragraphs.push(text);
      }
    }
    next = next.next();
  }

  return paragraphs.join("\n\n");
}

/**
 * Scrapes the reflection of the day from the Paulus website.
 * Returns null if scraping fails or the structure changes.
 */
export async function scrapeReflectionOfTheDay(): Promise<ReflectionOfTheDayData | null> {
  let browser: puppeteer.Browser | null = null;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });

    const page = await browser.newPage();
    await page.goto("https://www.paulus.com.br/portal/liturgia-diaria/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Extract the reflection text from the page
    const reflectionText = extractReflectionText(await page.content());

    if (!reflectionText) {
      console.warn("No reflection text found on the Paulus website.");
      return null;
    }

    console.info("Reflection text scraped successfully.");
    return {
      text: (reflectionText || "").trim(),
    };
  } catch (error) {
    console.error("Error scraping reflection of the day:", error);
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
        console.info("Puppeteer browser closed after scraping reflection.");
      } catch (closeErr) {
        console.warn("Failed to close Puppeteer browser:", closeErr);
      }
    }
    console.log("Scraping reflection of the day done");
  }
}
