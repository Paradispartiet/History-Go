import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";

const ROOT = process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
const rows = data => Array.isArray(data) ? data : (Array.isArray(data?.people) ? data.people : (data?.id ? [data] : []));

const manifest = readJson("data/people/manifest.json");
const people = manifest.files.flatMap(rel => rows(readJson(path.join("data", rel))));
const expected = [
  "thorvald_meyer", "henrik_bull", "christian_morgenstierne", "arne_eide",
  "thoger_binneballe", "harald_olsen", "alma_fahlstrom", "johan_fahlstrom",
  "ludvig_christian_jensen", "adelsten_jensen", "peter_marinius_jensen", "karl_a_jensen", "thorvald_jensen",
  "nanna_broch", "wulff_becker", "martin_heinz_zilsel", "alexander_claes",
  "therese_hurwitz", "jenny_hurwitz", "fredrik_hurwitz", "moritz_glott",
];

function runtimePeopleForTorggata() {
  const source = fs.readFileSync(path.join(ROOT, "js/ui/popup-utils.js"), "utf8");
  const context = {
    console,
    window: { PEOPLE: people, PLACES: [{ id: "torggata", category: "by" }], RELATIONS: [] },
    document: { addEventListener() {}, createElement() { return {}; }, body: { appendChild() {} }, getElementById() { return null; } },
    requestAnimationFrame() {}, setTimeout, clearTimeout,
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "popup-utils.js" });
  return Array.from(context.getPeopleForPlace("torggata"));
}

test("Torggata 8A closeout resolves every produced canonical person without a quota ceiling", () => {
  const resolved = runtimePeopleForTorggata();
  const ids = resolved.map(person => String(person?.id || "").trim()).filter(Boolean);
  const idSet = new Set(ids);
  assert.equal(idSet.size, ids.length, "runtime People collection must be deduplicated");
  for (const id of expected) assert.ok(idSet.has(id), `${id} must resolve through getPeopleForPlace('torggata')`);
  assert.ok(ids.length >= expected.length, "later source-backed People may extend the collection; closeout must not impose a maximum quota");
});

test("no completed 8A person is hidden from the Torggata People round", () => {
  const byId = new Map(people.map(person => [String(person?.id || "").trim(), person]));
  for (const id of expected) {
    const person = byId.get(id);
    assert.ok(person, `${id} must exist in manifest data`);
    const holdbacks = Array.isArray(person.roundHoldbacks) ? person.roundHoldbacks.map(String) : [];
    assert.equal(holdbacks.includes("torggata"), false, `${id} must not be held back from Torggata after approval`);
  }
});

test("PlaceCard People list and preview consume getPeopleForPlace rather than a legacy curation field", () => {
  const source = fs.readFileSync(path.join(ROOT, "js/ui/place-card.js"), "utf8");
  assert.match(source, /const persons = getPeopleForPlace\(place\.id\);/);
  assert.match(source, /data-person=/);
  assert.match(source, /const p0 = persons\?\.find/);
  assert.match(source, /setRoundLabel\(peopleIcon, "👥", persons\.length\)/);
  assert.doesNotMatch(source, /Canonical explicit curation wins/);
});

test("Torggata category-four grid keeps People as the first of four content rounds", async () => {
  const roundsSource = fs.readFileSync(path.join(ROOT, "js/ui/place-rounds-visual-collections.js"), "utf8");
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="torggata">
      <div class="pc-body"><div class="pc-title-row"><h2>Torggata</h2></div>
      <div class="pc-icons-quad">
        <div id="pcPeopleIcon" class="pc-round"></div>
        <div id="pcBadgesIcon" class="pc-round"></div>
        <div id="pcBrandsIcon" class="pc-round"></div>
      </div>
      <div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div>
      </div>
    </div></body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  w.PLACES = [{ id: "torggata", category: "by", image: "torggata.jpg" }];
  w.eval(roundsSource);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  await w.HGVisualPlaceRounds.apply(w.PLACES[0]);
  const grid = w.document.querySelector(".pc-icons-quad");
  const visible = [...grid.querySelectorAll(".pc-round")].filter(el => !el.hidden).sort((a, b) => Number(a.style.order) - Number(b.style.order));
  assert.equal(grid.dataset.roundCount, "4");
  assert.equal(visible.length, 4);
  assert.equal(visible[0].id, "pcPeopleIcon");
  assert.deepEqual(visible.map(el => el.id), ["pcPeopleIcon", "pcObjectsIcon", "pcBrandsIcon", "pcCategoryCollectionIcon"]);
  assert.equal(w.document.getElementById("pcBadgesIcon").parentElement.className, "pc-title-row");
  dom.window.close();
});
