import * as dotenv from "dotenv";
import { Resend } from "resend";
import { v4 as uuid } from "uuid";
import { LiturgiaData } from "./scrapeLiturgiaWebsite.js";
import { SaintOfTheDayData } from "./scrapeSaintOfTheDay.js";
import DailyNewsletterTemplate from "./templates/daily-newsletter-template.js";
dotenv.config();

const isProduction = process.env.IS_PRODUCTION === "true";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  liturgyData: LiturgiaData | null,
  saintOfTheDayData: SaintOfTheDayData
) {
  console.log("Sending email with liturgy data:", liturgyData);

  try {
    if (isProduction) {
      await sendEmailsWithBroadcast(liturgyData, saintOfTheDayData);
    } else {
      await sendEmailsWithContacts(liturgyData, saintOfTheDayData);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function sendEmailsWithBroadcast(
  liturgyData: LiturgiaData | null,
  saintOfTheDayData: SaintOfTheDayData
) {
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}/${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  const { data, error } = await resend.broadcasts.create({
    name: `Liturgia do Dia - ${formattedDate}`,
    audienceId: "07d60c4b-2ccd-4335-ac87-4ad4efdb776e",
    from: "Liturgia do Dia <newsletter@liturgianews.site>",
    subject: "Liturgia do Dia",
    react: createReactContent(liturgyData, saintOfTheDayData),
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
  saintOfTheDayData: SaintOfTheDayData
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
      name: saintOfTheDayData.name,
      image: saintOfTheDayData.imageBase64,
      resume: saintOfTheDayData.resume,
      link: saintOfTheDayData.link,
    },
  });
}

async function sendEmailsWithContacts(
  liturgyData: LiturgiaData | null,
  saintOfTheDayData: SaintOfTheDayData
) {
  const { data, error } = await resend.emails.send({
    from: "Liturgia do Dia <newsletter@liturgianews.site>",
    to: "renan_replay@live.com",
    subject: "Liturgia do Dia",
    headers: {
      "X-Entity-Ref-ID": uuid(),
    },
    react: createReactContent(liturgyData, saintOfTheDayData),
  });

  if (error) {
    console.error("Error sending email with contacts:", error);
  } else {
    console.log("Email sent with success:", data);
  }
}
