import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const viewerSource = fs.readFileSync("js/ui/epoke-viewer.js", "utf8");

function makeWindow() {
  const dom = new JSDOM("<!doctype html><head></head><body></body>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const w = dom.window;
  w.requestAnimationFrame = (callback) => {
    callback();
    return 1;
  };
  w.DomainRegistry = {
    toRuntimeCategoryId: (value) => String(value || ""),
    listRuntimeCategories: () => ["historie", "helse"]
  };
  const industrial = {
    id: "industrial",
    label: "Industrialisering",
    definition: "Industrialisering og urbanisering endrer arbeid, transport og byliv.",
    start_year: 1850,
    end_year: 1914,
    fagverk_links: [
      {
        subject_id: "historie",
        anchor: "historie-kronologi",
        label: "Det lange 1800-tallet",
        period_ids: ["lange_1800_tallet_1814_1914"],
        basis: "period_guide"
      }
    ]
  };
  const interwar = {
    id: "interwar",
    label: "Mellomkrigstiden",
    start_year: 1918,
    end_year: 1939,
    fagverk_links: [
      {
        subject_id: "historie",
        anchor: "historie-kronologi",
        label: "1905 og mellomkrigstiden",
        period_ids: ["lange_1800_tallet_1814_1914", "forste_verdenskrig_mellomkrig"]
      }
    ]
  };
  const migration = {
    id: "migration",
    label: "Migrasjon, minoritet og tilhørighet",
    definition: "Et langsgående spor gjennom flere perioder.",
    start_year: 1600,
    end_year: null
  };
  w.EPOKER_INDEX = {
    byDomain: {
      historie: {
        list: [industrial, interwar],
        byStart: [industrial, interwar],
        byId: { industrial, interwar }
      }
    },
    parallelByDomain: {
      historie: {
        list: [migration],
        byStart: [migration],
        byId: { migration }
      }
    }
  };
  w.PLACES = [
    { id: "a", name: "Sted A", domain: "historie", year: 1890, epoke_id: "industrial" },
    { id: "b", name: "Sted B", domain: "historie", year: 1930, epoke_id: "interwar" },
    { id: "c", name: "Sted C", domain: "historie" },
    { id: "d", name: "Helsested", domain: "helse", year: 2020 }
  ];
  w.HGTimeResolver = {
    resolvePlaceTime: (place) => ({
      domain: place.domain,
      epokeId: place.epoke_id || null,
      epokeLabel: place.epoke_id === "industrial" ? "Industrialisering" : place.epoke_id === "interwar" ? "Mellomkrigstiden" : null,
      startYear: place.year || null,
      endYear: place.year || null,
      sortKey: place.year || Number.MAX_SAFE_INTEGER
    })
  };
  w.HGEpokerRuntime = { ready: Promise.resolve() };
  w.eval(viewerSource);
  return { dom, w };
}

test("epoch viewer keeps canonical chronology separate from parallel historical tracks", () => {
  const { dom, w } = makeWindow();
  const timeline = w.HGEpokeViewer.buildTimeline("historie");

  assert.equal(timeline.epochs.length, 2);
  assert.equal(timeline.epochs[0].epoch.id, "industrial");
  assert.deepEqual(Array.from(timeline.epochs[0].places, (row) => row.place.id), ["a"]);
  assert.equal(timeline.epochs[1].epoch.id, "interwar");
  assert.deepEqual(Array.from(timeline.epochs[1].places, (row) => row.place.id), ["b"]);
  assert.deepEqual(Array.from(timeline.unassigned, (row) => row.place.id), ["c"]);
  assert.equal(timeline.placeCount, 3);
  assert.deepEqual(Array.from(timeline.parallel, (track) => track.id), ["migration"]);
  dom.window.close();
});

test("epoch viewer opens timeline, exact Fagverk periods, parallel tracks and navigable places", async () => {
  const { dom, w } = makeWindow();
  let openedPlaceId = "";
  w.HGMapView = {
    openPlace: (placeId) => {
      openedPlaceId = placeId;
      return true;
    }
  };

  await w.HGEpokeViewer.open({
    place: w.PLACES[0],
    resolution: w.HGTimeResolver.resolvePlaceTime(w.PLACES[0])
  });

  const root = w.document.getElementById("hgEpokeViewer");
  assert.ok(root);
  assert.equal(root.getAttribute("role"), "dialog");
  assert.match(root.textContent, /Tidslinje/);
  assert.match(root.textContent, /Industrialisering og urbanisering/);
  assert.match(root.textContent, /Gjennomgående historiske spor/);
  assert.match(root.textContent, /Migrasjon, minoritet og tilhørighet/);
  assert.equal(root.querySelectorAll(".hg-epoke-node").length, 2, "parallel track must not become a canonical epoch node");
  assert.equal(root.querySelector('[data-epoke-id="industrial"]').getAttribute("aria-current"), "true");

  const exactLink = root.querySelector('[data-epoke-id="industrial"] .hg-epoke-fagverk-link');
  assert.ok(exactLink);
  assert.equal(
    exactLink.getAttribute("href"),
    "fagverk.html?subject=historie&period=lange_1800_tallet_1814_1914&place=a#historie-periode-lange_1800_tallet_1814_1914"
  );

  const broadLink = root.querySelector('[data-epoke-id="interwar"] .hg-epoke-fagverk-link');
  assert.ok(broadLink);
  assert.equal(broadLink.getAttribute("href"), "fagverk.html?subject=historie&place=a#historie-kronologi");

  assert.equal(w.location.search, "?epoke_domain=historie&epoke=industrial");
  assert.equal(w.history.state.hgEpokeViewer, true);

  root.querySelector('[data-epoke-place-id="b"]').click();
  assert.equal(openedPlaceId, "b");
  assert.equal(w.document.getElementById("hgEpokeViewer"), null);
  assert.equal(w.location.search, "");
  dom.window.close();
});

test("shared epoch URLs open the correct current epoch without creating a new history entry", async () => {
  const { dom, w } = makeWindow();
  w.history.replaceState(null, "", "/?epoke_domain=historie&epoke=interwar");
  const beforeLength = w.history.length;

  await w.HGEpokeViewer.openFromUrl();

  const root = w.document.getElementById("hgEpokeViewer");
  assert.ok(root);
  assert.equal(root.querySelector('[data-epoke-id="interwar"]').getAttribute("aria-current"), "true");
  assert.equal(w.history.length, beforeLength);
  assert.equal(w.location.search, "?epoke_domain=historie&epoke=interwar");
  dom.window.close();
});

test("a place domain without an epoch catalogue stays in its own domain", async () => {
  const { dom, w } = makeWindow();
  const healthPlace = w.PLACES.find((place) => place.id === "d");

  await w.HGEpokeViewer.open({
    place: healthPlace,
    resolution: w.HGTimeResolver.resolvePlaceTime(healthPlace)
  });

  const root = w.document.getElementById("hgEpokeViewer");
  const select = root.querySelector("[data-epoke-domain]");
  assert.equal(select.value, "helse");
  assert.match(root.querySelector("[data-epoke-summary]").textContent, /^0 epoker · 1 steder/);
  assert.match(root.textContent, /Helsested/);
  assert.doesNotMatch(root.textContent, /Industrialisering/);
  assert.equal(root.querySelector(".hg-epoke-fagverk-link"), null);
  assert.equal(w.location.search, "?epoke_domain=helse");
  dom.window.close();
});
