import puppeteer from "puppeteer";

export type ReflectionOfTheDayData = {
  text: string;
};

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
    const reflectionText = await page.evaluate(() => {
      const reflectionDiv = document.querySelector(".tittleinterno");
      if (reflectionDiv) {
        let next = reflectionDiv.nextElementSibling;
        while (next && next.tagName !== "P") {
          next = next.nextElementSibling;
        }
        return next?.textContent || "";
      }
      return "";
    });

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
