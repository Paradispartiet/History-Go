import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const placeFile = "data/places/kunst/oslo/places_kunst_oslo_oppdag_kvadraturen_art_sites_batch_01/skulptursonen_ovre_slottsgate.json";
const place = read(placeFile);

test("Skulptursonen keeps the verified linear-area identity and coordinates", () => {
  assert.equal(place.id, "skulptursonen_ovre_slottsgate");
  assert.equal(place.lat, 59.9112353280587);
  assert.equal(place.lon, 10.740582917313654);
  assert.equal(place.locatorType, "linear_area");
  assert.equal(place.anchors.length, 2);
  assert.match(place.popupDesc, /2019–2024/);
  assert.match(place.popupDesc, /ikke som en påstand om dagens installasjon/i);
});

test("Skulptursonen exposes exactly four curated collection families", () => {
  const production = read("data/places/production/skulptursonen_ovre_slottsgate.json");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "productions"]);
  assert.deepEqual(production.collections, {
    people: ["vibeke_tandberg"],
    objects: ["skulptursonen_planskisse_2019"],
    brands: ["norsk_billedhoggerforening"],
    productions: ["skulptursonen_hestebarrikade_2023", "skulptursonen_du_ma_ikke_sove_2023", "skulptursonen_what_money_can_buy_2023"]
  });
});

test("the signature plan object and three historical works are explicit", () => {
  assert.equal(place.objects.length, 1);
  assert.equal(place.objects[0].type, "planskisse");
  assert.deepEqual(place.productions.map((item) => item.year), [2023, 2023, 2023]);
  assert.deepEqual(place.productions.map((item) => item.artist), ["Vibeke Tandberg", "Ingrid Solvik", "Yamile Calderon"]);
});

test("People and Brand manifests bind the documented external actors", () => {
  const people = read("data/people/manifest.json");
  const brands = read("data/brands/brands_by_place.json");
  assert.deepEqual(people.priorityFilesByPlace.skulptursonen_ovre_slottsgate, ["people/kunst/oslo/skulptursonen_ovre_slottsgate/vibeke_tandberg.json"]);
  assert.deepEqual(brands.skulptursonen_ovre_slottsgate, ["norsk_billedhoggerforening"]);
});

test("language, Story, reading tracks and Fagverk are complete", () => {
  assert.equal(read("data/leksikon/sprak/places/europe/norway/oslo/skulptursonen_ovre_slottsgate.json").entries.length, 6);
  assert.equal(read("data/stories/stories_skulptursonen_ovre_slottsgate.json").length, 1);
  assert.equal(place.reading_track_ids.length, 4);
  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.article.length, 3);
});

test("the place-owned Fagverk UI renders as curated Kunst content", async () => {
  const html = fs.readFileSync("fagverk-sted.html", "utf8").replace(/<script[\s\S]*?<\/body>/u, "</body>");
  const runtime = fs.readFileSync("js/fagverk-sted.js", "utf8");
  const registry = read("data/fagverk/fagverk_registry.json");
  const emners = place.fagverk.emne_ids.map((id, index) => ({
    id,
    domainId: `kunst_dom_${index + 1}`,
    title: `Kunst-emne ${index + 1}`,
    definition: `Canonical Kunst-definisjon ${index + 1}.`,
    concepts: [place.fagverk.concepts[index]],
    keyQuestions: []
  }));
  const domains = emners.map((emne) => ({ id: emne.domainId, label: emne.domainId, definition: emne.definition }));
  const dom = new JSDOM(html, { runScripts: "outside-only", url: `https://history-go.test/fagverk-sted.html?place=${place.id}` });
  const { window } = dom;
  window.fetch = async () => ({ ok: true, json: async () => registry });
  window.DataHub = { loadFullPlace: async () => place, loadPlacesBase: async () => [place] };
  window.HGFagverkSubjectModel = {
    load: async () => ({ subject: { id: "kunst", title: "Kunst" }, emners, emnersById: new Map(emners.map((emne) => [emne.id, emne])), domains, domainsById: new Map(domains.map((domain) => [domain.id, domain])), chapters: [] }),
    subjectUrl: (subject, extras = {}) => `fagverk.html?${new URLSearchParams({ subject, ...extras })}`,
    domainUrl: (subject, domain, extras = {}) => `fagverk.html?${new URLSearchParams({ subject, domain, ...extras })}`,
    emneUrl: (subject, domain, emne, extras = {}) => `fagverk.html?${new URLSearchParams({ subject, domain, emne, ...extras })}`,
    chapterUrl: (subject, chapter, extras = {}) => `fagverk.html?${new URLSearchParams({ subject, chapter, ...extras })}`
  };
  const ready = new Promise((resolve) => window.addEventListener("hg:fagverk-place-ready", resolve, { once: true }));
  window.eval(runtime);
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));
  await ready;
  const { document } = window;
  assert.equal(document.querySelector("#fagverkPlaceTitle").textContent, "Skulptursonen i Øvre Slottsgate");
  assert.match(document.querySelector("#fagverkPlaceCoverageStatus").textContent, /kuratert stedsfagverk/i);
  assert.equal(document.querySelector("#fagverkPlaceUnfinished").hidden, true);
  assert.equal(document.querySelectorAll("#fagverkPlaceArticle p").length, 3);
  assert.equal(document.querySelectorAll("#fagverkPlaceLenses a").length, 3);
  assert.equal(document.querySelectorAll("#fagverkPlaceQuestions li").length, 5);
  assert.equal(document.querySelectorAll("#fagverkPlaceTraces article").length, 2);
  assert.equal(document.querySelectorAll("#fagverkPlaceSources a").length, 6);
  assert.ok([...document.querySelectorAll("#fagverkPlaceLenses a")].every((link) => link.href.includes("subject=kunst") && link.href.includes(`place=${place.id}`) && link.href.includes("emne=em_kunst_")));
  dom.window.close();
});

test("quiz is normal 4x7 with fourteen direct opening facts", () => {
  const quiz = read("data/quiz/kunst/skulptursonen_ovre_slottsgate_sets.json");
  assert.equal(quiz.sets.length, 4);
  assert.ok(quiz.sets.every((set) => set.questions.length === 7));
  const questions = quiz.sets.flatMap((set) => set.questions);
  assert.ok(questions.slice(0, 14).every((question) => question.question_type === "fact"));
  assert.ok(questions.every((question) => new Set(["fact", "context", "analysis", "concept"]).has(question.question_type)));
  assert.ok(questions.every((question) => question.knowledge_link_status === "linked"));
});

test("final theory question is bound to the Kunst contract", () => {
  const quiz = read("data/quiz/kunst/skulptursonen_ovre_slottsgate_sets.json");
  const final = quiz.sets.at(-1).questions.at(-1);
  assert.equal(final.topic_hook_id, "institusjonell_legitimering");
  assert.equal(final.method_id, "met_kunst_institusjonsanalyse");
  assert.equal(final.thinker_id, "boris_groys");
  assert.equal(final.theory_ref.work, "Art Power");
});
