import puppeteer from "puppeteer";

export type SaintOfTheDayData = {
  name: string;
  imageBase64: string;
  resume: string;
  link: string;
};

export async function scrapeSaintOfTheDay(): Promise<SaintOfTheDayData | null> {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    });

    const page = await browser.newPage();
    await page.goto("https://catolicoapp.com/santo-do-dia/", {
      waitUntil: "networkidle0",
    });

    const name = await page.$eval(
      ".elementor-post__title",
      (el) => el.textContent
    );

    const imageUrl = await page.$eval(
      ".elementor-post__thumbnail__link img",
      (el) => el.getAttribute("src")
    );

    const axios = (await import("axios")).default;
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64Image = Buffer.from(response.data, "binary").toString("base64");

    const resume = await page.$eval(
      ".elementor-post__excerpt",
      (el) => el.innerHTML
    );

    const link = await page.$eval(".elementor-post__read-more", (el) =>
      el.getAttribute("href")
    );

    await browser.close();

    return {
      name: name?.trim() || "",
      imageBase64: `data:image/jpeg;base64,${base64Image}`,
      resume: resume?.trim() || "",
      link: link || "",
    };
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    console.log("Scraping saint of the day done");
  }
}
