#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const read = (file) => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const welcome = read("js/ui/onboarding-welcome.js");
const stories = read("js/stories/stories_loader.js");
const psychology = read("js/ui/psychology-room-entry.js");
const css = read("css/onboarding.css");
const workflow = read(".github/workflows/history-go-welcome-toast.yml");

for (const action of ["nearby", "stories", "lesespor", "psychology"]) {
  assert.ok(welcome.includes('data-hg-welcome-action="' + action + '"'), action);
}
assert.match(welcome, /href="profile.html"/);
assert.match(welcome, /href="knowledge.html"/);
assert.match(welcome, /href="Civication.html"/);
assert.match(welcome, /<ul class="hg-onb-steps">/);
assert.match(welcome, /\.hg-onb-card-link\[href\]/, "page links must persist welcome dismissal");
assert.doesNotMatch(welcome, /stedskort|quizkort|testmodus/i);
assert.match(stories, /async openAll\(\)/);
assert.match(stories, /hgWelcomeStoriesSearch/);
assert.match(stories, /class="hg-welcome-stories-back" type="button" data-close-popup/, "Stories arrow uses the canonical popup dismissal");
assert.match(stories, /aria-label="Tilbake til kartet"/, "Stories return is accessible");
assert.match(css, /\.hg-welcome-stories-back\s*\{/, "Stories return has compact styling");
const psychologyRoom = read("js/psychologyRoom.js");
const psychologyStyles = read("css/psychologyRoom.css");
assert.match(psychologyRoom, /psychology-room-back psychology-room-back-nav/, "Psychology internal back is arrow-only");
assert.match(psychologyRoom, /aria-label="Tilbake til 7-dagersløpet"/, "Path back has an accessible destination");
assert.match(psychologyStyles, /\.psychology-room-back\.psychology-room-back-nav/, "Only navigation buttons are made compact");
assert.match(psychologyRoom, /data-psych-clear-workbench="1"/, "Other psychology actions are not changed");

assert.match(stories, /index.html#\/place\//);
assert.match(psychology, /HGPsychologyRoomEntry = \{ open: openRoom \}/);
assert.ok(welcome.includes("async function openPsychologyRoom()"));
assert.ok(welcome.includes('script.src = "js/ui/psychology-room-entry.js"'));
assert.doesNotMatch(read("js/app.js"), /loadPsychologyRoomEntry/,
  "Keep the psychology-room entry deferred to avoid changing map boot timing");
assert.match(css, /hg-onb-card-link/);
assert.match(workflow, /history-go-onboarding-destination-links\.test\.js/);

const observed = { toMap: 0, places: [], locationRequests: 0, toasts: [], userMap: 0 };
const context = {
  console,
  window: {
    PLACES: [
      { id: "far", lat: 59.92, lon: 10.76 },
      { id: "near", lat: 59.9131, lon: 10.7521 },
      { id: "hidden", lat: 59.913, lon: 10.752, hidden: true },
      { id: "invalid", lat: null, lon: NaN }
    ],
    distMeters: (a, b) => Math.abs(a.lat - b.lat) + Math.abs(a.lon - b.lon),
    HGPos: {
      getPos: () => ({ lat: 59.913, lon: 10.752 }),
      request: async () => { observed.locationRequests++; return null; }
    },
    HGAppRouter: {
      toMap: () => { observed.toMap++; },
      toPlace: id => { observed.places.push(id); }
    },
    HGMap: { setUser: () => { observed.userMap++; } },
    showToast: text => observed.toasts.push(text),
    dispatchEvent: () => {}
  },
  document: { readyState: "loading", addEventListener: () => {} },
  localStorage: { setItem: () => {}, getItem: () => "1" },
  Event: class Event {}
};
vm.runInNewContext(welcome, context);
const api = context.window.HGOnboarding;
assert.ok(api);

(async () => {
  assert.equal(api.nearestPlace({lat: 59.913, lon: 10.752}, context.window.PLACES).id, "near");
  assert.equal(api.nearestPlace(null, context.window.PLACES), null);
  assert.equal(api.nearestPlace({lat:0, lon:0}, [{id:"missing",lat:null,lon:null}]), null,
    "unmapped places with null coordinates must not be treated as 0,0");
  assert.equal(api.nearestPlace({lat:0, lon:0}, [{id:"invalid-status",lat:0,lon:0,coordStatus:"invalid"}]), null,
    "explicitly invalid coordinate records must be excluded");
  assert.equal(await api.openNearestPlace(), true);
  assert.equal(observed.toMap, 1);
  assert.deepEqual(observed.places, ["near"]);
  assert.equal(observed.locationRequests, 0, "cached map position should be used without another permission prompt");

  context.window.HGPos.getPos = () => null;
  context.window.HGPos.request = async () => { observed.locationRequests++; return null; };
  assert.equal(await api.openNearestPlace(), false);
  assert.equal(observed.locationRequests, 1);
  assert.equal(observed.places.length, 1, "do not open a random location when GPS is denied");
  assert.match(observed.toasts[observed.toasts.length - 1], /Tillat posisjon/);

  context.window.HGPos.request = async () => { observed.locationRequests++; return {lat: 59.913, lon: 10.752}; };
  assert.equal(await api.openNearestPlace(), true);
  assert.deepEqual(observed.places, ["near","near"]);

  assert.doesNotMatch(welcome, /saveVisitedFromQuiz|recordVisit|unlockByQuiz/,
    "welcome navigation must not grant visits");
  console.log("welcome destinations and nearest-place behavior ok");
})().catch(error => { console.error(error); process.exitCode = 1; });
