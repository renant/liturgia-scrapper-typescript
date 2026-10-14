import assert from "node:assert/strict";
import test from "node:test";
import {
  addDays,
  dateRange,
  daysBetween,
  formatEmailSubject,
  formatLongPtBr,
  isoDate,
  parseDaysAhead,
  parseScrapeDelayMs,
  slugFromDate,
  todayInSaoPaulo,
  uniqueYearMonths,
} from "./dates.js";

test("todayInSaoPaulo uses America/Sao_Paulo, not the server zone", () => {
  assert.deepEqual(todayInSaoPaulo(new Date("2026-10-15T02:30:00.000Z")), {
    year: 2026,
    month: 10,
    day: 14,
  });
  assert.deepEqual(todayInSaoPaulo(new Date("2026-10-15T03:00:00.000Z")), {
    year: 2026,
    month: 10,
    day: 15,
  });
});

test("addDays crosses month and year boundaries", () => {
  assert.deepEqual(addDays({ year: 2026, month: 10, day: 14 }, 18), {
    year: 2026,
    month: 11,
    day: 1,
  });
  assert.deepEqual(addDays({ year: 2026, month: 12, day: 20 }, 20), {
    year: 2027,
    month: 1,
    day: 9,
  });
});

test("date range is today through today plus N, in Sao Paulo slug form", () => {
  const today = { year: 2026, month: 10, day: 14 };
  const dates = dateRange(today, 30);
  assert.equal(dates.length, 31);
  assert.equal(isoDate(dates[0]), "2026-10-14");
  assert.equal(isoDate(dates[dates.length - 1]), "2026-11-13");
  assert.equal(daysBetween(dates[0], dates[dates.length - 1]), 30);
  assert.equal(slugFromDate({ year: 2026, month: 3, day: 1 }), "01-março-2026");
  assert.deepEqual(uniqueYearMonths(dates), [
    { year: 2026, month: 10 },
    { year: 2026, month: 11 },
  ]);
});

test("email subject and long date use the civil date", () => {
  const date = { year: 2026, month: 10, day: 5 };
  assert.equal(formatEmailSubject(date), "Liturgia do Dia - 05/10");
  const long = formatLongPtBr({ year: 2026, month: 10, day: 16 });
  assert.match(long, /16/);
  assert.match(long, /2026/);
  assert.match(long, /outubro/i);
});

test("DAYS_AHEAD and SCRAPE_DELAY_MS parse with defaults", () => {
  assert.equal(parseDaysAhead(undefined), 30);
  assert.equal(parseDaysAhead("0"), 0);
  assert.equal(parseDaysAhead(" 30 "), 30);
  assert.throws(() => parseDaysAhead("-1"));
  assert.throws(() => parseDaysAhead("31.5"));
  assert.throws(() => parseDaysAhead("371"));
  assert.equal(parseScrapeDelayMs(undefined), 1500);
  assert.equal(parseScrapeDelayMs("0"), 0);
  assert.throws(() => parseScrapeDelayMs("1s"));
});
