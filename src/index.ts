import * as dotenv from "dotenv";
import cron from "node-cron";
import { getRandomAffiliates } from "./affiliate/getAffiliates.js";
import { checkIfNewsletterExists, saveInSupabase } from "./saveInSupabase.js";
import { scrapeLiturgiaWebsite } from "./scrapeLiturgiaWebsite.js";
import { scrapeReflectionOfTheDay } from "./scrapeReflectionOfTheDay.js";
import { scrapeSaintOfTheDay } from "./scrapeSaintOfTheDay.js";
import { scrapeVaticanNews } from "./scrapeVaticanNews.js";
import { sendEmail } from "./sendEmail.js";
dotenv.config();

const isProduction = process.env.IS_PRODUCTION === "true";
const isRunNow = process.env.RUN_NOW === "true";
const addDonate = process.env.ADD_DONATE === "true";

/**
 * Runs the daily newsletter workflow: scrapes all data and sends the email.
 */
async function runDailyNewsletter() {
  try {
    console.info("Starting daily newsletter workflow...");

    // Verifica se a liturgia do dia já foi criada
    const newsletterExists = await checkIfNewsletterExists();
    if (newsletterExists) {
      console.info(
        "Newsletter for today already exists. Skipping email sending and database insertion."
      );
      return;
    }

    const [
      liturgyData,
      saintOfTheDayData,
      reflection,
      randomAffiliates,
      vaticanNewsData,
    ] = await Promise.all([
      scrapeLiturgiaWebsite(),
      scrapeSaintOfTheDay(),
      scrapeReflectionOfTheDay(),
      getRandomAffiliates(),
      scrapeVaticanNews(),
    ]);

    await sendEmail(
      liturgyData,
      saintOfTheDayData,
      reflection,
      addDonate ? randomAffiliates : null,
      vaticanNewsData
    );

    await saveInSupabase(
      liturgyData,
      saintOfTheDayData,
      reflection,
      vaticanNewsData
    );

    console.info("Daily newsletter workflow completed.");
  } catch (error) {
    console.error("Error running daily newsletter:", error);
  }
}

// Schedule the task based on environment
console.log(
  `Starting Liturgia Newsletter Cron Job in ${
    isProduction ? "production" : "development"
  } mode...`
);

if (isProduction) {
  // Run every day at 9:00 AM server time
  cron.schedule("0 9 * * *", () => {
    console.log(
      "Running daily newsletter task at:",
      new Date().toLocaleString()
    );
    runDailyNewsletter();
  });

  if (isRunNow) {
    console.log("Running daily newsletter task immediately...");
    runDailyNewsletter();
  }
} else {
  // In development, run immediately
  runDailyNewsletter();
}
