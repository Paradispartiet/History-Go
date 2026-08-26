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
    { id: "d", name: "Helsested", domain: "helse", year: 2020 },
    { id: "e", name: "Bergenssted", domain: "historie", year: 1880, epoke_id: "industrial" },
    { id: "f", name: "Sted uten område", domain: "historie", year: 1900, epoke_id: "industrial" }
  ];
  w.HG_EPOKE_PLACE_INDEX = {
    version: 3,
    domains: {},
    locations: {
      places: {
        a: { country_id: "no", country_label: "Norge", city_id: "oslo", city_label: "Oslo" },
        b: { country_id: "pt", country_label: "Portugal", city_id: "lisboa", city_label: "Lisboa" },
        c: { country_id: "no", country_label: "Norge", city_id: "oslo", city_label: "Oslo" },
        d: { country_id: "no", country_label: "Norge", city_id: "oslo", city_label: "Oslo" },
        e: { country_id: "no", country_label: "Norge", city_id: "bergen", city_label: "Bergen" }
      },
      countries: [
        { id: "no", label: "Norge", cities: [{ id: "bergen", label: "Bergen" }, { id: "oslo", label: "Oslo" }] },
        { id: "pt", label: "Portugal", cities: [{ id: "lisboa", label: "Lisboa" }] }
      ]
    }
  };
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
  assert.deepEqual(Array.from(timeline.epochs[0].places, (row) => row.place.id), ["e", "a", "f"]);
  assert.equal(timeline.epochs[1].epoch.id, "interwar");
  assert.deepEqual(Array.from(timeline.epochs[1].places, (row) => row.place.id), ["b"]);
  assert.deepEqual(Array.from(timeline.unassigned, (row) => row.place.id), ["c"]);
  assert.equal(timeline.placeCount, 5);
  assert.equal(timeline.unknownLocationCount, 1);
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

  assert.equal(w.location.search, "?epoke_domain=historie&epoke=industrial&epoke_scope=city&epoke_country=no&epoke_city=oslo");
  assert.equal(w.history.state.hgEpokeViewer, true);

  assert.match(root.querySelector("[data-epoke-summary]").textContent, /^Oslo ·/);
  assert.equal(root.querySelector('[data-epoke-place-id="b"]'), null, "Lisboa is excluded from Oslo scope");
  const locationSelect = root.querySelector("[data-epoke-location]");
  assert.match(locationSelect.textContent, /Norge/);
  assert.match(locationSelect.textContent, /Portugal/);
  assert.match(locationSelect.textContent, /Alle steder/);
  locationSelect.value = "global";
  locationSelect.dispatchEvent(new w.Event("change"));
  assert.equal(w.location.search, "?epoke_domain=historie&epoke=industrial&epoke_scope=global");

  root.querySelector('[data-epoke-place-id="b"]').click();
  assert.equal(openedPlaceId, "b");
  assert.equal(w.document.getElementById("hgEpokeViewer"), null);
  assert.equal(w.location.search, "");
  dom.window.close();
});

test("shared epoch URLs open the correct current epoch without creating a new history entry", async () => {
  const { dom, w } = makeWindow();
  w.history.replaceState(null, "", "/?epoke_domain=historie&epoke=interwar&epoke_scope=city&epoke_country=pt&epoke_city=lisboa&place=b");
  const beforeLength = w.history.length;

  await w.HGEpokeViewer.openFromUrl();

  const root = w.document.getElementById("hgEpokeViewer");
  assert.ok(root);
  assert.equal(root.querySelector('[data-epoke-id="interwar"]').getAttribute("aria-current"), "true");
  assert.equal(root.querySelector("[data-epoke-location]").value, "city:pt:lisboa");
  assert.match(root.querySelector("[data-epoke-summary]").textContent, /^Lisboa ·/);
  assert.equal(root.querySelector('[data-epoke-place-id="a"]'), null, "Oslo is excluded from Lisboa scope");
  assert.equal(w.history.length, beforeLength);
  assert.equal(w.location.search, "?epoke_domain=historie&epoke=interwar&epoke_scope=city&epoke_country=pt&epoke_city=lisboa&place=b");
  dom.window.close();
});

test("location selector expands from current city to country and global scope without mixing countries", async () => {
  const { dom, w } = makeWindow();
  await w.HGEpokeViewer.open({
    place: w.PLACES[0],
    resolution: w.HGTimeResolver.resolvePlaceTime(w.PLACES[0])
  });

  const root = w.document.getElementById("hgEpokeViewer");
  const locationSelect = root.querySelector("[data-epoke-location]");
  assert.equal(locationSelect.value, "city:no:oslo");
  assert.ok(root.querySelector('[data-epoke-place-id="a"]'));
  assert.equal(root.querySelector('[data-epoke-place-id="e"]'), null);
  assert.equal(root.querySelector('[data-epoke-place-id="b"]'), null);

  root.querySelector('[data-select-epoke="interwar"]').click();
  assert.equal(root.querySelector('[data-epoke-id="interwar"]').getAttribute("aria-current"), "true");

  locationSelect.value = "country:no";
  locationSelect.dispatchEvent(new w.Event("change"));
  assert.ok(root.querySelector('[data-epoke-place-id="e"]'), "country scope includes another Norwegian city");
  assert.equal(root.querySelector('[data-epoke-place-id="b"]'), null, "country scope excludes Portugal");
  assert.equal(root.querySelector('[data-epoke-place-id="f"]'), null, "unknown geography is not guessed into Norway");
  assert.equal(w.location.search, "?epoke_domain=historie&epoke=interwar&epoke_scope=country&epoke_country=no");

  locationSelect.value = "global";
  locationSelect.dispatchEvent(new w.Event("change"));
  assert.ok(root.querySelector('[data-epoke-place-id="b"]'), "global scope includes Portugal");
  assert.ok(root.querySelector('[data-epoke-place-id="f"]'), "global scope keeps places with unknown geography visible");
  assert.match(root.querySelector("[data-epoke-summary]").textContent, /1 uten områdedata/);
  dom.window.close();
});

