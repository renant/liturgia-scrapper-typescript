import puppeteer from "puppeteer";

export type ReflectionOfTheDayData = {
  text: string;
};

export async function scrapeReflectionOfTheDay(): Promise<ReflectionOfTheDayData | null> {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    });

    const page = await browser.newPage();
    await page.goto("https://www.paulus.com.br/portal/liturgia-diaria/", {
      waitUntil: "networkidle0",
    });

    const reflectionText = await page.evaluate(() => {
      const reflectionDiv = Array.from(
        document.querySelectorAll(".tittleinterno")
      ).find((el) => el.textContent?.trim() === "Reflexão:");

      if (reflectionDiv) {
        const nextParagraph =
          reflectionDiv.nextElementSibling?.nextElementSibling;
        return nextParagraph?.textContent || "";
      }
      return "";
    });

    await browser.close();

    return {
      text: reflectionText.trim(),
    };
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    console.log("Scraping reflection of the day done");
  }
}
