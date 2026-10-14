import { getRandomAffiliates } from "./affiliate/getAffiliates.js";
import { isoDate, todayInSaoPaulo } from "./dates.js";
import { hasSendableLiturgy } from "./newsletterPlan.js";
import { getNewsletterByDate } from "./newsletterRepository.js";
import {
  claimNewsletterSend,
  markNewsletterFailed,
  markNewsletterSent,
  recordBroadcastId,
} from "./newsletterSendRepository.js";
import { sendEmail } from "./sendEmail.js";

/**
 * Sends today's liturgy exactly once. The date is America/Sao_Paulo.
 * Future `newsletter` rows are never loaded and never emailed.
 * The send claim is taken before Resend is called. Errors are recorded
 * and rethrown; they are not treated as a successful send.
 */
export async function sendDailyNewsletter(now = new Date()): Promise<void> {
  const today = todayInSaoPaulo(now);
  const liturgyDate = isoDate(today);
  const row = await getNewsletterByDate(today);
  if (!row || !hasSendableLiturgy(row)) {
    throw new Error(
      `No liturgy content for ${liturgyDate} (America/Sao_Paulo); email not sent.`
    );
  }

  const claimed = await claimNewsletterSend(liturgyDate);
  if (!claimed) {
    console.info(
      `Newsletter for ${liturgyDate} is already sent or in progress. Skipping.`
    );
    return;
  }

  let broadcastId: string | undefined;
  try {
    broadcastId = await sendEmail({
      date: today,
      liturgyData: row.liturgyData,
      saintOfTheDayData: row.saintOfTheDayData,
      reflection: row.reflection,
      vaticanNews: row.vaticanNewsData,
      affiliates:
        process.env.ADD_DONATE === "true" ? await getRandomAffiliates() : null,
      onBroadcastCreated: async (id) => {
        broadcastId = id;
        await recordBroadcastId(liturgyDate, id);
      },
    });
  } catch (error) {
    try {
      await markNewsletterFailed(liturgyDate, error);
    } catch (markError) {
      console.error("Failed to record newsletter send failure:", markError);
    }
    throw error;
  }

  try {
    await markNewsletterSent(liturgyDate, broadcastId);
  } catch (error) {
    console.error(
      `Broadcast ${broadcastId} for ${liturgyDate} was handed to Resend, but marking it sent failed. The claim stays in progress so it will not be sent again.`,
      error
    );
    throw error;
  }

  console.info(`Newsletter sent for ${liturgyDate}: ${broadcastId}`);
}
