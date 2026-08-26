import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const source = fs.readFileSync("js/fagverk-history-period-deeplink.js", "utf8");

function makeWindow(url) {
  const dom = new JSDOM(`<!doctype html><body><section id="historie-kronologi"><div class="fagverk-history-timeline"><article class="fagverk-curriculum-article">A</article><article class="fagverk-curriculum-article">B</article><article class="fagverk-curriculum-article">C</article></div></section></body>`, {
    url,
    runScripts: "outside-only"
  });
  const w = dom.window;
  const periods = [
    { id: "forhistorie_tidlige_samfunn" },
    { id: "middelalder" },
    { id: "tidlig_moderne_1500_1814" }
  ];
  w.fetch = async () => ({ ok: true, json: async () => ({ chronological_spine: periods }) });
  w.HTMLElement.prototype.scrollIntoView = function () {
    this.dataset.scrolledIntoView = "1";
  };
  w.eval(source);
  return { dom, w };
}

test("History Fagverk exact period link marks and scrolls to the canonical period article", async () => {
  const { dom, w } = makeWindow("https://history-go.test/fagverk.html?subject=historie&period=middelalder#historie-periode-middelalder");
  await w.HGHistoryPeriodDeepLink.apply();

  const target = w.document.getElementById("historie-periode-middelalder");
  assert.ok(target);
  assert.equal(target.dataset.historyPeriodId, "middelalder");
  assert.equal(target.dataset.scrolledIntoView, "1");
  assert.equal(target.textContent, "B");
  dom.window.close();
});

test("History Fagverk period bridge ignores unknown periods", async () => {
  const { dom, w } = makeWindow("https://history-go.test/fagverk.html?subject=historie&period=ukjent#historie-periode-ukjent");
  const applied = await w.HGHistoryPeriodDeepLink.apply();
  assert.equal(applied, false);
  assert.equal(w.document.querySelector("[data-history-period-id]"), null);
  dom.window.close();
});

test("History Fagverk period bridge stays inactive for other subjects", async () => {
  const { dom, w } = makeWindow("https://history-go.test/fagverk.html?subject=kunst&period=middelalder#historie-periode-middelalder");
  const applied = await w.HGHistoryPeriodDeepLink.apply();
  assert.equal(applied, false);
  assert.equal(w.document.querySelector("[data-history-period-id]"), null);
  dom.window.close();
});
