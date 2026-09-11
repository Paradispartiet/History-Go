import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const json = path => JSON.parse(read(path));

const index = read("index.html");
const source = read("js/ui/leftPanelMode.ts");
const bundle = read("dist/web/leftPanelMode.js");
const onsite = read("js/ui/place-onsite-surface.js");
const socialUi = read("js/social/HGSocialMeetUI.js");
const contract = json("data/categories/place_onsite_contract.json");

test("Utforsk eier Events og én samlet Møtes-inngang", () => {
  assert.match(index, /data-leftmode="events"[^>]*>Events</);
  assert.match(index, /data-leftmode="social"[^>]*>Møtes</);
  assert.match(index, /id="leftEventsList"/);
  assert.match(index, /id="leftSocialList"/);
  assert.doesNotMatch(index, /id="btnSocialMeet"/);

  assert.match(source, /events:\s*"leftEventsList"/);
  assert.match(source, /social:\s*"leftSocialList"/);
  assert.match(bundle, /events:\s*"leftEventsList"/);
  assert.match(bundle, /social:\s*"leftSocialList"/);
});

test("Møtes samler oppstart og oppfølging uten å slå sammen domenemotorene", () => {
  assert.match(source, /Foreslå kunnskapsmøte/);
  assert.match(source, /Mine møter/);
  assert.match(source, /HG_SpotmeetingUI/);
  assert.match(source, /HG_SocialMeetUI/);
  assert.match(source, /sourceSurface:\s*"explorePanel"/);
  assert.match(source, /data-explore-social-action="propose"/);
  assert.match(source, /data-explore-social-action="manage"/);

  assert.match(bundle, /data-explore-social-action="propose"/);
  assert.match(bundle, /data-explore-social-action="manage"/);
  assert.match(bundle, /HG_SpotmeetingUI/);
  assert.match(bundle, /HG_SocialMeetUI/);
});

test("Events rendres fra canonical HGEvents og åpner canonical Place", () => {
  assert.match(source, /HGEvents/);
  assert.match(source, /eventsRuntime\.init/);
  assert.match(source, /eventIsCurrent/);
  assert.match(source, /HGMapView\.openPlace/);
  assert.match(source, /data-explore-event-place/);
  assert.doesNotMatch(source, /navigator\.geolocation|nearby users|distance-to-person/i);
});

test("PlaceCard På stedet kan ikke reintrodusere events eller møteflater", () => {
  assert.equal(contract.movedSurfaces.events, "Utforsk → Events");
  assert.match(contract.movedSurfaces["social-meet"], /Utforsk → Møtes/);
  assert.match(contract.movedSurfaces["knowledge-meet"], /Utforsk → Møtes/);
  assert.doesNotMatch(onsite, /HGEvents|HG_SocialMeetUI|HG_SpotmeetingUI|Avtal å møtes|Kunnskapsmøte/);
  assert.doesNotMatch(socialUi, /renderPlaceSummary|insertAdjacentHTML\(['"]beforeend['"],\s*html\)/);
  assert.match(socialUi, /data-hg-social-meet-onsite/);
  assert.match(socialUi, /node\.remove\(\)/);
});
