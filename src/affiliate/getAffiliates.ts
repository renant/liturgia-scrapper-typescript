import affiliatesData from "./affiliate.js";

export interface Affiliate {
  link: string;
  title: string;
  author: string | null;
}

/**
 * Returns a random selection of affiliates from the list.
 * @param count Number of affiliates to return (default: 2)
 */
export async function getRandomAffiliates(
  count: number = 2
): Promise<Affiliate[]> {
  try {
    if (!Array.isArray(affiliatesData)) {
      console.error("Affiliates data is not an array.");
      return [];
    }
    const affiliates: Affiliate[] = affiliatesData as Affiliate[];
    // Shuffle using Fisher-Yates for better randomness
    const shuffled = [...affiliates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, count);
    console.info(`Selected ${selected.length} random affiliates.`);
    return selected;
  } catch (error) {
    console.error("Error getting random affiliates:", error);
    return [];
  } finally {
    console.log("Getting random affiliates finished");
  }
}
