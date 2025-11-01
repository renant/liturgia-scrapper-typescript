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

/**
 * Checks if a newsletter for today's date already exists in Supabase.
 * Returns true if it exists, false otherwise.
 */
export async function checkIfNewsletterExists(): Promise<boolean> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables"
    );
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const slug = getSlugFromDate(new Date().toISOString());

  const { data, error } = await supabase
    .from("newsletter")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error checking if newsletter exists:", error);
    // Em caso de erro, retornamos false para não bloquear o processo
    return false;
  }

  return data !== null;
}

export async function saveInSupabase(
  liturgyData: LiturgiaData,
  saintOfTheDayData: SaintOfTheDayData,
  reflection: ReflectionOfTheDayData,
  vaticanNewsData: FeedItem[]
) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables"
    );
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
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
