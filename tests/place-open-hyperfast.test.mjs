import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

const read = file => fs.readFileSync(file, "utf8");
const json = file => JSON.parse(read(file));

test("Stories rebuilds every index when place-open arrives during aggregate loading", async () => {
  const story = {
    id: "opening-story", place_id: "opening-place", person_id: "editor",
    type: "turning_point", title: "Opening", story: "A sourced story.",
    sources: ["https://example.test/source"], tags: ["press"],
    next_scenes: ["next-place"]
  };
  const seededOnly = { ...story, id: "seeded-only", title: "Only in opening payload" };
  let releaseAggregate;
  const aggregate = new Promise(resolve => { releaseAggregate = resolve; });
  const context = {
    console, URL,
    document: { baseURI: "https://example.test/History-Go/" },
    CustomEvent: class CustomEvent {},
    fetch: async url => ({ ok: true, json: async () =>
      String(url).includes("place-open/")
        ? { place: { id: story.place_id }, stories: structuredClone([story, seededOnly]) }
        : aggregate
    })
  };
  context.window = context;
  vm.runInNewContext(read("js/stories/stories_loader.js"), context);
  vm.runInNewContext(read("js/data/place-open-loader.js"), context);
  const loading = context.HGStories.init();
  await context.HGPlaceOpen.preload(story.place_id);
  assert.equal(context.HGStories.getByPlace(story.place_id).length, 2);
  releaseAggregate(structuredClone([story]));
  await loading;
  const runtime = context.HGStories;
  for (const list of [runtime.all, runtime.getByPlace(story.place_id),
    runtime.getByPerson(story.person_id), runtime.getByType(story.type), runtime.getByTag("press")]) {
    assert.equal(list.length, 2, "one copy of each story, including the payload-only story");
    assert.equal(new Set(list.map(item => item.id)).size, 2);
  }
  assert.equal(runtime.getById(story.id).next_scenes[0].place_id, "next-place");
  assert.equal(runtime.getById(seededOnly.id).next_scenes[0].place_id, "next-place");
  await runtime.init();
  await context.HGPlaceOpen.preload(story.place_id);
  assert.equal(runtime.getByPlace(story.place_id).length, 2, "reopening stays idempotent");
});

test("Regjeringskvartalet has one complete open payload", () => {
  const payload = json("data/runtime/place-open/regjeringskvartalet.json");
  assert.equal(payload.schema, "history-go-place-open-v1");
  assert.equal(payload.place.id, "regjeringskvartalet");
  assert.ok(payload.place.popupDesc || payload.place.description, "full popup copy is included");
  assert.equal(payload.people.length, 22, "all Regjeringskvartalet People are bundled");
  assert.equal(payload.brands.length, 17, "all 14 Brands and 3 additional place actors are bundled");
  assert.ok(payload.stories.length >= 3, "canonical stories are bundled");
  assert.ok(payload.leksikon.length >= 6, "place leksikon is bundled");
  assert.ok(payload.lesespor.length >= 4, "place reading trails are bundled");
  assert.ok(payload.language, "place language article is bundled");
  assert.equal(new Set(payload.people.map(person => person.id)).size, payload.people.length);
});

