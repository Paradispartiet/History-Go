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
    play: "never"
  });
  assert.equal(onsite.movedSurfaces.events, "PlaceCard → Utforsk → Events");
  assert.match(onsite.movedSurfaces["social-meet"], /PlaceCard → Utforsk → Møtes/);
  assert.match(onsite.movedSurfaces["knowledge-meet"], /PlaceCard → Utforsk → Møtes/);
  for (const field of ["events", "tasks_profile", "training_profile", "play_profile"]) {
    assert.equal(Object.hasOwn(place, field), false, field);
  }
  assert.ok(onsite.excludedConcepts.tasks);
  assert.ok(onsite.excludedConcepts.training);
  const text = JSON.stringify(place);
  assert.doesNotMatch(text, /torggata_task_|gateprofil-oppgaven|oppgaven Les aktørene|`tasks_profile`/);
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

test("Torggata har ingen registrert canonical event, men PlaceCard beholder Events-snarveien", () => {
  assert.equal(socialRows.some(row => row.place_id === "torggata"), false);
  assert.deepEqual(canonicalEvents.filter(event => event.place_id === "torggata"), []);
  assert.match(runtime, /HGEvents/);
  assert.match(runtime, /CORE_SHORTCUTS = \["events", "meet"\]/);
});

test("Torggata PlaceCard viser Events og Møtes og begge er klikkbare", async () => {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="torggata"><div id="pcEventsBox"><div class="pc-events-head"></div></div></div></body>', {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const w = dom.window;
  w.PLACES = [place];
  w.fetch = async () => ({ ok: true, json: async () => onsite });
  w.HGEvents = {
    ready: true,
    init: async () => w.HGEvents,
    getUpcomingByPlace: () => []
  };

  const popups = [];
  w.showPlaceCardRoundPopup = options => {
    popups.push(options);
    const host = w.document.createElement("div");
    host.id = "testPopup";
    host.innerHTML = options.html || "";
    w.document.body.appendChild(host);
  };
  const socialCalls = [];
  const proposeCalls = [];
  w.HG_SocialMeetUI = { open: options => socialCalls.push(options) };
  w.HG_SpotmeetingUI = { open: options => proposeCalls.push(options) };

  w.eval(runtime);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  await Promise.resolve();
  await Promise.resolve();
  w.HGPlaceOnSiteSurface.decorate(true);

  const actions = Array.from(w.document.querySelectorAll("[data-hg-onsite-action]")).map(node => node.getAttribute("data-hg-onsite-action"));
  assert.deepEqual(actions, ["events", "meet"]);
  assert.equal(w.document.getElementById("pcEventsBox").hidden, false);

  w.document.querySelector('[data-hg-onsite-action="events"]').click();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(popups.at(-1)?.kind, "events");
  assert.match(popups.at(-1)?.html || "", /Ingen kommende events/);

  w.document.querySelector('[data-hg-onsite-action="meet"]').click();
  assert.equal(proposeCalls.length, 1);
  assert.equal(proposeCalls[0].contextType, "place");
  assert.equal(proposeCalls[0].contextId, "torggata");
  assert.equal(proposeCalls[0].sourceSurface, "placeCardOnSite");
  assert.equal(proposeCalls[0].preferredAction, "match");
  assert.equal(socialCalls.length, 0, "Møtes goes to candidate discovery before Social Meet follow-up");
  assert.equal(popups.at(-1)?.kind, "events", "Møtes no longer opens the intermediate hub popup");

  dom.window.close();
});

test("onsite-runtime eksponerer ikke forbudte stedbaserte personsignaler", () => {
  assert.doesNotMatch(runtime, /nearby users|nearby people|distance-to-person|public visit history|last seen/i);
  assert.doesNotMatch(runtime, /navigator\.geolocation|getCurrentPosition|watchPosition/);
});
