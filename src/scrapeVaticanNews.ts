import axios from "axios";
import { parseStringPromise } from "xml2js";

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  formattedPubDate?: string;
  description?: string;
}

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

async function parseRssFeed(xml: string): Promise<any> {
  try {
    const result = await parseStringPromise(xml);
    return result;
  } catch (error) {
    console.error("Error parsing the RSS feed:", error);
    throw new Error("Failed to parse RSS feed");
  }
}

async function extractFeedItems(parsedData: any): Promise<FeedItem[]> {
  const items = parsedData.rss.channel[0].item.map((item: any) => ({
    title: item.title[0].replace(/\n/g, "").trim(),
    link: item.link[0].replace(/\n/g, "").trim(),
    pubDate: item.pubDate[0].replace(/\n/g, "").trim(),
    description: item.description?.[0]?.replace(/\n/g, "").trim(),
  }));

  return items;
}

export async function scrapeVaticanNews(): Promise<FeedItem[]> {
  try {
    const xml = await fetchRssFeed();
    const parsedData = await parseRssFeed(xml);
    const feedItems = await extractFeedItems(parsedData);

    const topItems = feedItems
      .map((item) => ({
        ...item,
        formattedPubDate: new Date(item.pubDate).toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      }))
      .sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
      .slice(0, 6);

    return topItems;

    return feedItems;
  } catch (error) {
    console.error("Error in scrapeVaticanNews:", error);
    throw new Error("Failed to scrape Vatican News");
  }
}
