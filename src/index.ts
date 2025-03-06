import * as dotenv from "dotenv";
import cron from "node-cron";
import OpenAI from "openai";
import { scrapeLiturgiaWebsite } from "./scrapeLiturgiaWebsite.js";
import { scrapeReflectionOfTheDay } from "./scrapeReflectionOfTheDay.js";
import { scrapeSaintOfTheDay } from "./scrapeSaintOfTheDay.js";
import { sendEmail } from "./sendEmail.js";
dotenv.config();

const isProduction = process.env.IS_PRODUCTION === "true";
const isRunNow = process.env.RUN_NOW === "true";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function runDailyNewsletter() {
  try {
    const [liturgyData, saintOfTheDayData, reflection] = await Promise.all([
      scrapeLiturgiaWebsite(),
      scrapeSaintOfTheDay(),
      scrapeReflectionOfTheDay(),
    ]);

    console.log("Liturgia do Dia:", liturgyData);
    console.log("Santo do Dia:", saintOfTheDayData.resume);
    console.log("Reflexão do Dia:", reflection);

    await sendEmail(liturgyData, saintOfTheDayData, reflection);
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
  runDailyNewsletter();
}
