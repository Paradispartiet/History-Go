#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const bootPath = path.join(__dirname, "..", "js", "boot-fast.js");
const boot = fs.readFileSync(bootPath, "utf8");

assert.match(boot, /function waitForBackgroundIdle\(\)/);
assert.match(boot, /requestIdleCallback/);
assert.match(boot, /function startPriorityPeopleDataLoad\(\)/);
assert.match(boot, /runSafeAsync\("loadRelationsBackground", loadRelationsBackground\)/);
assert.match(boot, /runSafeAsync\("loadPeopleBackground", loadPeopleBackground\)/);
assert.match(boot, /await startPriorityPeopleDataLoad\(\);/);
assert.match(boot, /function loadRowsWithConcurrency\(/);
assert.match(boot, /PEOPLE_FETCH_CONCURRENCY/);
assert.match(boot, /hg:people-priority-ready/);
assert.match(boot, /typeof data === "object".*return \[data\]/);
assert.match(boot, /for \(const \[label, task\] of tasks\)/);
assert.match(boot, /await waitForBackgroundIdle\(\);\s*await runSafeAsync\(label, task\);/);
assert.doesNotMatch(boot, /Promise\.allSettled\(tasks\)/);

function makeEventTarget(target = {}) {
  const listeners = new Map();
  target.addEventListener = (name, handler) => {
    const rows = listeners.get(name) || [];
    rows.push(handler);
    listeners.set(name, rows);
  };
  target.dispatchEvent = (event) => {
    for (const handler of listeners.get(event.type) || []) handler.call(target, event);
    return true;
  };
  return target;
}

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

class FakeElement {
  constructor(id, { emptyText = "" } = {}) {
    this.id = id;
    this.dataset = {};
    this.innerHTML = "";
    this.hidden = false;
    this.style = {};
    this.attributes = new Map();
    this.emptyNode = emptyText ? { textContent: emptyText, dataset: {} } : null;
    this.hasRenderedPeople = false;
    this.classList = {
      toggle() {},
      add() {},
      remove() {},
      contains() { return false; }
    };
  }

  querySelector(selector) {
    if (selector === "img") return this.innerHTML.includes("<img") ? {} : null;
    if (selector === ".pc-round-count") {
      const match = this.innerHTML.match(/pc-round-count[^>]*>([^<]*)</);
      return match ? { textContent: match[1] } : null;
    }
    if (selector === ".pc-empty") return this.emptyNode;
    if (selector === "[data-person], .pc-relations-section") return this.hasRenderedPeople ? {} : null;
    if (selector === ".places-loading-text") return null;
    return null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  addEventListener() {}
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function waitUntil(predicate, message, timeoutMs = 250) {
  const startedAt = Date.now();
  while (!predicate()) {
    if (Date.now() - startedAt >= timeoutMs) throw new Error(message);
    await delay(2);
  }
}

(async () => {
  const fetchLog = [];
  const lifecycle = [];
  let activePeopleFetches = 0;
  let maxPeopleFetches = 0;
  let refreshCalls = 0;
  const refreshRelationStates = [];
  let mutationCallback = null;
  const peopleAttempts = new Map();

  const placeCard = new FakeElement("placeCard");
  placeCard.dataset.currentPlaceId = "";
  const peopleIcon = new FakeElement("pcPeopleIcon");
  const peopleList = new FakeElement("pcPeopleList", { emptyText: "Ingen personer ennå" });
  const elements = new Map([
    ["placeCard", placeCard],
    ["pcPeopleIcon", peopleIcon],
    ["pcPeopleList", peopleList]
  ]);

  const document = makeEventTarget({
    readyState: "complete",
    getElementById(id) {
      return elements.get(id) || null;
    }
  });

  const window = makeEventTarget({
    requestAnimationFrame(callback) {
      return setTimeout(callback, 0);
    },
    requestIdleCallback(callback) {
      return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0);
    },
    DataHub: {
      async loadPlacesBase() {
        return [
          { id: "place-1", name: "Teststed", desc: "Test" },
          { id: "place-2", name: "Relasjonssted", desc: "Test" }
        ];
      },
      async loadNature() {},
      async loadLesespor() {}
    },
    HGMap: {
      getMap() { return null; },
      initMap() { return {}; },
      setPlaces() {},
      setOnPlaceClick() {},
      refreshMarkers() {}
    },
    HGStories: { async init() {} },
    HGEvents: { async init() {} },
    HGBrands: { async init() {} },
    async openPlaceCard() {
      refreshCalls += 1;
      refreshRelationStates.push(window.HG_RELATIONS_READY);
      peopleIcon.innerHTML = '<span class="pc-round-emoji">👥</span><span class="pc-round-count">6</span>';
      peopleIcon.dataset.roundReady = "true";
      peopleList.hasRenderedPeople = true;
      if (peopleList.emptyNode) peopleList.emptyNode.textContent = "";
      return true;
    }
  });

  window.addEventListener("hg:people-priority-ready", () => lifecycle.push("people-priority-ready"));
  window.addEventListener("hg:people-ready", () => lifecycle.push("people-ready"));
  window.addEventListener("hg:relations-ready", () => lifecycle.push("relations-ready"));
  window.addEventListener("hg:wonderkammer-ready", () => lifecycle.push("wonderkammer-ready"));

  const peopleFiles = [
    ...Array.from({ length: 7 }, (_, index) => `people/test/person-${index + 2}.json`),
    "people/by/place-1/person-1.json"
  ];

  async function fetchMock(input) {
    const url = String(input).replace(/^\//, "");
    fetchLog.push(url);

    if (url === "data/people/manifest.json") {
      return response({ files: peopleFiles });
    }

    if (/^data\/people\/(?:by\/place-1|test)\/person-/.test(url)) {
      const attempts = (peopleAttempts.get(url) || 0) + 1;
      peopleAttempts.set(url, attempts);
      activePeopleFetches += 1;
      maxPeopleFetches = Math.max(maxPeopleFetches, activePeopleFetches);
      await delay(8);
      activePeopleFetches -= 1;
      if (url.endsWith("person-8.json") && attempts === 1) {
        return { ok: false, async json() { return null; } };
      }
      const id = url.match(/person-(\d+)/)?.[1] || "x";
      if (id === "1") {
        return response({ id: "person-1", name: "Person 1", place_ids: ["place-1"] });
      }
      return response({ people: [{ id: `person-${id}`, name: `Person ${id}`, place_ids: ["place-1"] }] });
    }

    if (url === "data/relations.json") {
      await delay(40);
      return response({
        relations: [
          { id: "rel-1", place_id: "place-1", person_id: "person-1" },
          { id: "rel-2", place_id: "place-2", person_id: "person-2" }
        ]
      });
    }

    if (url === "data/relations_philanthropy.json") {
      await delay(2);
      return response({ relations: [] });
    }

    if (url === "data/wonderkammer/index.json") {
      return response({ files: ["data/wonderkammer/base.json"] });
    }

    if (url === "data/wonderkammer/base.json") {
      return response({ places: [], people: [] });
    }

    if (url === "data/tags.json") return response([]);
    throw new Error(`Unexpected fetch: ${url}`);
  }

  function response(data) {
    return {
      ok: true,
      async json() { return data; }
    };
  }

  const localStorageData = new Map();
  const context = {
    window,
    document,
    location: { hostname: "localhost", hash: "" },
    localStorage: {
      getItem(key) { return localStorageData.get(key) || null; },
      setItem(key, value) { localStorageData.set(key, String(value)); }
    },
    navigator: { hardwareConcurrency: 8 },
    fetch: fetchMock,
    CustomEvent: FakeCustomEvent,
    MutationObserver: class {
      constructor(callback) { mutationCallback = callback; }
      observe() {}
    },
    performance: { now: () => Date.now() },
    console: { ...console, warn() {} },
    setTimeout,
    clearTimeout,
    Promise
  };
  context.globalThis = context;

  vm.runInNewContext(boot, context, { filename: "boot-fast.js" });
  await delay(5);

  assert.equal(window.HG_PEOPLE_READY, false);
  assert.match(peopleIcon.innerHTML, /…/);
  assert.equal(peopleList.emptyNode.textContent, "Laster personer …");

  peopleIcon.innerHTML = '<span class="pc-round-emoji">👥</span><span class="pc-round-count">0</span>';
  peopleIcon.dataset.roundReady = "true";
  window.dispatchEvent(new FakeCustomEvent("hg:people-progress"));
  await delay(5);
  assert.match(peopleIcon.innerHTML, /…/, "loading-broen overskriver en falsk null");

  await window.bootCritical();
  assert.ok(fetchLog.includes("data/runtime/people-all.json"), "samlet People-kilde starter straks critical boot er ferdig");
  assert.ok(fetchLog.includes("data/relations.json"), "Relasjoner starter straks critical boot er ferdig");
  await waitUntil(() => fetchLog.includes("data/people/manifest.json"), "manifest-fallback startet ikke etter manglende samlefil");

  await delay(2);
  placeCard.dataset.currentPlaceId = "place-1";

  await waitUntil(
    () => lifecycle.includes("people-priority-ready") && refreshCalls >= 1,
    "prioritert People-data rendret ikke det åpne PlaceCard-et"
  );
  assert.ok(lifecycle.includes("people-priority-ready"), "sted åpnet etter boot flyttes fram i den pågående People-køen");
  assert.equal(window.HG_PEOPLE_READY, false, "resten av People kan fortsatt laste");
  assert.equal(refreshRelationStates[0], false, "direkte place-profiler venter ikke på hele relasjonsregisteret");
  assert.deepEqual(Array.from(window.PEOPLE, person => person.id), ["person-1"]);
  assert.ok(refreshCalls >= 1, "åpent PlaceCard rendres så snart direkte People-profiler er brukbare");

  await window.bootBackground();
  await delay(20);

  assert.equal(window.HG_PEOPLE_READY, true);
  assert.equal(window.HG_RELATIONS_READY, true);
  assert.equal(window.PEOPLE.length, peopleFiles.length);
  assert.equal(peopleAttempts.get("data/people/test/person-8.json"), 2, "feilede People-filer prøves én gang til");
  assert.ok(maxPeopleFetches > 1, `forventet parallell People-lasting, fikk ${maxPeopleFetches}`);
  assert.ok(maxPeopleFetches <= 6, `People-lasting overskred grensen: ${maxPeopleFetches}`);

  const peopleAggregateIndex = fetchLog.indexOf("data/runtime/people-all.json");
  const relationIndex = fetchLog.indexOf("data/relations.json");
  const wonderIndex = fetchLog.indexOf("data/wonderkammer/index.json");
  assert.ok(peopleAggregateIndex >= 0 && peopleAggregateIndex < wonderIndex);
  assert.ok(relationIndex >= 0 && relationIndex < wonderIndex);
  assert.ok(lifecycle.indexOf("people-priority-ready") < lifecycle.indexOf("people-ready"));
  assert.ok(lifecycle.indexOf("people-ready") < lifecycle.indexOf("wonderkammer-ready"));
  assert.ok(lifecycle.indexOf("relations-ready") < lifecycle.indexOf("wonderkammer-ready"));

  assert.ok(refreshCalls >= 1, "åpent PlaceCard rendres på nytt når People og relasjoner er klare");
  assert.doesNotMatch(peopleIcon.innerHTML, /…/);
  assert.match(peopleIcon.innerHTML, />6</);

  const refreshesBeforeValidFallback = refreshCalls;
  peopleIcon.innerHTML = '<span class="pc-round-emoji">👥</span><span class="pc-round-count">6</span>';
  peopleIcon.dataset.roundReady = "false";
  peopleList.hasRenderedPeople = true;
  mutationCallback?.([]);
  await delay(10);
  assert.equal(
    refreshCalls,
    refreshesBeforeValidFallback,
    "gyldig positiv fallback uten bilde må ikke bruke stale-sperren"
  );
  assert.equal(peopleIcon.dataset.hgPeopleStaleRefreshFor, undefined);

  const refreshesBeforeStaleRepair = refreshCalls;
  peopleIcon.innerHTML = '<span class="pc-round-emoji">👥</span><span class="pc-round-count">0</span>';
  peopleIcon.dataset.roundReady = "false";
  peopleList.hasRenderedPeople = false;
  mutationCallback?.([]);
  await delay(10);
  assert.ok(refreshCalls > refreshesBeforeStaleRepair, "sen tom PlaceCard-render repareres etter ready-eventet");
  assert.match(peopleIcon.innerHTML, />6</);

  const refreshesAfterStaleRepair = refreshCalls;
  peopleIcon.innerHTML = '<img src="/broken-person.jpg" alt="">';
  peopleIcon.dataset.roundReady = "true";
  mutationCallback?.([]);
  await delay(5);
  peopleIcon.innerHTML = '<span class="pc-round-emoji">👥</span><span class="pc-round-count">0</span>';
  peopleIcon.dataset.roundReady = "false";
  mutationCallback?.([]);
  await delay(10);
  assert.equal(
    refreshCalls,
    refreshesAfterStaleRepair,
    "ødelagt previewbilde kan ikke starte en ny PlaceCard-refreshløkke"
  );

  placeCard.dataset.currentPlaceId = "place-2";
  peopleIcon.innerHTML = '<span class="pc-round-emoji">👥</span><span class="pc-round-count">4</span>';
  peopleIcon.dataset.roundReady = "true";
  mutationCallback?.([]);
  await delay(5);
  assert.equal(peopleIcon.dataset.hgPeopleObservedPlace, "place-2");
  assert.equal(peopleIcon.dataset.hgPeopleStaleRefreshFor, undefined);

  placeCard.dataset.currentPlaceId = "place-1";
  peopleIcon.innerHTML = '<span class="pc-round-emoji">👥</span><span class="pc-round-count">0</span>';
  peopleIcon.dataset.roundReady = "false";
  mutationCallback?.([]);
  await waitUntil(
    () => refreshCalls > refreshesAfterStaleRepair,
    "retur til stedet åpnet ikke engangssperren for en ny stale-reparasjon"
  );
  assert.equal(
    refreshCalls,
    refreshesAfterStaleRepair + 1,
    "stedsovergang nullstiller sperren nøyaktig én gang"
  );

  const refreshesBeforeRelationOnlyRepair = refreshCalls;
  placeCard.dataset.currentPlaceId = "place-2";
  peopleIcon.innerHTML = '<span class="pc-round-emoji">👥</span><span class="pc-round-count">0</span>';
  peopleIcon.dataset.roundReady = "false";
  mutationCallback?.([]);
  await waitUntil(
    () => refreshCalls > refreshesBeforeRelationOnlyRepair,
    "relasjonskoblet person utløste ikke stale-reparasjon"
  );
  assert.equal(
    refreshCalls,
    refreshesBeforeRelationOnlyRepair + 1,
    "relasjonskoblet person gir nøyaktig én stale-reparasjon"
  );

  console.log("People/relations are prioritized, bounded-parallel, and refresh the open round without a false zero");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
