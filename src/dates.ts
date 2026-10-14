export const SAO_PAULO_TZ = "America/Sao_Paulo";

/** Calendar date. `month` is 1–12. */
export type CivilDate = {
  year: number;
  month: number;
  day: number;
};

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function todayInSaoPaulo(now = new Date()): CivilDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SAO_PAULO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) => {
    const value = parts.find((part) => part.type === type)?.value;
    if (!value) {
      throw new Error(`Missing ${type} while formatting America/Sao_Paulo date`);
    }
    return Number(value);
  };
  return { year: read("year"), month: read("month"), day: read("day") };
}

export function addDays(date: CivilDate, days: number): CivilDate {
  const utc = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function daysBetween(from: CivilDate, to: CivilDate): number {
  const start = Date.UTC(from.year, from.month - 1, from.day);
  const end = Date.UTC(to.year, to.month - 1, to.day);
  return Math.round((end - start) / 86_400_000);
}

export function civilEqual(a: CivilDate, b: CivilDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

/** Inclusive range from `start` through `start + daysAhead`. */
export function dateRange(start: CivilDate, daysAhead: number): CivilDate[] {
  const dates: CivilDate[] = [];
  for (let offset = 0; offset <= daysAhead; offset++) {
    dates.push(addDays(start, offset));
  }
  return dates;
}

export function uniqueYearMonths(
  dates: CivilDate[]
): Array<{ year: number; month: number }> {
  const seen = new Set<string>();
  const months: Array<{ year: number; month: number }> = [];
  for (const date of dates) {
    const key = `${date.year}-${date.month}`;
    if (seen.has(key)) continue;
    seen.add(key);
    months.push({ year: date.year, month: date.month });
  }
  return months;
}

export function isoDate(date: CivilDate): string {
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${date.year}-${month}-${day}`;
}

/** Slug stored on `newsletter.slug`, for example `14-outubro-2026`. */
export function slugFromDate(date: CivilDate): string {
  const day = String(date.day).padStart(2, "0");
  const month = MONTHS_PT[date.month - 1];
  if (!month) {
    throw new Error(`Invalid month ${date.month}`);
  }
  return `${day}-${month}-${date.year}`;
}

export function formatEmailSubject(date: CivilDate): string {
  const day = String(date.day).padStart(2, "0");
  const month = String(date.month).padStart(2, "0");
  return `Liturgia do Dia - ${day}/${month}`;
}

export function formatLongPtBr(date: CivilDate): string {
  const utc = new Date(Date.UTC(date.year, date.month - 1, date.day, 15));
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: SAO_PAULO_TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(utc);
}

export function parseDaysAhead(value: string | undefined): number {
  if (value == null || value.trim() === "") return 30;
  if (!/^\d+$/.test(value.trim())) {
    throw new Error(
      `DAYS_AHEAD must be an integer from 0 to 370, got ${value}`
    );
  }
  const days = Number(value.trim());
  if (days > 370) {
    throw new Error(
      `DAYS_AHEAD must be an integer from 0 to 370, got ${value}`
    );
  }
  return days;
}

export function parseScrapeDelayMs(value: string | undefined): number {
  if (value == null || value.trim() === "") return 1500;
  if (!/^\d+$/.test(value.trim())) {
    throw new Error(
      `SCRAPE_DELAY_MS must be a non-negative integer, got ${value}`
    );
  }
  return Number(value.trim());
}
