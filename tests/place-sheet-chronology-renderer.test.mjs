import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

test("Place Sheet mounts source-owned chronology without replacing history layers or borrowing another place", async () => {
  const built = await build({entryPoints:["js/ui/place-sheet/sections/chronology.ts"],bundle:true,format:"iife",globalName:"Chronology",write:false});
  const dom = new JSDOM('<section id="history" hidden><section data-hg-place-sheet-owner="history">Existing layer</section></section>', {runScripts:"outside-only"});
  const w = dom.window;
  const real = JSON.parse(fs.readFileSync("data/runtime/place-open/aftenposten_akersgata.json", "utf8"));
  w.LEKSIKON_BY_PLACE = {aftenposten_akersgata: real.leksikon};
  w.eval(built.outputFiles[0].text);
  const slot = w.document.getElementById("history");
  const rendered = w.Chronology.mountCanonicalChronology(slot, real.place);
  assert.ok(rendered);
  assert.equal(slot.hidden, false);
  assert.equal(slot.querySelector('[data-hg-place-sheet-owner="history"]').textContent, "Existing layer");
  assert.equal(rendered.querySelectorAll(".hg-place-timeline-item").length, 8);
  assert.match(rendered.textContent, /1964/);
  assert.doesNotMatch(rendered.textContent, /2014/);
  assert.ok([...rendered.querySelectorAll("a")].every(a => a.href.startsWith("https://")));
  w.Chronology.mountCanonicalChronology(slot, real.place);
  assert.equal(slot.querySelectorAll('[data-hg-place-sheet-owner="chronology"]').length, 1);
  assert.equal(w.Chronology.mountCanonicalChronology(slot, {id:"another_place"}), null);
  assert.equal(slot.querySelector('[data-hg-place-sheet-owner="chronology"]'), null);
  assert.equal(slot.querySelector('[data-hg-place-sheet-owner="history"]').textContent, "Existing layer");
  dom.window.close();
});

test("Grini chronology preserves dated titles, source descriptions and the unresolved opening-date conflict", async () => {
  const built = await build({entryPoints:["js/ui/place-sheet/sections/chronology.ts"],bundle:true,format:"iife",globalName:"Chronology",write:false});
  const dom = new JSDOM('<section id="history" hidden></section>', {runScripts:"outside-only"});
  const article = JSON.parse(fs.readFileSync("data/leksikon/places/akershus/historie/leksikon_grini_fangeleir.json", "utf8"))[0];
  dom.window.LEKSIKON_BY_PLACE = {grini_fangeleir:[article]};
  dom.window.eval(built.outputFiles[0].text);
  const rendered = dom.window.Chronology.mountCanonicalChronology(dom.window.document.getElementById("history"), {id:"grini_fangeleir"});
  assert.equal(rendered.querySelectorAll(".hg-place-timeline-item").length, 6);
  for (const item of article.chronology) {
    assert.ok(rendered.textContent.includes(String(item.year)), "The year must remain visible");
    assert.ok(rendered.textContent.includes(item.title), "The event title must remain visible");
    assert.ok(rendered.textContent.includes(item.desc), "The source-backed explanation must remain visible");
  }
  assert.match(rendered.textContent, /Datoavviket er ikke avklart/);
  dom.window.close();
});
