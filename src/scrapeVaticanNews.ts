import axios from "axios";
import { parseStringPromise } from "xml2js";

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  formattedPubDate?: string;
  description?: string;
}

/**
 * Fetches the Vatican News RSS feed as XML text.
 */
async function fetchRssFeed() {
  try {
    const response = await axios.get("https://www.vaticannews.va/pt.rss.xml", {
      responseType: "text",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching the RSS feed:", error);
    throw new Error("Failed to fetch RSS feed");
  }
}

/**
 * Parses the RSS XML string into a JS object.
 */
async function parseRssFeed(xml: string): Promise<any> {
  try {
    const result = await parseStringPromise(xml);
    return result;
  } catch (error) {
    console.error("Error parsing the RSS feed:", error);
    throw new Error("Failed to parse RSS feed");
  }
}

/**
 * Extracts feed items from the parsed RSS data.
 */
async function extractFeedItems(parsedData: any): Promise<FeedItem[]> {
  if (!parsedData?.rss?.channel?.[0]?.item) {
    console.warn("No items found in parsed RSS data.");
    return [];
  }
  const items = parsedData.rss.channel[0].item.map((item: any) => ({
    title: item.title?.[0]?.replace(/\n/g, "").trim() ?? "",
    link: item.link?.[0]?.replace(/\n/g, "").trim() ?? "",
    pubDate: item.pubDate?.[0]?.replace(/\n/g, "").trim() ?? "",
    description: item.description?.[0]?.replace(/\n/g, "").trim() ?? "",
  }));
  return items;
}

/**
 * Scrapes the latest Vatican News items from the RSS feed.
 * Returns up to 6 most recent items, sorted by date.
 */
export async function scrapeVaticanNews(): Promise<FeedItem[]> {
  try {
    const xml = await fetchRssFeed();
    const parsedData = await parseRssFeed(xml);
    const feedItems = await extractFeedItems(parsedData);

    const topItems = feedItems
      .map((item) => ({
        ...item,
        formattedPubDate: item.pubDate
          ? new Date(item.pubDate).toLocaleDateString("pt-BR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
      }))
      .sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
      .slice(0, 6);

    console.info(`Scraped ${topItems.length} Vatican News items.`);
    return topItems;
  } catch (error) {
    console.error("Error in scrapeVaticanNews:", error);
    return [];
  }
}
