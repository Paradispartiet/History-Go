import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = path => JSON.parse(fs.readFileSync(path, "utf8"));
const placePath = "data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/toyen_trafo.json";
const storyPath = "data/stories/stories_toyen_trafo.json";
const place = read(placePath);
const runtime = read("data/runtime/place-open/toyen_trafo.json");
const stories = read(storyPath);
const report = read("reports/place-production/toyen-trafo-objects-20261104.json");

test("Tøyen trafo refuses to misclassify architectural details as Objects", () => {
  assert.equal(place.id, "toyen_trafo");
  assert.equal(place.objects, undefined);
  assert.equal(place.place_card_profile, undefined);
  assert.equal(runtime.place.objects, undefined);
  assert.equal(runtime.objects, undefined);
  assert.equal(runtime.place_card_profile, undefined);
  assert.equal(report.objects_status, "SOURCE-BOUNDED HOLDBACK");
  assert.equal(report.objects_accepted.length, 0);
  assert.equal(report.objects_held_back.length, 3);
  assert.match(report.rule_authority, /PLACE_OBJECTS_CANONICAL/);
  assert.equal(report.not_vferdig, true);
});

test("Architectural detail illustration is shown as marked Story art, never as Object", () => {
  assert.equal(stories.length, 1);
  const story = stories[0];
  assert.equal(story.place_id, "toyen_trafo");
  assert.equal(story.image, report.story_image);
  assert.equal(story.imageMeta.imageKind, "illustration");
  assert.match(story.imageMeta.caption, /Illustrasjon – ikke fotografi/);
  assert.equal(story.imageMeta.license, "CC0 1.0");
  assert.ok(story.imageMeta.sourcePage.startsWith("https://"));
  assert.match(story.imageMeta.disclosure, /ikke fotografi/i);
  const bytes = fs.readFileSync(story.image, "utf8");
  assert.match(bytes, /<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(bytes, /ILLUSTRASJON – IKKE FOTOGRAFI/);
  assert.doesNotMatch(bytes, /<script\b|<foreignObject\b|\bonload\s*=|\bonerror\s*=/i);
  const renderedStory = runtime.stories.find(x => x.id === story.id);
  assert.ok(renderedStory, "Story must be attached to actual Place-open");
  assert.equal(renderedStory.image, story.image);
  assert.deepEqual(runtime.people, []);
  assert.deepEqual(runtime.brands, []);
  assert.equal(runtime.language.entries.length, 6);
  assert.equal(runtime.lesespor.length, 4, "Preserve four independently merged source-backed Lesespor");
  assert.equal(runtime.leksikon.length, 1);
});
