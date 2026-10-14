import * as dotenv from "dotenv";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { v4 as uuid } from "uuid";
import { Affiliate } from "./affiliate/getAffiliates.js";
import { CivilDate, formatEmailSubject, formatLongPtBr } from "./dates.js";
import { LiturgiaData } from "./scrapeLiturgiaWebsite.js";
import { ReflectionOfTheDayData } from "./scrapeReflectionOfTheDay.js";
import { SaintOfTheDayData } from "./scrapeSaintOfTheDay.js";
import { FeedItem } from "./scrapeVaticanNews.js";
import DailyNewsletterTemplate from "./templates/daily-newsletter-template.js";

const AUDIENCE_ID = "07d60c4b-2ccd-4335-ac87-4ad4efdb776e";

export type SendEmailInput = {
  date: CivilDate;
  liturgyData: LiturgiaData | null;
  saintOfTheDayData: SaintOfTheDayData | null;
  reflection: ReflectionOfTheDayData | null;
  vaticanNews: FeedItem[] | null;
  affiliates: Affiliate[] | null;
  /** Production only: called after the broadcast exists and before it is sent. */
  onBroadcastCreated?: (broadcastId: string) => Promise<void>;
};

/**
 * Sends the daily newsletter. Returns the Resend broadcast id in production
 * and the email id in development. Throws when Resend returns an error.
 */
export async function sendEmail(input: SendEmailInput): Promise<string> {
  if (process.env.IS_PRODUCTION === "true") {
    return sendBroadcast(input);
  }
  return sendDevEmail(input);
}

async function sendBroadcast(input: SendEmailInput): Promise<string> {
  const resend = getResend();
  const subject = formatEmailSubject(input.date);
  const created = await resend.broadcasts.create({
    name: subject,
    audienceId: AUDIENCE_ID,
    from: "LiturgiaNews <newsletter@liturgianews.site>",
    subject,
    react: (await reactContent(input)) as ReactElement,
  });
  if (created.error || !created.data?.id) {
    throw new Error(
      created.error?.message ?? "Resend did not return a broadcast id"
    );
  }

  if (input.onBroadcastCreated) {
    try {
      await input.onBroadcastCreated(created.data.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Broadcast ${created.data.id} was created but not recorded: ${message}`
      );
    }
  }

  const sent = await resend.broadcasts.send(created.data.id);
  if (sent.error) {
    throw new Error(sent.error.message ?? "Resend broadcast send failed");
  }
  return created.data.id;
}

async function sendDevEmail(input: SendEmailInput): Promise<string> {
  const toEmail = process.env.EMAIL_DEV_TEST ?? "";
  if (!toEmail) {
    throw new Error("EMAIL_DEV_TEST is not set in environment variables.");
  }
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    to: toEmail,
    from: "LiturgiaNews <newsletter@liturgianews.site>",
    subject: formatEmailSubject(input.date),
    headers: {
      "X-Entity-Ref-ID": uuid(),
    },
    react: (await reactContent(input)) as ReactElement,
  });
  if (error || !data?.id) {
    throw new Error(error?.message ?? "Resend did not return an email id");
  }
  return data.id;
}

async function reactContent(input: SendEmailInput) {
  return DailyNewsletterTemplate({
    date: formatLongPtBr(input.date),
    title: input.liturgyData?.title ?? "Liturgia Católica Diária",
    readings: input.liturgyData?.liturgies ?? [],
    saint: {
      name: input.saintOfTheDayData?.name ?? "",
      image: input.saintOfTheDayData?.imageBase64 ?? "",
      resume: input.saintOfTheDayData?.resume ?? "",
      link: input.saintOfTheDayData?.link ?? "",
    },
    reflection: input.reflection?.text ?? undefined,
    affiliates: input.affiliates,
    vaticanNews: input.vaticanNews,
  });
}

function getResend(): Resend {
  dotenv.config();
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return new Resend(apiKey);
}
