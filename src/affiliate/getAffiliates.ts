import affiliatesData from "./affiliate.js";

export interface Affiliate {
  link: string;
  title: string;
  author: string | null;
}

export async function getRandomAffiliates(
  count: number = 2
): Promise<Affiliate[]> {
  try {
    const affiliates: Affiliate[] = affiliatesData as Affiliate[];

    const shuffled = [...affiliates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    return selected;
  } catch (error) {
    console.error("Error getting random affiliates:", error);
    return [];
  } finally {
    console.log("Getting random affiliates finished");
  }
}
