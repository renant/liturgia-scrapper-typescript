import assert from "node:assert/strict";
import test from "node:test";
import {
  hasSendableLiturgy,
  planNewsletterWrite,
  shouldScrapeDate,
  wasSendClaimed,
} from "./newsletterPlan.js";

const liturgy = { title: "Quarta", liturgies: ["<p>leitura</p>"] };
const changed = { title: "Quarta", liturgies: ["<p>corrigida</p>"] };

test("near days are re-scraped and farther stored days are not", () => {
  assert.equal(shouldScrapeDate(0, true), true);
  assert.equal(shouldScrapeDate(3, true), true);
  assert.equal(shouldScrapeDate(4, true), false);
  assert.equal(shouldScrapeDate(4, false), true);
  assert.equal(shouldScrapeDate(30, false), true);
  assert.equal(shouldScrapeDate(-1, false), false);
});

test("new dates insert, unchanged dates skip, changed content updates", () => {
  assert.equal(planNewsletterWrite(null, { liturgyData: liturgy }), "insert");
  assert.equal(
    planNewsletterWrite({ liturgyData: liturgy }, { liturgyData: liturgy }),
    "skip"
  );
  assert.equal(
    planNewsletterWrite(
      { liturgyData: { liturgies: liturgy.liturgies, title: liturgy.title } },
      { liturgyData: liturgy }
    ),
    "skip"
  );
  assert.equal(
    planNewsletterWrite({ liturgyData: liturgy }, { liturgyData: changed }),
    "update"
  );
});

test("omitted extras do not count as a content change", () => {
  const existing = {
    liturgyData: liturgy,
    reflection: { text: "já salva" },
    vaticanNewsData: [{ title: "noticia", link: "https://example", pubDate: "x" }],
  };
  assert.equal(
    planNewsletterWrite(existing, { liturgyData: liturgy }),
    "skip"
  );
  assert.equal(
    planNewsletterWrite(existing, {
      liturgyData: liturgy,
      reflection: { text: "nova" },
    }),
    "update"
  );
  assert.equal(
    planNewsletterWrite(existing, {
      liturgyData: liturgy,
      vaticanNewsData: [],
    }),
    "update"
  );
});

test("email requires liturgy readings and ignores future claim shapes", () => {
  assert.equal(hasSendableLiturgy(null), false);
  assert.equal(hasSendableLiturgy({ liturgyData: { liturgies: [] } }), false);
  assert.equal(
    hasSendableLiturgy({ liturgyData: { liturgies: ["<p>ok</p>"] } }),
    true
  );
  assert.equal(wasSendClaimed(null), false);
  assert.equal(wasSendClaimed([]), false);
  assert.equal(wasSendClaimed([{ liturgy_date: "2026-10-14" }]), true);
  assert.equal(wasSendClaimed({ liturgy_date: "2026-10-14" }), true);
});
