import * as dotenv from "dotenv";
import { Resend } from "resend";
import { v4 as uuid } from "uuid";
import { Affiliate } from "./affiliate/getAffiliates.js";
import { LiturgiaData } from "./scrapeLiturgiaWebsite.js";
import { ReflectionOfTheDayData } from "./scrapeReflectionOfTheDay.js";
import { SaintOfTheDayData } from "./scrapeSaintOfTheDay.js";
import { FeedItem } from "./scrapeVaticanNews.js";
import DailyNewsletterTemplate from "./templates/daily-newsletter-template.js";
dotenv.config();

const isProduction = process.env.IS_PRODUCTION === "true";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  liturgyData: LiturgiaData | null,
  saintOfTheDayData: SaintOfTheDayData,
  reflection: ReflectionOfTheDayData,
  affiliates: Affiliate[] | null,
  vaticanNews: FeedItem[] | null
) {
  console.log("Sending email with liturgy data:", liturgyData);

  try {
    if (isProduction) {
      await sendEmailsWithBroadcast(
        liturgyData,
        saintOfTheDayData,
        reflection,
        affiliates,
        vaticanNews
      );
    } else {
      await sendEmailsWithContacts(
        liturgyData,
        saintOfTheDayData,
        reflection,
        affiliates,
        vaticanNews
      );
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function sendEmailsWithBroadcast(
  liturgyData: LiturgiaData | null,
  saintOfTheDayData: SaintOfTheDayData,
  reflection: ReflectionOfTheDayData,
  affiliates: Affiliate[] | null,
  vaticanNews: FeedItem[] | null
) {
  const { data, error } = await resend.broadcasts.create({
    name: getFormattedEmailTitle(),
    audienceId: "07d60c4b-2ccd-4335-ac87-4ad4efdb776e",
    from: "LiturgiaNews <newsletter@liturgianews.site>",
    subject: getFormattedEmailTitle(),
    react: createReactContent(
      liturgyData,
      saintOfTheDayData,
      reflection,
      affiliates,
      vaticanNews
    ),
  });

  if (error) {
    console.error("Error sending email with broadcast:", error);
  } else {
    console.log("Email sent with success with broadcast:", data);

    await resend.broadcasts.send(data.id);
  }
}

async function createReactContent(
  liturgyData: LiturgiaData | null,
  saintOfTheDayData: SaintOfTheDayData | null,
  reflection: ReflectionOfTheDayData,
  affiliates: Affiliate[] | null,
  vaticanNews: FeedItem[] | null
) {
  return DailyNewsletterTemplate({
    date: new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    title: liturgyData?.title ?? "Liturgia Católica Diária",
    readings: liturgyData?.liturgies ?? [],
    saint: {
      name: saintOfTheDayData?.name ?? "",
      image: saintOfTheDayData?.imageBase64 ?? "",
      resume: saintOfTheDayData?.resume ?? "",
      link: saintOfTheDayData?.link ?? "",
    },
    reflection: reflection.text,
    affiliates,
    vaticanNews,
  });
}

async function sendEmailsWithContacts(
  liturgyData: LiturgiaData | null,
  saintOfTheDayData: SaintOfTheDayData,
  reflection: ReflectionOfTheDayData,
  affiliates: Affiliate[],
  vaticanNews: FeedItem[] | null
) {
  const { data, error } = await resend.emails.send({
    to: process.env.EMAIL_DEV_TEST ?? "",
    from: "LiturgiaNews <newsletter@liturgianews.site>",
    subject: getFormattedEmailTitle(),
    headers: {
      "X-Entity-Ref-ID": uuid(),
    },
    react: createReactContent(
      liturgyData,
      saintOfTheDayData,
      reflection,
      affiliates,
      vaticanNews
    ),
  });

  if (error) {
    console.error("Error sending email with contacts:", error);
  } else {
    console.log("Email sent with success:", data);
  }
}

function getFormattedEmailTitle(): string {
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  return `Liturgia do Dia - ${formattedDate}`;
}
