import * as dotenv from "dotenv";
import cron from "node-cron";
import OpenAI from "openai";
import { scrapeLiturgiaWebsite } from "./scrapeLiturgiaWebsite.js";
import { scrapeSaintOfTheDay } from "./scrapeSaintOfTheDay.js";
import { sendEmail } from "./sendEmail.js";
dotenv.config();

const isProduction = process.env.IS_PRODUCTION === "true";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function runDailyNewsletter() {
  try {
    const [liturgyData, saintOfTheDayData] = await Promise.all([
      scrapeLiturgiaWebsite(),
      scrapeSaintOfTheDay(),
    ]);

    console.log("Liturgia do Dia:", liturgyData);
    console.log("Santo do Dia:", saintOfTheDayData);

    await sendEmail(liturgyData, saintOfTheDayData);
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
} else {
  runDailyNewsletter();
}
