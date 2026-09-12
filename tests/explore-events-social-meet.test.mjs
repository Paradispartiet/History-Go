import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const read = path => fs.readFileSync(path, "utf8");
const json = path => JSON.parse(read(path));

const index = read("index.html");
const app = read("js/app.js");
const source = read("js/ui/leftPanelMode.ts");
const bundle = read("dist/web/leftPanelMode.js");
const onsite = read("js/ui/place-onsite-surface.js");
const nearbyCss = read("css/nearby.css");
const headerMenu = read("js/ui/header-menu.js");
const socialUi = read("js/social/HGSocialMeetUI.js");
const contract = json("data/categories/place_onsite_contract.json");

test("Utforsk har rundingene øverst og Events/Møtes i egen rad under", () => {
  const dom = new JSDOM(index);
  const primaryModes = Array.from(dom.window.document.querySelectorAll(".nearby-tabs [data-leftmode]"))
    .map(node => node.getAttribute("data-leftmode"));
  const secondaryModes = Array.from(dom.window.document.querySelectorAll(".explore-secondary-actions [data-leftmode]"))
    .map(node => node.getAttribute("data-leftmode"));

  assert.deepEqual(primaryModes, ["nearby", "people", "nature", "routes", "badges"]);
  assert.deepEqual(secondaryModes, ["events", "social"]);
  assert.match(index, /id="leftEventsList"/);
  assert.match(index, /id="leftSocialList"/);
  assert.match(index, /id="btnSocialMeet"/);
  assert.match(index, /Møtes \/ Social Meet/);
  assert.match(nearbyCss, /\.explore-secondary-actions\{/);
  assert.match(nearbyCss, /\.explore-secondary-tab\{/);

  assert.match(source, /events:\s*"leftEventsList"/);
  assert.match(source, /social:\s*"leftSocialList"/);
  assert.match(bundle, /events:\s*"leftEventsList"/);
  assert.match(bundle, /social:\s*"leftSocialList"/);
  dom.window.close();
});

test("index laster de faktiske Events-, Social Meet- og PlaceCard-runtimene", () => {
  assert.match(app, /loadHGSocialMeetUI[\s\S]*js\/social\/HGSocialMeetUI\.js\?v=20260912-live-surfaces2/);
  assert.match(app, /loadEventsRuntime[\s\S]*js\/events\/events_loader\.js\?v=20260912-live-surfaces2/);
  assert.match(app, /loadPlaceOnsiteSurface[\\s\\S]*js\\/ui\\/place-onsite-surface\\.js\\?v=20260912-explore-secondary-row1/);
  assert.match(app, /loadPlaceCard[\s\S]*js\/ui\/place-card\.js\?v=20260912-live-surfaces2/);
  assert.match(app, /dist\/web\/leftPanelMode\.js\?v=20260912-live-surfaces2/);
  assert.match(app, /dist\/web\/left-panel\.js\?v=20260912-live-surfaces2/);
  assert.match(index, /css\\/place-onsite-surface\\.css\\?v=20260912-live-surfaces2/);
  assert.match(index, /js\/ui\/header-menu\.js\?v=20260912-live-surfaces2/);
  assert.match(index, /js\\/app\\.js\\?v=20260912-explore-secondary-row1/);
});

test("header-Møtes åpner Social Meet direkte og er ikke avhengig av Utforsk", () => {
  assert.match(headerMenu, /HG_SocialMeetUI\?\.open/);
  assert.match(headerMenu, /sourceSurface:\s*"headerMenu"/);

  const dom = new JSDOM(`<!doctype html><body>
    <div id="headerMenu">
      <button id="headerMenuButton" type="button"></button>
      <div id="headerMenuPanel" hidden>
        <div class="header-menu-actions">
          <button id="btnSocialMeet" type="button">Møtes</button>
        </div>
      </div>
    </div>
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });

  const calls = [];
  dom.window.HG_SocialMeetUI = { open: options => calls.push(options) };
  dom.window.eval(headerMenu);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded", { bubbles: true }));
  dom.window.document.getElementById("btnSocialMeet").click();

  assert.equal(calls.length, 1);
  assert.equal(calls[0].filter, "all");
  assert.equal(calls[0].sourceSurface, "headerMenu");
  dom.window.close();
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

test("Events rendres fra canonical HGEvents i Utforsk, ikke i PlaceCard", () => {
  assert.match(source, /HGEvents/);
  assert.match(source, /eventsRuntime\.init/);
  assert.match(source, /eventIsCurrent/);
  assert.match(source, /HGMapView\.openPlace/);
  assert.match(source, /data-explore-event-place/);

  assert.doesNotMatch(onsite, /global\.HGEvents|openEvents|getUpcomingByPlace/);
  assert.doesNotMatch(source, /navigator\.geolocation|nearby users|distance-to-person/i);
  assert.doesNotMatch(onsite, /navigator\.geolocation|nearby users|distance-to-person/i);
});

test("PlaceCard-kjernen kan ikke skjule eller tømme onsite-flaten etter render", () => {
  const placeCard = read("js/ui/place-card.js");
  assert.doesNotMatch(placeCard, /eventsBox\.hidden\s*=\s*true/);
  assert.doesNotMatch(placeCard, /LEGACY EVENTS \/ SOCIAL PLACE-CARD SURFACE RETIRED/);
  assert.match(placeCard, /HGPlaceOnSiteSurface\?\.decorate\?\.\(true\)/);
});

test("PlaceCard eksponerer ikke globale Events/Møtes-flater", () => {
  assert.equal(contract.movedSurfaces.events, "Utforsk → Events");
  assert.match(contract.movedSurfaces["social-meet"], /Utforsk → Møtes/);
  assert.doesNotMatch(onsite, /CORE_SHORTCUTS|data-hg-meet-hub-action|HG_SocialMeetUI|HG_SpotmeetingUI|openEvents/);

  // Social Meet skal fortsatt rydde eventuelle gamle injeksjoner ut av PlaceCard.
  assert.doesNotMatch(socialUi, /renderPlaceSummary|insertAdjacentHTML\(['"]beforeend['"],\s*html\)/);
  assert.match(socialUi, /data-hg-social-meet-onsite/);
  assert.match(socialUi, /node\.remove\(\)/);
});
