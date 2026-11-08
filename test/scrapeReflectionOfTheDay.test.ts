import assert from "node:assert/strict";
import { test } from "node:test";
import { extractReflectionText } from "../src/scrapeReflectionOfTheDay.js";

test("extracts the reflection after the Sunday subtitle", () => {
  const html = `
    <div class="tittleinterno">Reflexão:</div><br />
    <p><strong>Pistas para reflexão</strong></p>
    <p style="text-align: justify;">A sabedoria concede à pessoa conhecer o segredo da arte de viver.</p>
    liturgia Diária Paulus - Reflexão do dia 08/11/2026<br /><br />
    <div class="redes-sociais"><p>Compartilhar</p></div>
    <p>Rodapé</p>`;

  assert.equal(extractReflectionText(html), "A sabedoria concede à pessoa conhecer o segredo da arte de viver.");
});

test("keeps the weekday reflection without a subtitle", () => {
  assert.equal(extractReflectionText(`
    <div class="tittleinterno">Reflexão:</div><br />
    <p>Ao se aproximar a festa da Páscoa dos judeus, Jesus sobe a Jerusalém.</p>
    (Dia a dia com o Evangelho 2026)<br /><br />
    <div class="redes-sociais"></div>`),
    "Ao se aproximar a festa da Páscoa dos judeus, Jesus sobe a Jerusalém.");
});

test("finds the reflection on individual pages and collects all paragraphs", () => {
  assert.equal(extractReflectionText(`
    <div class="subtitulo-liturgia">Evangelho:</div><p>Evangelho</p>
    <div class="subtitulo-liturgia">Reflexão:</div><br />
    <p>Primeiro <em>parágrafo</em>.</p><br /><p>Segundo parágrafo.</p>
    <div class="redes-sociais"></div><p>Rodapé</p>`),
    "Primeiro parágrafo.\n\nSegundo parágrafo.");
});

test("does not return a subtitle or unrelated content when the reflection is missing", () => {
  assert.equal(extractReflectionText(`<div class="tittleinterno">Reflexão:</div>
    <p><strong>Pistas para reflexão</strong></p>
    <div class="redes-sociais"></div><p>Rodapé</p>`), "");
  assert.equal(extractReflectionText(`<div class="tittleinterno">Outro título</div><p>Outro texto</p>`), "");
  assert.equal(extractReflectionText(""), "");
});

test("stops before the next liturgical section", () => {
  assert.equal(extractReflectionText(`
    <div class="tittleinterno">Reflexão:</div><p>Texto da reflexão.</p>
    <div class="subtitulo-liturgia">Outra seção</div><p>Outro texto</p>`), "Texto da reflexão.");
});
