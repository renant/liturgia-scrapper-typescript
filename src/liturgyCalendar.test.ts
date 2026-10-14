import assert from "node:assert/strict";
import test from "node:test";
import { parseCalendarLinks } from "./liturgyCalendar.js";
import { extractLiturgyFromHtml } from "./scrapeLiturgiaWebsite.js";

const CALENDAR_HTML = `
<table id="wp-calendar">
  <tbody>
    <tr>
      <td id="">
        <a href="https://liturgia.cancaonova.com/liturgia/sexta-feira/?sDia=16&sMes=10&sAno=2026">
          16
        </a>
      </td>
      <td id="">17</td>
      <td>
        <a href="https://liturgia.cancaonova.com/pb/liturgia/wrong-day/?sDia=18&sMes=10&sAno=2026">
          19
        </a>
      </td>
    </tr>
  </tbody>
</table>
`;

function pageHtml(options: {
  day?: string;
  month?: string;
  year?: string;
  slug?: string;
  reading?: string;
}) {
  const slug = options.slug ?? "sexta-feira";
  return `
    <link rel="canonical" href="https://liturgia.cancaonova.com/pb/liturgia/${slug}/" />
    <span id="dia-calendar">${options.day ?? "16"}</span>
    <span id="mes-calendar">${options.month ?? "Out"}</span>
    <span id="ano-calendar">${options.year ?? "2026"}</span>
    <h1 class="entry-title">Sexta-feira</h1>
    <div id="liturgia-1">
      <p>${options.reading ?? "Leitura"}</p>
      <div class="embeds-audio">audio-secret</div>
    </div>
  `;
}

const requested = {
  date: { year: 2026, month: 10, day: 16 },
  slug: "sexta-feira",
};

test("calendar parser keeps linked days and skips unpublished or inconsistent ones", () => {
  const links = parseCalendarLinks(CALENDAR_HTML);
  assert.equal(links.length, 1);
  assert.equal(links[0].slug, "sexta-feira");
  assert.deepEqual(links[0].date, { year: 2026, month: 10, day: 16 });
  assert.match(links[0].href, /sDia=16/);
});

test("a month with no anchors yields no links", () => {
  const html = `<table id="wp-calendar"><tbody><tr><td>1</td><td>2</td></tr></tbody></table>`;
  assert.deepEqual(parseCalendarLinks(html), []);
});

test("extracts liturgy when the badge and canonical slug match the request", () => {
  const liturgy = extractLiturgyFromHtml(pageHtml({}), requested);
  assert.ok(liturgy);
  assert.equal(liturgy?.title, "Sexta-feira");
  assert.equal(liturgy?.liturgies.length, 1);
  assert.doesNotMatch(liturgy?.liturgies[0] ?? "", /audio-secret/);
  assert.match(liturgy?.liturgies[0] ?? "", /Leitura/);
});

test("skips a page whose displayed date or canonical slug does not match", () => {
  assert.equal(
    extractLiturgyFromHtml(pageHtml({ day: "14", month: "Out" }), requested),
    null
  );
  assert.equal(
    extractLiturgyFromHtml(pageHtml({ month: "Nov" }), requested),
    null
  );
  assert.equal(
    extractLiturgyFromHtml(pageHtml({ slug: "outro-dia" }), requested),
    null
  );
  assert.equal(
    extractLiturgyFromHtml(
      pageHtml({}).replace('rel="canonical"', 'rel="other"'),
      requested
    ),
    null
  );
});