test("Back and Forward URL state restore the selected geography scope", async () => {
  const { dom, w } = makeWindow();
  await w.HGEpokeViewer.open({
    place: w.PLACES[0],
    resolution: w.HGTimeResolver.resolvePlaceTime(w.PLACES[0])
  });

  w.history.pushState(null, "", "/?epoke_domain=historie&epoke=interwar&epoke_scope=country&epoke_country=pt");
  w.dispatchEvent(new w.PopStateEvent("popstate", { state: null }));
  await new Promise((resolve) => w.setTimeout(resolve, 0));

  const root = w.document.getElementById("hgEpokeViewer");
  assert.equal(root.querySelector("[data-epoke-location]").value, "country:pt");
  assert.match(root.querySelector("[data-epoke-summary]").textContent, /^Portugal ·/);
  assert.ok(root.querySelector('[data-epoke-place-id="b"]'));
  assert.equal(root.querySelector('[data-epoke-place-id="a"]'), null);
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
  assert.match(root.querySelector("[data-epoke-summary]").textContent, /^Oslo · 0 epoker · 1 steder/);
  assert.match(root.textContent, /Helsested/);
  assert.doesNotMatch(root.textContent, /Industrialisering/);
  assert.equal(root.querySelector(".hg-epoke-fagverk-link"), null);
  assert.equal(w.location.search, "?epoke_domain=helse&epoke_scope=city&epoke_country=no&epoke_city=oslo");
  dom.window.close();
});

test("History v2 renders cross-category evidence, analysis, sources and an interactive parallel track", async () => {
  const { dom, w } = makeWindow();
  const industrial = w.EPOKER_INDEX.byDomain.historie.byId.industrial;
  industrial.analysis = {
    what_changed: "Arbeid og transport ble organisert på nye måter.",
    what_continued: "Eldre eierskap la fortsatt føringer.",
    power_and_conflict: "Arbeidere og eiere forhandlet om makt.",
    visible_traces: "Fabrikker og jernbane er synlige spor.",
    guiding_questions: ["Hvem bar kostnadene?"]
  };
  w.HG_EPOKE_PLACE_INDEX = {
    version: 2,
    domains: {
      historie: {
        epochs: {
          industrial: {
            places: [
              {
                place_id: "d",
                name: "Helsested",
                category: "helse",
                roles: [{ id: "hverdagsliv", label: "Hverdagsliv og velferd" }],
                milestones: [{
                  id: "d-1890",
                  year: 1890,
                  title: "Ny institusjon",
                  consequence: "Institusjonen endret tilbudet i byen.",
                  sources: [{ title: "Arkivkilde", url: "https://example.test/source" }]
                }]
              }
            ],
            placeCount: 1,
            milestoneCount: 1
          },
          interwar: { places: [], placeCount: 0, milestoneCount: 0 }
        },
        parallel_tracks: {
          migration: {
            places: [{
              place_id: "d",
              name: "Helsested",
              category: "helse",
              roles: [{ id: "migrasjon", label: "Migrasjon og tilhørighet" }],
              milestones: [{
                id: "d-1930",
                year: 1930,
                title: "Nytt fellesskap",
                consequence: "Stedet ble en møteplass.",
                sources: [{ title: "Historisk kilde", url: "https://example.test/track" }]
              }]
            }],
            placeCount: 1,
            milestoneCount: 1
          }
        }
      }
    }
  };

  await w.HGEpokeViewer.open({ resolution: { domain: "historie", epokeId: "industrial" } });
  const root = w.document.getElementById("hgEpokeViewer");
  assert.match(root.textContent, /Hva endret seg\?/);
  assert.match(root.textContent, /Helsested/);
  assert.match(root.textContent, /Hverdagsliv og velferd/);
  assert.match(root.textContent, /Institusjonen endret tilbudet/);
  assert.equal(root.querySelector(".hg-epoke-source").getAttribute("href"), "https://example.test/source");
  assert.equal(w.PLACES.find((place) => place.id === "d").domain, "helse", "primary category remains unchanged");

  root.querySelector('[data-parallel-epoke-id="migration"]').click();
  assert.ok(root.querySelector('[data-parallel-detail="migration"]'));
  assert.match(root.querySelector('[data-parallel-detail="migration"]').textContent, /Nytt fellesskap/);
  assert.equal(root.querySelectorAll(".hg-epoke-node").length, 2, "parallel track is not a canonical epoch");
  dom.window.close();
});
