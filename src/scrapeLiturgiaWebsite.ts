import axios from "axios";
import * as cheerio from "cheerio";

export type LiturgiaData = {
  title: string;
  liturgies: string[];
};

export async function scrapeLiturgiaWebsite(): Promise<LiturgiaData | null> {
  try {
    const response = await axios.get("https://liturgia.cancaonova.com/pb");
    const html = response.data;
    const $ = cheerio.load(html);

    const entryTitle = $(".entry-title").html();

    const liturgies: string[] = [];

    for (let i = 1; i <= 4; i++) {
      const liturgyDiv = $(`#liturgia-${i}`);

      if (liturgyDiv.length === 0) continue;

      liturgyDiv.find(".embeds-audio").remove();

      const liturgy = liturgyDiv.html();

      if (liturgy) {
        liturgies.push(liturgy);
      }
    }

    const liturgiaData = {
      title: entryTitle ?? "",
      liturgies,
    };

    return liturgiaData as LiturgiaData;
  } catch (error) {
    console.error(error);
    return null;
  } finally {
    console.log("Scraping done");
  }
}
