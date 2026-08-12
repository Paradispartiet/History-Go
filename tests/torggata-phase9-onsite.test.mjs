import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const read = file => fs.readFileSync(file, "utf8");
const json = file => JSON.parse(read(file));
const place = json("data/places/by/oslo/places/torggata.json");
const onsite = json("data/categories/place_onsite_contract.json");
const socialRows = json("data/social/place_social/oslo/place_social.json");
const canonicalEvents = json("data/social/events/oslo/canonical_events.json");
const runtime = read("js/ui/place-onsite-surface.js");

test("Torggata fase 9 migrerer legacy tasks_profile og bruker canonical by-policy", () => {
  assert.equal(place.id, "torggata");
  assert.equal(place.category, "by");
  assert.deepEqual(onsite.categoryPolicy.by, {
    events: "always",
    "social-meet": "always",
    "knowledge-meet": "always",
    play: "never"
  });
  for (const field of ["events", "tasks_profile", "training_profile", "play_profile"]) {
    assert.equal(Object.hasOwn(place, field), false, field);
  }
  assert.ok(onsite.excludedConcepts.tasks);
  assert.ok(onsite.excludedConcepts.training);
  const text = JSON.stringify(place);
  assert.doesNotMatch(text, /torggata_task_|gateprofil-oppgaven|oppgaven Les aktørene|\x60tasks_profile\x60/);
});

test("Torggata beholder relevante fysiske spor etter task-migrasjonen", () => {
  const objects = new Map((place.civication_store || []).map(item => [item.id, item]));
  assert.match(objects.get("torggata_sykkel_gagate_symbol")?.unlock || "", /før\/nå-kortet om gateprofilen/);
  assert.match(objects.get("torggata_serveringssone_markor")?.unlock || "", /gate- og bylivsprofilen/);
  const redesign = (place.works || []).find(work => work.id === "torggata_work_miljogate_ombygging");
  assert.ok(redesign);
  assert.doesNotMatch(redesign.source_note, /tasks_profile/);
  assert.match(redesign.source_note, /for_na/);
  assert.match(redesign.source_note, /quiz_profile/);
  assert.match(redesign.source_note, /civication_store/);
});

test("Torggata har ingen registrert canonical event og viser gyldig tomtilstand", () => {
  assert.equal(socialRows.some(row => row.place_id === "torggata"), false);
  assert.deepEqual(canonicalEvents.filter(event => event.place_id === "torggata"), []);
  assert.match(runtime, /Ingen aktuelle events registrert her ennå/);
});

test("Torggata På stedet renderer fast hovedrad og place-bundne møteflows", async () => {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="torggata"><div id="pcEventsBox"><div class="pc-events-head"></div></div></div></body>', {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const w = dom.window;
  w.PLACES = [place];
  w.__HG_CANONICAL_SOCIAL_EVENTS__ = [];
  w.fetch = async () => ({ ok: true, json: async () => onsite });

  let popup = null;
  let socialOpen = null;
  let knowledgeOpen = null;
  w.showPlaceCardRoundPopup = payload => { popup = payload; };
  w.HG_SocialMeetUI = { open: payload => { socialOpen = payload; } };
  w.HG_SpotmeetingUI = { open: payload => { knowledgeOpen = payload; } };

  w.eval(runtime);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  await Promise.resolve();
  await Promise.resolve();
  w.HGPlaceOnSiteSurface.decorate(true);

  const labels = Array.from(w.document.querySelectorAll("[data-hg-onsite-action] .pc-onsite-action-label"), node => node.textContent.trim());
  assert.deepEqual(labels, ["Events", "Avtal å møtes", "Kunnskapsmøte", "Mer"]);

  w.document.querySelector('[data-hg-onsite-action="events"]').click();
  assert.equal(popup.title, "Events");
  assert.match(popup.html, /Ingen aktuelle events registrert her ennå/);

  w.document.querySelector('[data-hg-onsite-action="social-meet"]').click();
  assert.equal(socialOpen.filter, "place");
  assert.equal(socialOpen.placeId, "torggata");

  w.document.querySelector('[data-hg-onsite-action="knowledge-meet"]').click();
  assert.equal(knowledgeOpen.contextType, "place");
  assert.equal(knowledgeOpen.contextId, "torggata");

  w.document.querySelector('[data-hg-onsite-action="more"]').click();
  assert.equal(popup.title, "Mer");
  assert.match(popup.html, /Ingen flere funksjoner for dette stedet/);
  dom.window.close();
});

test("onsite-runtime eksponerer ikke forbudte stedbaserte personsignaler", () => {
  assert.doesNotMatch(runtime, /nearby users|nearby people|distance-to-person|public visit history|last seen/i);
  assert.doesNotMatch(runtime, /navigator\.geolocation|getCurrentPosition|watchPosition/);
});
