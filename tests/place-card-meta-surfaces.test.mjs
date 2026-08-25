import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const epokeSource = fs.readFileSync("js/ui/place-card-epoke.js", "utf8");
const statusSource = fs.readFileSync("js/ui/place-card-status-surface.js", "utf8");
const appSource = fs.readFileSync("js/app.js", "utf8");
const indexSource = fs.readFileSync("index.html", "utf8");
const okern = JSON.parse(fs.readFileSync("data/places/by/oslo/places/okern.json", "utf8"));
const byEpochs = JSON.parse(fs.readFileSync("data/epoker/epoker_by.json", "utf8"));

test("Økern resolves to a real, clickable epoch beside category", async () => {
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="okern"></div>
    <div id="pcMeta"><button type="button">BY &amp; ARKITEKTUR</button></div>
    <button id="pcBadgesIcon" type="button"></button>
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  let badgeClicks = 0;
  w.document.getElementById("pcBadgesIcon").addEventListener("click", () => { badgeClicks += 1; });
  w.openPlaceCard = async () => true;
  w.HGEpokerRuntime = { ready: Promise.resolve() };
  const resolvedEpoch = byEpochs.epoker.find((epoch) => (
    okern.year >= epoch.years.from && (epoch.years.to == null || okern.year <= epoch.years.to)
  ));
  assert.ok(resolvedEpoch, "Økern year must match a canonical By epoch");
  w.HGTimeResolver = {
    resolvePlaceTime: (place) => ({
      domain: "by",
      epokeId: resolvedEpoch.id,
      epokeLabel: resolvedEpoch.label,
      startYear: place.year,
      endYear: place.year
    })
  };
  w.EPOKER_INDEX = {
    byDomain: {
      by: {
        byId: {
          [resolvedEpoch.id]: {
            id: resolvedEpoch.id,
            label: resolvedEpoch.label,
            start_year: resolvedEpoch.years.from,
            end_year: resolvedEpoch.years.to
          }
        }
      }
    }
  };

  w.eval(epokeSource);
  await w.openPlaceCard(okern);

  const category = w.document.querySelector("#pcMeta > :first-child");
  const epoke = w.document.querySelector("#pcMeta > .pc-epoke");
  assert.equal(okern.year, 1938);
  assert.equal(category.textContent, "BY & ARKITEKTUR · 1900–1945");
  assert.equal(epoke.tagName, "BUTTON");
  assert.equal(epoke.textContent, "Epoke: Modernisering og industriby");
  epoke.click();
  assert.equal(badgeClicks, 1);
  dom.window.close();
});

test("status renders for an already-open first card and opens its next action", () => {
  const dom = new JSDOM(`<!doctype html><head></head><body>
    <div id="placeCard" data-current-place-id="okern"></div>
    <div id="pcMeta"><button type="button">BY &amp; ARKITEKTUR</button></div>
    <button id="pcQuiz" type="button">Ta quiz</button>
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  let quizClicks = 0;
  w.document.getElementById("pcQuiz").addEventListener("click", () => { quizClicks += 1; });
  w.PLACES = [okern];
  w.openPlaceCard = async () => true;
  w.HGProfileProgressReader = {
    getPlaceProgressSummary: () => ({
      status: "unknown",
      visited: false,
      quizCompleted: false,
      favorite: false,
      nextAction: "open"
    })
  };

  w.eval(statusSource);

  const status = w.document.querySelector("#pcMeta > .pc-progress-status-line");
  assert.equal(status.tagName, "BUTTON");
  assert.match(status.textContent, /^Status: Ikke fullført · Gjenstår: Ta quiz$/);
  status.click();
  assert.equal(quizClicks, 1);
  dom.window.close();
});

test("progress and metadata runtimes load before router and not post-ready", () => {
  const readerAt = appSource.indexOf('loadProfileProgressReader');
  const statusAt = appSource.indexOf('loadPlaceCardStatusSurface');
  const routerAt = appSource.indexOf('loadAppRouter');
  assert.ok(readerAt > 0 && statusAt > readerAt && routerAt > statusAt);
  assert.doesNotMatch(indexSource, /"js\/progress\/profileProgressReader\.js"/);
  assert.doesNotMatch(indexSource, /"js\/ui\/place-card-status-surface\.js"/);
});
