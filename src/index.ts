import * as dotenv from "dotenv";
import cron from "node-cron";
import { SAO_PAULO_TZ } from "./dates.js";
import { publishLiturgyAhead } from "./publishLiturgy.js";
import { sendDailyNewsletter } from "./sendDailyNewsletter.js";

dotenv.config();

/** 05:30 America/Sao_Paulo, before the send, including the first 30-day backfill. */
const PUBLISH_CRON = "30 5 * * *";
/** 06:00 America/Sao_Paulo. Sends today's liturgy only. */
const SEND_CRON = "0 6 * * *";

async function main() {
  const isProduction = process.env.IS_PRODUCTION === "true";
  const isRunNow = process.env.RUN_NOW === "true";
  console.log(
    `Starting Liturgia Newsletter in ${
      isProduction ? "production" : "development"
    } mode (${SAO_PAULO_TZ}).`
  );

  if (!isProduction) {
    await publishLiturgyAhead();
    await sendDailyNewsletter();
    return;
  }

  const cronOptions = { timezone: SAO_PAULO_TZ };
  cron.schedule(
    PUBLISH_CRON,
    () => {
      void publishLiturgyAhead().catch((error) => {
        console.error("Publish job failed:", error);
      });
    },
    cronOptions
  );
  cron.schedule(
    SEND_CRON,
    () => {
      // sendDailyNewsletter throws after recording the failure. The catch
      // keeps this process scheduled for the next day; it does not mark the
      // email as sent.
      void sendDailyNewsletter().catch((error) => {
        console.error("Daily send failed:", error);
      });
    },
    cronOptions
  );
  console.log(
    `Publish scheduled at ${PUBLISH_CRON} and send at ${SEND_CRON} (${SAO_PAULO_TZ}).`
  );

  if (isRunNow) {
    await publishLiturgyAhead();
    await sendDailyNewsletter();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
