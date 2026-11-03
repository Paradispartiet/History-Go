import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const storyId = "st_rockefeller_folkets_hus_ble_konsertscene"; // stable legacy ID for saved progress
const loadStory = () => load("data/stories/stories_rockefeller.json")[0];

test("Rockefeller story distinguishes Torggata bad from Folkets Hus and preserves its ID", () => {
  const story = loadStory();
  assert.equal(story.id, storyId);
  assert.equal(story.place_id, "rockefeller");
  assert.equal(story.year, 1986);
  assert.equal(story.title, "Torggata bad ble konsertscene");
  assert.match(story.summary, /14\. mars 1986/);
  assert.match(story.story, /Torggata bad/);
  assert.match(story.story, /Mariboes gate 5B/);
  assert.match(story.story, /Jonas Fjeld-band/);
  assert.match(story.story, /John Dee/);
  assert.match(story.story, /Folkets Hus.*separat bygning/);
  assert.doesNotMatch(story.story, /(?:åpnet|lokalisert|etablert).*i Folkets Hus-komplekset/i);
  for (const key of ["start", "middle", "end"]) {
    assert.doesNotMatch(story.arc[key], /Folkets Hus-komplekset/);
  }
  assert.ok(story.sources.length >= 3);
  assert.ok(story.sources.every(s => /^https:\/\//.test(s.url) && s.title));
  assert.ok(story.sources.some(s => s.url === "https://oslobyleksikon.no/side/Rockefeller"));
  assert.ok(story.sources.some(s => s.url === "https://www.rockefeller.no/om-oss"));
});

test("Story manifest, sharded runtime and Place-open retain the same single corrected Story", () => {
  const s = loadStory();
  const manifest = load("data/stories/stories_manifest_music_batch_01.json");
  const shard = load("data/runtime/stories-all/part-005.json");
  const open = load("data/runtime/place-open/rockefeller.json");
  const registry = manifest.files.filter(e => e.path === "data/stories/stories_rockefeller.json");
  assert.equal(registry.length, 1);
  assert.equal(registry[0].entity_id, "rockefeller");
  const stored = shard.filter(x => x.id === storyId);
  assert.equal(stored.length, 1);
  assert.deepEqual(stored[0], s);
  assert.equal(open.stories.length, 1);
  assert.deepEqual(open.stories[0], s);
  assert.equal(open.place.id, "rockefeller");
  assert.deepEqual(open.people.map(p => p.id), ["mari_boine", "joachim_nielsen", "morten_harket"]);
  assert.deepEqual(open.brands, []); // no invented commercial brand
});

test("Source-backed epoch index contains the correct Rockefeller turning point", () => {
  const index = load("data/epoker/epoke-place-index.json");
  const groups = Object.values(index.domains.historie.epochs);
  const matching = groups.flatMap(g => g.places || [])
    .filter(p => p.place_id === "rockefeller")
    .flatMap(p => p.milestones || [])
    .filter(m => m.story_id === storyId);
  assert.equal(matching.length, 1);
  assert.equal(matching[0].year, 1986);
  assert.equal(matching[0].title, "Torggata bad ble konsertscene");
  assert.ok(matching[0].sources.some(s => s.url === "https://oslobyleksikon.no/side/Rockefeller"));
  assert.doesNotMatch(matching[0].title, /Folkets Hus/);
});

test("Rockefeller's 22 verified place claims, 30 fullquiz questions, 10 QuizCard questions and photos remain", () => {
  const production = load("data/places/production/rockefeller.json");
  const place = load("data/places/musikk/oslo/places_musikk/rockefeller.json");
  const open = load("data/runtime/place-open/rockefeller.json");
  const quiz = load("data/quiz/musikk/rockefeller_sets_merged.json");
  const cards = load("data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json");
  const questions = quiz.sets.flatMap(s => s.questions);
  const byId = new Map(questions.map(q => [q.id, q]));
  const card = cards.cards.find(x => x.targetId === "rockefeller");
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.claims.length, 22);
  assert.equal(quiz.sets.length, 5);
  assert.equal(questions.length, 30);
  assert.equal(byId.size, 30);
  assert.ok(questions.every(q => q.knowledge_link_status === "linked"));
  assert.equal(card?.questions.length, 10);
  for (const c of card.questions) {
    const q = byId.get(c.sourceQuestionId);
    assert.ok(q);
    assert.equal(c.question, q.question);
    assert.deepEqual(c.options, q.options);
    assert.equal(c.answer, q.answer);
  }
  for (const key of ["name", "lat", "lon", "address", "desc", "popupDesc", "image", "frontImage", "cardImage", "imageCredit", "imageLicense", "imageSourceUrl"]) {
    assert.deepEqual(open.place[key], place[key], `Place mismatch: ${key}`);
  }
  assert.equal(place.address.number, "5B");
  assert.equal(place.imageLicense, "CC BY-SA 4.0");
});
