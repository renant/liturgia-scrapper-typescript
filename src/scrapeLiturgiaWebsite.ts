import axios from "axios";
import * as cheerio from "cheerio";

export type LiturgiaData = {
  title: string;
  liturgies: string[];
};

/**
 * Scrapes the daily liturgy from Canção Nova's website.
 * Returns null if scraping fails or the structure changes.
 */
export async function scrapeLiturgiaWebsite(): Promise<LiturgiaData | null> {
  try {
    const response = await axios.get("https://liturgia.cancaonova.com/pb");
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract the main title
    const entryTitle = $(".entry-title").html() ?? "";
    const liturgies: string[] = [];

    // Try to extract up to 4 liturgy sections
    for (let i = 1; i <= 4; i++) {
      const liturgyDiv = $(`#liturgia-${i}`);
      if (liturgyDiv.length === 0) continue;
      liturgyDiv.find(".embeds-audio").remove();
      const liturgy = liturgyDiv.html();
      if (liturgy) {
        liturgies.push(liturgy);
      }
    }

    if (!entryTitle && liturgies.length === 0) {
      console.warn(
        "No liturgy data found on the page. Structure may have changed."
      );
      return null;
    }

    const liturgiaData = {
      title: entryTitle,
      liturgies,
    };

    console.info("Liturgy data scraped successfully.");
    return liturgiaData as LiturgiaData;
  } catch (error) {
    console.error("Error scraping liturgy website:", error);
    return null;
  } finally {
    console.log("Scraping liturgy website finished");
  }
}
