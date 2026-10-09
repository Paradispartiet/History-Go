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