test("place loader coalesces requests and hydrates all opening surfaces", async () => {
  const payload = json("data/runtime/place-open/regjeringskvartalet.json");
  const requests = [];
  const listeners = [];
  const context = {
    console,
    document: { baseURI: "https://example.test/History-Go/" },
    URL,
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    fetch: async (url, options) => {
      requests.push({ url: String(url), options });
      return { ok: true, json: async () => structuredClone(payload) };
    },
    PLACES: [{ id: "regjeringskvartalet", name: "Regjeringskvartalet" }],
    HGPlaces: [],
    allPlaces: [],
    PEOPLE: [],
    RELATIONS: [],
    HGStories: { all: [], byId: {}, byPlace: {} },
    HGEvents: { all: [], byId: {}, byPlace: {} },
    HGBrands: { all: [], catalog: [], byId: {}, byPlace: {} },
    dispatchEvent: event => listeners.push(event)
  };
  context.window = context;
  vm.runInNewContext(read("js/data/place-open-loader.js"), context, { filename: "place-open-loader.js" });

  const [first, second] = await Promise.all([
    context.HGPlaceOpen.preload(context.PLACES[0]),
    context.HGPlaceOpen.preload("regjeringskvartalet")
  ]);

  assert.equal(requests.length, 1, "concurrent preloads share one HTTP request");
  assert.match(requests[0].url, /data\/runtime\/place-open\/regjeringskvartalet\.json$/);
  assert.equal(requests[0].options.cache, "no-cache");
  assert.equal(first.popupDesc || first.description, second.popupDesc || second.description);
  assert.equal(context.PEOPLE.length, 22);
  assert.equal(context.HGStories.byPlace.regjeringskvartalet.length, payload.stories.length);
  assert.equal(context.LEKSIKON_BY_PLACE.regjeringskvartalet.length, payload.leksikon.length);
  assert.equal(context.LESESPOR_BY_PLACE.regjeringskvartalet.length, payload.lesespor.length);
  assert.equal(context.HG_PLACE_OPEN_EVENTS.regjeringskvartalet.length, payload.events.length);
  assert.equal(context.HGBrands.byPlace.regjeringskvartalet.length, 17);
  assert.equal(context.BRANDS_BY_PLACE.regjeringskvartalet.length, 17);
  assert.equal(context.HG_PLACE_OPEN_LANGUAGE.regjeringskvartalet.place_id, "regjeringskvartalet");
  assert.equal(context.HGPlaceOpen.has("regjeringskvartalet"), true);
  assert.equal(listeners.at(-1)?.type, "hg:place-open-ready");
});

test("place card reapplies the active locale after place-open hydration", () => {
  const runtime = read("js/ui/place-card.js");
  const start = runtime.indexOf("if (window.HGPlaceOpen?.ensure");
  const end = runtime.indexOf("if (window.DataHub?.loadFullPlace", start);
  assert.ok(start >= 0 && end > start, "place-open hydration block must remain inspectable");
  const hydration = runtime.slice(start, end);
  assert.match(hydration, /window\.HG_I18N\?\.localizePlace\?\.\(place\)\s*\|\|\s*place/);
  assert.ok(
    hydration.indexOf("localizePlace") > hydration.lastIndexOf("HGPlaceOpen?.getPlace"),
    "localization must run after every hydrated-place assignment"
  );
});

test("runtime uses aggregate background files instead of request waterfalls", () => {
  const boot = read("js/boot-fast.js");
  const stories = read("js/stories/stories_loader.js");
  const leksikon = read("js/leksikon/leksikon_loader.js");
  const hub = read("js/dataHub.js");
  const app = read("js/app.js");
  const map = read("js/map.js");
  const nearby = read("dist/web/nearbyPlacesList.js");
  const popupTabs = read("js/ui/place-popup-tabs.js");

  assert.match(boot, /data\/runtime\/people-all\.json/);
  assert.match(boot, /data\/runtime\/wonderkammer-all\.json/);
  assert.match(stories, /data\/runtime\/stories-all\.json/);
  assert.match(leksikon, /data\/runtime\/leksikon-all\.json/);
  assert.match(hub, /runtime\/lesespor-all\.json/);
  assert.match(hub, /runtime\/nature-all\.json/);
  assert.ok(app.indexOf("loadPlaceOpenLoader") < app.indexOf("loadPopupUtils"));
  assert.match(map, /HGPlaceOpen/);
  assert.match(nearby, /HGPlaceOpen/);
  assert.match(popupTabs, /hasOwnProperty\.call\(global\.LEKSIKON_BY_PLACE \|\| \{\}, placeId\)/);
  assert.match(popupTabs, /hasOwnProperty\.call\(global\.HGStories\?\.byPlace \|\| \{\}, placeId\)/);
});

test("large background aggregates are bounded parallel shards", () => {
  for (const name of ["people-all", "stories-all", "leksikon-all"]) {
    const manifest = json(`data/runtime/${name}.json`);
    assert.equal(manifest.schema, "history-go-runtime-shards-v1");
    assert.ok(manifest.files.length > 1, `${name} is split into parallel shards`);
    for (const file of manifest.files) {
      assert.ok(fs.statSync(file).size < 250_000, `${file} stays below the shard budget`);
    }
  }

  for (const name of ["nature-all", "wonderkammer-all"]) {
    const manifest = json(`data/runtime/${name}.json`);
    assert.equal(manifest.schema, "history-go-runtime-shards-v1");
    for (const files of Object.values(manifest.groups)) {
      for (const file of files) assert.ok(fs.statSync(file).size < 250_000, `${file} stays below the shard budget`);
    }
  }
});
