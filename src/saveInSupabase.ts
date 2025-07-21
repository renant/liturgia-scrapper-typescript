import { createClient } from "@supabase/supabase-js";
import { LiturgiaData } from "./scrapeLiturgiaWebsite.js";
import { ReflectionOfTheDayData } from "./scrapeReflectionOfTheDay.js";
import { SaintOfTheDayData } from "./scrapeSaintOfTheDay.js";
import { FeedItem } from "./scrapeVaticanNews.js";

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function getSlugFromDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = MONTHS_PT[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export async function saveInSubabase(
  liturgyData: LiturgiaData,
  saintOfTheDayData: SaintOfTheDayData,
  reflection: ReflectionOfTheDayData,
  vaticanNewsData: FeedItem[]
) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const slug = getSlugFromDate(new Date().toISOString());

  const { data, error } = await supabase.from("newsletter").insert({
    liturgyData,
    saintOfTheDayData,
    reflection,
    vaticanNewsData,
    slug,
  });

  if (error) {
    console.error("Error saving newsletter data:", error);
  } else {
    console.log("Newsletter data saved successfully:", data);
  }
}
